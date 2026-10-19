const createError = require('http-errors');
const CartModel = require('../models/cart');
const OrderModel = require('../models/order');
const OrderItemModel = require('../models/orderItem');
const CartItemModel = require('../models/cartItem');
const ProductModel = require('../models/product');
const OrderService = require('./OrderService');
const db = require('../db');
const { cardFromCharge, paymentFailure } = require('../utils/paymentError');
const { STRIPE_SECRET_KEY } = require('../config');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const ORDER_NUMBER_PATTERN = /^EC[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/;
const REVERSED_MESSAGE = 'Payment was reversed because the order could not be completed. Please try again.';

function unfinishedPaymentMessage(chargeId) {
  return `Your payment succeeded but the order could not be saved. Try checkout again, or contact support with reference ${chargeId}.`;
}

function isIdempotencyError(err) {
  return Boolean(err) && (
    err.type === 'StripeIdempotencyError'
    || err.rawType === 'idempotency_error'
    || err.code === 'idempotency_key_in_use'
  );
}

async function findChargeForOrder(orderNumber) {
  if (!ORDER_NUMBER_PATTERN.test(String(orderNumber || ''))) {
    return null;
  }

  try {
    const result = await stripe.charges.search({
      query: `metadata['order_number']:'${orderNumber}'`,
      limit: 1
    });
    return (result && result.data && result.data[0]) || null;
  } catch (err) {
    return null;
  }
}

async function refundCharge(charge) {
  try {
    await stripe.refunds.create(
      { charge: charge.id },
      { idempotencyKey: `refund-${charge.id}` }
    );
    return true;
  } catch (err) {
    console.error(`Refund failed for charge ${charge.id}`);
    return false;
  }
}

async function abandonOrder(orderId) {
  try {
    await OrderModel.remove(orderId);
  } catch (err) {
    try {
      await OrderModel.cancel(orderId);
    } catch (cancelErr) {
      console.error(`Unable to abandon pending order ${orderId}`);
    }
  }
}

const products = new ProductModel();

function parseDetails(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toCartItem(row) {
  const price = Math.round(Number(row.price)) / 100;
  return {
    id: String(row.product_id),
    cartItemId: String(row.id),
    name: row.name,
    description: row.description || '',
    details: parseDetails(row.details),
    price,
    imageUrl: row.image_url || '',
    category: row.category || '',
    stock: Number(row.stock_qty) || 0,
    quantity: Number(row.quantity)
  };
}

const FREE_SHIPPING_CENTS = 3000;
const STANDARD_SHIPPING_CENTS = 599;

function checkoutAmount(cartItems) {
  const subtotalCents = (cartItems || []).reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity || 1);
  }, 0);
  const shippingCents = subtotalCents > 0 && subtotalCents < FREE_SHIPPING_CENTS
    ? STANDARD_SHIPPING_CENTS
    : 0;
  return subtotalCents + shippingCents;
}

function summarize(cart, rows) {
  const items = (rows || []).map(toCartItem);
  const cents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
  return {
    id: String(cart.id),
    items,
    cartTotal: cents / 100
  };
}

