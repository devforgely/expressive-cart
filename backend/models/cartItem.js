const db = require('../db');

module.exports = class CartItemModel {

  /**
   * Creates a new cart line item
   * @param  {Object}      data [Cart item data]
   * @return {Object|null}      [Created cart item]
   */
  static async create(data) {
    try {

      const statement = `INSERT INTO cart_items (cart_id, product_id, quantity)
                         VALUES ($1, $2, $3)
                         RETURNING *`;
      const result = await db.query(statement, [data.cartId, data.productId, data.quantity]);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;

    } catch(err) {
      throw new Error(err);
    }
  }

  /**
   * Updates existing cart item
   * @param  {Object}      data [Cart item data]
   * @param  {Object}      id   [Cart item id]
   * @return {Object|null}      [Updated cart item]
   */
  static async update(id, data) {
    try {

      const statement = `UPDATE cart_items
                         SET quantity = $1,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $2
                         RETURNING *`;
      const result = await db.query(statement, [data.quantity, id]);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;

    } catch(err) {
      throw new Error(err);
    }
  }

  /**
   * Retrieve cart items for a cart
   * @param  {Object} cartId [Cart ID]
   * @return {Array}         [Created cart item]
   */
  static async find(cartId) {
    try {

      // Generate SQL statement
      const statement = `SELECT
                          ci.id,
                          ci.quantity,
                          p.id AS product_id,
                          p.name,
                          p.description,
                          p.price,
                          p.image_url,
                          p.category,
                          p.details,
                          p.stock_qty
                         FROM cart_items ci
                         INNER JOIN products p ON p.id = ci.product_id
                         WHERE ci.cart_id = $1
                         ORDER BY ci.created_at ASC`
      const values = [cartId];
  
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

  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM cart_items WHERE id = $1', [id]);
      return result.rows?.[0] || null;
    } catch (err) {
      throw new Error(err);
    }
  }

  static async findByCartAndProduct(cartId, productId) {
    try {
      const result = await db.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
      return result.rows?.[0] || null;
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Deletes a cart line item
   * @param  {Object}      id [Cart item ID]
   * @return {Object|null}    [Deleted cart item]
   */
  static async clear(cartId) {
    try {
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    } catch (err) {
      throw new Error(err);
    }
  }

  static async delete(id) {
    try {

      // Generate SQL statement
      const statement = `DELETE
                         FROM cart_items
                         WHERE id = $1
                         RETURNING *`;
      const values = [id];
  
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

}