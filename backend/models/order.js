const db = require('../db');
const pgp = require('pg-promise')({ capSQL: true });
const OrderItem = require('./orderItem');
const { createOrderNumber } = require('../utils/orderNumber');

function lineKey(item) {
  return `${Number(item.product_id)}:${Number(item.quantity)}:${Number(item.price)}`;
}

function linesMatch(orderItems, cartItems) {
  const left = (orderItems || []).map(lineKey).sort();
  const right = (cartItems || []).map(lineKey).sort();
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}


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
  async create(dbClient) {
    const { items, ...order } = this;
    const runner = db.resolveDb(dbClient);
    let lastError = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      order.orderNumber = createOrderNumber();
      this.orderNumber = order.orderNumber;
      const statement = pgp.helpers.insert(order, orderTable) + ' RETURNING *';

      try {
        const result = await runner.query(statement);
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

  /**
   * Pending checkout for this cart snapshot, new enough that the Stripe
   * idempotency key for its order number is still valid.
   */
  static async findMatchingPending(userId, total, cartItems, dbClient) {
    const runner = db.resolveDb(dbClient);
    const orders = await runner.query(
      `SELECT *
       FROM orders
       WHERE user_id = $1
         AND status = 'pending'
         AND total_price = $2
         AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC`,
      [userId, total]
    );

    for (const order of orders.rows || []) {
      const items = await runner.query(
        'SELECT product_id, quantity, price FROM order_items WHERE order_id = $1',
        [order.id]
      );
      if (linesMatch(items.rows, cartItems)) {
        return order;
      }
    }

    return null;
  }

  static async updateAddresses(id, shippingAddress, billingAddress, dbClient) {
    const runner = db.resolveDb(dbClient);
    const result = await runner.query(
      `UPDATE orders
       SET shipping_address = $2::jsonb,
           billing_address = $3::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, JSON.stringify(shippingAddress || null), JSON.stringify(billingAddress || null)]
    );
    return result.rows?.[0] || null;
  }

  static async discardUnchargedPending(userId, exceptId, dbClient) {
    const runner = db.resolveDb(dbClient);
    await runner.query(
      `DELETE FROM orders
       WHERE user_id = $1
         AND status = 'pending'
         AND stripe_charge_id IS NULL
         AND id <> $2`,
      [userId, exceptId]
    );
  }

  static async saveChargeId(id, chargeId, dbClient) {
    const runner = db.resolveDb(dbClient);
    const result = await runner.query(
      `UPDATE orders
       SET stripe_charge_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND status = 'pending'
         AND (stripe_charge_id IS NULL OR stripe_charge_id = $2)
       RETURNING id`,
      [id, chargeId]
    );
    return result.rows?.[0] || null;
  }

  static async markPaid(id, card, dbClient) {
    const runner = db.resolveDb(dbClient);
    const result = await runner.query(
      `UPDATE orders
       SET status = 'paid',
           card_last4 = $2,
           card_brand = $3,
           stripe_charge_id = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND status IN ('pending', 'paid')
         AND (stripe_charge_id IS NULL OR stripe_charge_id = $4)
       RETURNING *`,
      [id, card.last4, card.brand, card.chargeId]
    );
    return result.rows?.[0] || null;
  }

  static async remove(id, dbClient) {
    const runner = db.resolveDb(dbClient);
    await runner.query(
      `DELETE FROM orders
       WHERE id = $1 AND status = 'pending'`,
      [id]
    );
  }

  static async cancel(id, dbClient) {
    const runner = db.resolveDb(dbClient);
    await runner.query(
      `UPDATE orders
       SET status = 'cancelled',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND status = 'pending'
         AND stripe_charge_id IS NULL`,
      [id]
    );
  }

}