module.exports = class CartService {

  async create(data) {
    const { userId } = data;
    return CartModel.findOrCreate(userId);
  };

  async loadCart(userId) {
    const cart = await CartModel.findOrCreate(userId);
    const items = await CartItemModel.find(cart.id);
    return summarize(cart, items);
  }

  async addItem(userId, item) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw createError(400, 'Quantity must be at least 1');
    }

    const product = await products.findOne(item.productId);
    if (!product) {
      throw createError(404, 'Product not found');
    }

    const cart = await CartModel.findOrCreate(userId);
    const existing = await CartItemModel.findByCartAndProduct(cart.id, item.productId);
    const nextQuantity = (existing ? Number(existing.quantity) : 0) + quantity;

    if (nextQuantity > product.stock) {
      throw createError(400, 'Not enough stock available');
    }

    if (existing) {
      await CartItemModel.update(existing.id, { quantity: nextQuantity });
    } else {
      await CartItemModel.create({
        cartId: cart.id,
        productId: item.productId,
        quantity
      });
    }

    return this.loadCart(userId);
  }

  async requireOwnedItem(userId, cartItemId) {
    const cart = await CartModel.findOrCreate(userId);
    const item = await CartItemModel.findById(cartItemId);
    if (!item || Number(item.cart_id) !== Number(cart.id)) {
      throw createError(404, 'Cart item not found');
    }
    return { cart, item };
  }

  async removeItem(userId, cartItemId) {
    await this.requireOwnedItem(userId, cartItemId);
    await CartItemModel.delete(cartItemId);
    return this.loadCart(userId);
  }

  async updateItem(userId, cartItemId, data) {
    const quantity = Number(data.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw createError(400, 'Quantity must be at least 1');
    }

    const { item } = await this.requireOwnedItem(userId, cartItemId);
    const product = await products.findOne(item.product_id);
    if (product && quantity > product.stock) {
      throw createError(400, 'Not enough stock available');
    }

    await CartItemModel.update(cartItemId, { quantity });
    return this.loadCart(userId);
  }

  async prepareOrder(client, cartId, userId, details) {
    const cart = await CartModel.lockById(cartId, userId, client);
    if (!cart) {
      throw createError(404, 'Cart not found');
    }

    const cartItems = await CartItemModel.find(cartId, client);
    if (!cartItems.length) {
      throw createError(400, 'Your cart is empty');
    }

    const total = checkoutAmount(cartItems);
    if (total < 50) {
      throw createError(400, 'Order total must be at least $0.50');
    }

    let order = await OrderModel.findMatchingPending(userId, total, cartItems, client);
    if (order) {
      order = await OrderModel.updateAddresses(
        order.id,
        details.shippingAddress,
        details.billingAddress,
        client
      ) || order;
    } else {
      const orderModel = new OrderModel({
        userId,
        total,
        status: 'pending',
        shippingAddress: details.shippingAddress,
        billingAddress: details.billingAddress
      });
      order = await orderModel.create(client);
      if (!order) {
        throw createError(500, 'Unable to save the order');
      }

      await OrderItemModel.createMany(cartItems.map((item) => ({
        orderId: order.id,
        productId: item.product_id,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })), client);
    }

    await OrderModel.discardUnchargedPending(userId, order.id, client);
    return order;
  }

  async collectCharge(order, tokenId) {
    if (order.stripe_charge_id) {
      return stripe.charges.retrieve(order.stripe_charge_id);
    }

    try {
      return await stripe.charges.create({
        amount: Math.round(Number(order.total_price)),
        currency: 'usd',
        source: tokenId,
        metadata: { order_number: order.order_number }
      }, {
        idempotencyKey: `checkout-${order.order_number}`
      });
    } catch (err) {
      if (!isIdempotencyError(err)) {
        throw err;
      }

      const existing = await findChargeForOrder(order.order_number);
      if (existing) {
        return existing;
      }
      throw createError(409, 'Checkout is already in progress for this order. Please try again in a moment.');
    }
  }

  async recoverOrReverse(order, charge) {
    let current = null;
    try {
      current = await OrderModel.findById(order.id);
    } catch {
      throw createError(500, unfinishedPaymentMessage(charge.id));
    }

    if (current && current.status === 'paid') {
      return new OrderService().present(current);
    }

    if (await refundCharge(charge)) {
      await abandonOrder(order.id);
      throw createError(500, REVERSED_MESSAGE);
    }

    throw createError(500, unfinishedPaymentMessage(charge.id));
  }

  async finishPaidOrder(order, charge, cartId) {
    const card = cardFromCharge(charge);
    return db.withTransaction(async (client) => {
      const updated = await OrderModel.markPaid(order.id, {
        last4: card.last4,
        brand: card.brand,
        chargeId: charge.id
      }, client);
      if (!updated) {
        throw createError(500, 'Unable to save the order');
      }
      await CartItemModel.clear(cartId, client);
      return updated;
    });
  }

  async checkout(cartId, userId, details = {}) {
    const cart = await CartModel.findOneById(cartId);
    if (!cart || Number(cart.user_id) !== Number(userId)) {
      throw createError(404, 'Cart not found');
    }

    const tokenId = details.paymentInfo && details.paymentInfo.id;
    if (!tokenId || typeof tokenId !== 'string') {
      throw createError(400, 'A valid card token is required');
    }

    // The order row exists before Stripe is called. A retry of the same cart
    // reuses it, and a charge that cannot be recorded is refunded.
    const order = await db.withTransaction((client) => (
      this.prepareOrder(client, cartId, userId, details)
    ));

    let charge;
    try {
      charge = await this.collectCharge(order, tokenId);
    } catch (err) {
      if (!order.stripe_charge_id && err.status !== 409) {
        await abandonOrder(order.id);
      }
      if (err.status) {
        throw err;
      }
      throw paymentFailure(err);
    }

    if (!charge) {
      await abandonOrder(order.id);
      throw createError(402, 'Your card was declined.');
    }

    if (charge.refunded) {
      await abandonOrder(order.id);
      throw createError(402, 'The previous payment was reversed. Please try checkout again.');
    }

    const expectedAmount = Math.round(Number(order.total_price));
    if (charge.amount != null && Number(charge.amount) !== expectedAmount) {
      throw createError(409, 'Checkout is already in progress for this order. Please try again in a moment.');
    }

    if (charge.status === 'pending') {
      await OrderModel.saveChargeId(order.id, charge.id);
      throw createError(402, 'Your payment is still processing. Please try checkout again in a moment.');
    }

    if (!charge || charge.status !== 'succeeded') {
      await abandonOrder(order.id);
      throw createError(402, 'Your card was declined.');
    }

    try {
      const saved = await OrderModel.saveChargeId(order.id, charge.id);
      if (!saved) {
        return this.recoverOrReverse(order, charge);
      }
    } catch (err) {
      return this.recoverOrReverse(order, charge);
    }

    try {
      const paid = await this.finishPaidOrder(order, charge, cartId);
      return new OrderService().present(paid);
    } catch (err) {
      return this.recoverOrReverse(order, charge);
    }
  }
}
