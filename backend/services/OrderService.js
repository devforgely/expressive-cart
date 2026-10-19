const createError = require('http-errors');
const OrderModel = require('../models/order');
const OrderItemModel = require('../models/orderItem');

function toAddress(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const address = {
    fullName: value.fullName || '',
    line1: value.line1 || '',
    line2: value.line2 || '',
    city: value.city || '',
    region: value.region || '',
    postalCode: value.postalCode || '',
    country: value.country || ''
  };

  return Object.values(address).some((part) => part) ? address : null;
}

module.exports = class OrderService {

  async create(data) {
    const { userId } = data;

    try {

      // Instantiate new order and save
      const Order = new OrderModel();
      const order = await Order.create({ userId, total });

      return cart;

    } catch(err) {
      throw err;
    }

  };

  async list(userId) {
    try {
      const orders = await OrderModel.findByUser(userId);
      const rows = Array.isArray(orders) ? orders : [];
      return Promise.all(rows.map((order) => this.present(order)));
    } catch(err) {
      throw err;
    }
  }

  async findById(orderId) {
    try {
      const order = await OrderModel.findByKey(orderId);
      if (!order) {
        return null;
      }
      return this.present(order);
    } catch(err) {
      throw err;
    }
  }

  async getForUser(orderId, userId) {
    const order = await OrderModel.findByKey(orderId);

    if (!order || Number(order.user_id) !== Number(userId)) {
      throw createError(404, 'Order not found');
    }

    return this.present(order);
  }

  async present(order) {
    const items = await OrderItemModel.find(order.id);

    return {
      id: order.order_number || String(order.id),
      total: Math.round(Number(order.total_price)) / 100,
      status: order.status || 'pending',
      date: order.created_at,
      cardLast4: order.card_last4 || null,
      cardBrand: order.card_brand || null,
      shippingAddress: toAddress(order.shipping_address),
      billingAddress: toAddress(order.billing_address),
      items: (items || []).map((row) => ({
        id: String(row.id),
        productId: row.product_id ? String(row.product_id) : '',
        name: row.name || 'Product no longer available',
        description: row.description || '',
        imageUrl: row.image_url || '',
        quantity: Number(row.quantity) || 1,
        price: Math.round(Number(row.price)) / 100
      }))
    };
  }

}