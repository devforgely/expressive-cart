const db = require('../db');
const moment = require('moment');
const pgp = require('pg-promise')({ capSQL: true });


const orderItemTable = new pgp.helpers.ColumnSet([
  { name: 'order_id', prop: 'orderId' },
  { name: 'product_id', prop: 'productId' }
], { table: 'order_items' });

module.exports = class OrderItemModel {

  constructor(data = {}) {
    this.orderId = data.orderId || null;
    this.productId = data.id;
    this.quantity = data.quantity || 1;
    this.price = data.price;
  }

  /**
   * Creates a new order item
   * @param  {Object}      data [Order item data]
   * @return {Object|null}      [Created order item]
   */
  static async create(data) {
    try {

      // Generate SQL statement - using helper for dynamic parameter injection
      const statement = pgp.helpers.insert(data, orderItemTable) + 'RETURNING *';
 
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
   * Retrieve order items for an order
   * @param  {Object} orderId [Order ID]
   * @return {Array}          [Created cart item]
   */
  static async find(orderId) {
    try {

      // Generate SQL statement
      const statement = `SELECT
                            oi.id,
                            oi.quantity,
                            oi.price,
                            p.id AS product_id,
                            p.name,
                            p.description,
                            p.price AS unit_price
                         FROM order_items oi
                         INNER JOIN products p ON p.id = oi.product_id
                         WHERE order_id = $1`
      const values = [orderId];
  
      // Execute SQL statment
      const result = await db.query(statement, values);

      if (result.rows?.length) {
        return result.rows;
      }

      return [];

    } catch(err) {
      throw new Error(err);
    }
  }

}