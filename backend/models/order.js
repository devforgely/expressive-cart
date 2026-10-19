const db = require('../db');
const pgp = require('pg-promise')({ capSQL: true });
const OrderItem = require('./orderItem');
const { createOrderNumber } = require('../utils/orderNumber');


const orderTable = new pgp.helpers.ColumnSet([
  { name: 'order_number', prop: 'orderNumber' },
  { name: 'user_id', prop: 'userId' },
  { name: 'total_price', prop: 'totalPrice' },
  { name: 'status', prop: 'status', cast: 'order_status' },
  { name: 'card_last4', prop: 'cardLast4' },
  { name: 'card_brand', prop: 'cardBrand' },
  { name: 'shipping_address', prop: 'shippingAddress', mod: ':json', cast: 'jsonb' },
  { name: 'billing_address', prop: 'billingAddress', mod: ':json', cast: 'jsonb' }
], { table: 'orders' });

module.exports = class OrderModel {

  constructor(data = {}) {
    this.userId = data.userId || null;
    this.totalPrice = data.total || 0;
    this.orderNumber = data.orderNumber || null;
    this.status = data.status || 'pending';
    this.cardLast4 = data.cardLast4 || null;
    this.cardBrand = data.cardBrand || null;
    this.shippingAddress = data.shippingAddress || null;
    this.billingAddress = data.billingAddress || null;
    this.items = data.items || [];
  }

  addItems(items) {
    this.items = items.map(item => new OrderItem(item));
  }

  /**
   * Creates a new order for a user
   * @return {Object|null}        [Created order record]
   */
  async create() {
    const { items, ...order } = this;
    let lastError = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      order.orderNumber = createOrderNumber();
      this.orderNumber = order.orderNumber;
      const statement = pgp.helpers.insert(order, orderTable) + ' RETURNING *';

      try {
        const result = await db.query(statement);
        if (result.rows?.length) {
          Object.assign(this, result.rows[0]);
          return result.rows[0];
        }
        return null;
      } catch (err) {
        lastError = err;
        const duplicateNumber = err.code === '23505'
          && String(err.constraint || '').includes('order_number');
        if (!duplicateNumber) {
          throw err;
        }
      }
    }

    throw lastError;
  }

  /**
   * Updates an order for a user
   * @param  {Object}      id   [Order ID]
   * @param  {Object}      data [Order data to update]
   * @return {Object|null}      [Updated order record]
   */
  async update(data) {
    try {

      // Generate SQL statement - using helper for dynamic parameter injection
      const condition = pgp.as.format('WHERE id = ${id} RETURNING *', { id: this.id });
      const statement = pgp.helpers.update(data, orderTable) + condition;
  
      // Execute SQL statment
      const result = await db.query(statement);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;

    } catch(err) {
      throw new Error(err);
    }
  }

  /**
   * Loads orders for a user
   * @param  {number} userId [User ID]
   * @return {Array}         [Order records]
   */
  static async findByUser(userId) {
    try {

      // Generate SQL statement
      const statement = `SELECT *
                         FROM orders
                         WHERE user_id = $1
                         ORDER BY created_at DESC`;
      const values = [userId];
  
      // Execute SQL statment
      const result = await db.query(statement, values);

      return result.rows || [];

    } catch(err) {
      throw new Error(err);
    }
  }

  /**
   * Retrieve order by ID
   * @param  {number}      orderId [Order ID]
   * @return {Object|null}         [Order record]
   */
  static async findById(orderId) {
    try {

      // Generate SQL statement
      const statement = `SELECT *
                         FROM orders
                         WHERE id = $1`;
      const values = [orderId];
  
      // Execute SQL statment
      const result = await db.query(statement, values);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;

    } catch(err) {
      throw new Error(err);
    }
  }

  /**
   * Retrieve an order by its public number, or by the legacy numeric id.
   * @param  {string}      orderKey
   * @return {Object|null}
   */
  static async findByKey(orderKey) {
    try {
      const key = String(orderKey || '').trim();
      const byNumber = await db.query(
        'SELECT * FROM orders WHERE order_number = $1',
        [key.toUpperCase()]
      );

      if (byNumber.rows?.length) {
        return byNumber.rows[0];
      }

      if (/^\d+$/.test(key)) {
        return this.findById(Number(key));
      }

      return null;
    } catch (err) {
      throw new Error(err);
    }
  }

}