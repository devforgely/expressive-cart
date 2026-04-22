const createError = require('http-errors');
const CartModel = require('../models/cart');
const OrderModel = require('../models/order');
const CartItemModel = require('../models/cartItem');
const { STRIPE_SECRET_KEY } = require('../config');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

module.exports = class CartService {

  async create(data) {
    const { userId } = data;

    try {

      // Instantiate new cart and save
      const Cart = new CartModel();
      const cart = await Cart.create(userId);

      return cart;

    } catch(err) {
      throw err;
    }

  };

  async loadCart(userId) {
    try {
      // Load user cart based on ID
      const cart = await CartModel.findOneByUser(userId);

      // Load cart items and add them to the cart record
      const items = await CartItemModel.find(cart.id);
      cart.items = items;

      return cart;

    } catch(err) {
      throw err;
    }
  }

  async addItem(userId, item) {
    try {
      // Load user cart based on ID
      const cart = await CartModel.findOneByUser(userId);

      // Create cart item
      const cartItem = await CartItemModel.create({ cartId: cart.id, ...item });

      return cartItem;

    } catch(err) {
      throw err;
    }
  }

  async removeItem(cartItemId) {
    try {
      // Remove cart item by line ID
      const cartItem = await CartItemModel.delete(cartItemId);

      return cartItem;

    } catch(err) {
      throw err;
    }
  }

  async updateItem(cartItemId, data) {
    try {
      // Remove cart item by line ID
      const cartItem = await CartItemModel.update(cartItemId, data);

      return cartItem;

    } catch(err) {
      throw err;
    }
  }

  async checkout(cartId, userId) {
    try {
      // Load cart items
      const cartItems = await CartItemModel.find(cartId);

      // Generate total price from cart items
      const total = cartItems.reduce((total, item) => {
        return total += Number(item.price);
      }, 0);

      // Generate initial order
      const Order = new OrderModel({ userId, total, status: 'pending' });
      Order.addItems(cartItems);
      await Order.create();

      // Stripe payment intent (Playground only - no actual payment processing)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "gbp",
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order.id
        }
      });

      return {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch(err) {
      throw err;
    }
  }
}