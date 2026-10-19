const db = require('../db');
const pgp = require('pg-promise')({ capSQL: true });

const productTable = new pgp.helpers.ColumnSet([
  { name: 'stock_qty', prop: 'stockQty' },
  { name: 'updated_at', prop: 'updatedAt' }
], { table: 'products' });

function toCatalogProduct(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: row.name,
    description: row.description || '',
    details: Array.isArray(row.details) ? row.details : [],
    price: Number(row.price) / 100,
    imageUrl: row.image_url || '',
    category: row.category || '',
    stock: Number(row.stock_qty) || 0
  };
}

function queryText(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' ? raw.trim() : '';
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

module.exports = class ProductModel {

  /**
   * List products
   * @param  {Object} options [Query options]
   * @return {Array}          [Array of products]
   */
  async find(options = {}) {
    try {
      const conditions = [];
      const values = [];

      const category = queryText(options.category);
      if (category) {
        values.push(category);
        conditions.push(`category = $${values.length}`);
      }

      const terms = queryText(options.search).split(/\s+/).filter(Boolean);
      for (const term of terms) {
        values.push(`%${escapeLike(term)}%`);
        const index = values.length;
        conditions.push(`(name ILIKE $${index} ESCAPE '\\' OR description ILIKE $${index} ESCAPE '\\' OR category ILIKE $${index} ESCAPE '\\')`);
      }

      let statement = `SELECT *
                       FROM products`;

      if (conditions.length) {
        statement += ` WHERE ${conditions.join(' AND ')}`;
      }

      if (terms.length) {
        values.push(`%${escapeLike(terms[0])}%`);
        statement += ` ORDER BY CASE WHEN name ILIKE $${values.length} ESCAPE '\\' THEN 0 ELSE 1 END, name ASC`;
      }

      const result = await db.query(statement, values);

      if (result.rows?.length) {
        return result.rows.map(toCatalogProduct);
      }

      return [];

    } catch(err) {
      throw err;
    }
  }

  /**
   * Retrieve product by ID
   * @param  {Object}      id [Product ID]
   * @return {Object|null}    [Product record]
   */
  async findOne(id) {
    try {

      const statement = `SELECT *
                         FROM products
                         WHERE id = $1`;
      const values = [id];

      const result = await db.query(statement, values);

      if (result.rows?.length) {
        return toCatalogProduct(result.rows[0]);
      }

      return null;

    } catch(err) {
      throw err;
    }
  }
}
