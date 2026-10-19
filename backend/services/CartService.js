const createError = require('http-errors');
const CartModel = require('../models/cart');
const OrderModel = require('../models/order');
const OrderItemModel = require('../models/orderItem');
const CartItemModel = require('../models/cartItem');
const ProductModel = require('../models/product');
const OrderService = require('./OrderService');
const { cardFromCharge, paymentFailure } = require('../utils/paymentError');
const { STRIPE_SECRET_KEY } = require('../config');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

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

  async checkout(cartId, userId, details = {}) {
    const cart = await CartModel.findOneById(cartId);
    if (!cart || Number(cart.user_id) !== Number(userId)) {
      throw createError(404, 'Cart not found');
    }

    const cartItems = await CartItemModel.find(cartId);
    if (!cartItems.length) {
      throw createError(400, 'Your cart is empty');
    }

    const total = checkoutAmount(cartItems);
    if (total < 50) {
      throw createError(400, 'Order total must be at least $0.50');
    }
    const tokenId = details.paymentInfo && details.paymentInfo.id;
    if (!tokenId || typeof tokenId !== 'string') {
      throw createError(400, 'A valid card token is required');
    }

    let charge;
    try {
      charge = await stripe.charges.create({
        amount: total,
        currency: 'usd',
        source: tokenId
      });
    } catch (err) {
      throw paymentFailure(err);
    }

    if (!charge || charge.status !== 'succeeded') {
      throw createError(402, 'Your card was declined.');
    }

    const card = cardFromCharge(charge);
    const orderModel = new OrderModel({
      userId,
      total,
      status: 'paid',
      cardLast4: card.last4,
      cardBrand: card.brand,
      shippingAddress: details.shippingAddress,
      billingAddress: details.billingAddress
    });
    const created = await orderModel.create();
    if (!created) {
      throw createError(500, 'Unable to save the order');
    }

    await OrderItemModel.createMany(cartItems.map((item) => ({
      orderId: created.id,
      productId: item.product_id,
      quantity: Number(item.quantity),
      price: Number(item.price)
    })));

    await CartItemModel.clear(cartId);

    return new OrderService().present(created);
  }
}
