const { Client } = require('pg');
const { DB } = require('./config');
const { createOrderNumber } = require('./utils/orderNumber');

function unescapeStoredName(value) {
  return String(value || '')
    .replaceAll('&#96;', '`')
    .replaceAll('&#x5C;', '\\')
    .replaceAll('&#x2F;', '/')
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');
}

(async () => {
  const orderStatusStmt = `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled');
      END IF;
    END
    $$;
  `;

  const usersTableStmt = `
    CREATE TABLE IF NOT EXISTS users (
      id              INT               PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      email           VARCHAR(255)      UNIQUE NOT NULL,
      password        TEXT              NOT NULL,
      first_name      VARCHAR(50)       NOT NULL,
      last_name       VARCHAR(50)       NOT NULL,
      social_auth     JSONB,
      created_at      TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const productsTableStmt = `
    CREATE TABLE IF NOT EXISTS products (
      id              INT               PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name            VARCHAR(255)      NOT NULL,
      price           BIGINT            NOT NULL CHECK (price >= 0),
      description     TEXT,
      stock_qty       INT               DEFAULT 0 CHECK (stock_qty >= 0),
      image_url       TEXT,
      category        VARCHAR(100)      NOT NULL DEFAULT '',
      details         JSONB             NOT NULL DEFAULT '[]'::jsonb,
      created_at      TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const productsMigrateStmt = `
    ALTER TABLE products ALTER COLUMN name TYPE VARCHAR(255);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT '';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '[]'::jsonb;
  `;

  const ordersTableStmt = `
    CREATE TABLE IF NOT EXISTS orders (
      id                INT               PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      order_number      VARCHAR(16)       UNIQUE,
      user_id           INT               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_price       BIGINT            NOT NULL DEFAULT 0 CHECK (total_price >= 0),
      status            order_status      DEFAULT 'pending',
      card_last4        VARCHAR(4),
      card_brand        VARCHAR(20),
      stripe_charge_id  TEXT,
      shipping_address  JSONB,
      billing_address   JSONB,
      created_at        TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const ordersMigrateStmt = `
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(16);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_last4 VARCHAR(4);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT;
  `;

  const orderItemsTableStmt = `
    CREATE TABLE IF NOT EXISTS order_items (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      order_id        INT             NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id      INT             REFERENCES products(id) ON DELETE SET NULL,
      quantity        INT             NOT NULL CHECK (quantity > 0),
      price           BIGINT          NOT NULL,
      created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const cartsTableStmt = `
    CREATE TABLE IF NOT EXISTS carts (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      user_id         INT             UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const cartItemsTableStmt = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      cart_id         INT             NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id      INT             NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity        INT             NOT NULL DEFAULT 1 CHECK (quantity > 0),
      created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(cart_id, product_id)
    );
  `;

  const seedProducts = [
    {
      name: 'Everyday Canvas Tote',
      price: 2499,
      description: 'A sturdy everyday tote for work, travel, and weekend errands.',
      stock_qty: 24,
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
      category: 'Must Haves',
      details: ['Heavyweight canvas', 'Interior pocket', 'Machine washable']
    },
    {
      name: 'Wireless Noise-Canceling Headphones',
      price: 12999,
      description: 'Over-ear headphones with active noise canceling and 30-hour battery life.',
      stock_qty: 18,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      category: 'Tech',
      details: ['Bluetooth 5.3', 'USB-C charging', 'Foldable travel case']
    },
    {
      name: 'Vitamin C Brightening Serum',
      price: 3299,
      description: 'Lightweight serum that helps even skin tone and add a healthy glow.',
      stock_qty: 40,
      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
      category: 'Beauty & Wellness',
      details: ['15% vitamin C', 'Fragrance-free', 'Suitable for daily use']
    },
    {
      name: 'Garden Pruning Shears',
      price: 1899,
      description: 'Sharp, comfortable shears for trimming stems, herbs, and small branches.',
      stock_qty: 32,
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      category: 'Garden Essentials',
      details: ['Stainless steel blades', 'Soft-grip handles', 'Safety lock']
    },
    {
      name: 'Cast Iron Skillet',
      price: 4599,
      description: 'Pre-seasoned 10-inch skillet for searing, baking, and stovetop cooking.',
      stock_qty: 15,
      image_url: 'https://images.unsplash.com/photo-1556910103-1c0279aa1ff0?w=800',
      category: 'Home & Kitchen',
      details: ['Pre-seasoned', 'Oven-safe', 'Even heat retention']
    },
    {
      name: 'Organic Cotton Crewneck',
      price: 3999,
      description: 'A soft, relaxed-fit crewneck that layers easily through the seasons.',
      stock_qty: 28,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      category: 'Fashion',
      details: ['100% organic cotton', 'Relaxed fit', 'Available in multiple sizes']
    },
    {
      name: 'Insulated Stainless Bottle',
      price: 2799,
      description: 'A leak-resistant bottle that keeps drinks cold through a commute or a weekend trip.',
      stock_qty: 36,
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
      category: 'Must Haves',
      details: ['Double-wall insulation', 'Leak-resistant lid', 'Fits standard cup holders']
    },
    {
      name: 'Compact Wireless Keyboard',
      price: 7999,
      description: 'A low-profile Bluetooth keyboard for a desk, laptop, or travel setup.',
      stock_qty: 22,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
      category: 'Tech',
      details: ['Bluetooth pairing', 'Rechargeable battery', 'Quiet keys']
    },
    {
      name: 'Gentle Daily Moisturizer',
      price: 2499,
      description: 'A light moisturizer that layers under the brightening serum for everyday skin care.',
      stock_qty: 44,
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
      category: 'Beauty & Wellness',
      details: ['Fragrance-free', 'Fast absorbing', 'Pairs with vitamin C serum']
    },
    {
      name: 'Indoor Herb Planter',
      price: 3499,
      description: 'A compact planter for kitchen herbs, with a tray that keeps counters dry.',
      stock_qty: 20,
      image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
      category: 'Garden Essentials',
      details: ['Drainage tray', 'Three compartments', 'Indoor or patio']
    },
    {
      name: 'Glass Meal Prep Containers',
      price: 3299,
      description: 'Oven-safe glass containers for storing leftovers from the skillet.',
      stock_qty: 26,
      image_url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800',
      category: 'Home & Kitchen',
      details: ['Oven-safe glass', 'Locking lids', 'Set of four']
    },
    {
      name: 'Linen Button-Down Shirt',
      price: 5499,
      description: 'A breathable linen shirt that pairs with the cotton crewneck on cooler days.',
      stock_qty: 18,
      image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
      category: 'Fashion',
      details: ['Breathable linen', 'Button front', 'Relaxed fit']
    }
  ];

  const db = new Client({
    user: DB.PGUSER,
    host: DB.PGHOST,
    database: DB.PGDATABASE,
    password: DB.PGPASSWORD,
    port: DB.PGPORT
  });

  try {
    await db.connect();

    await db.query(orderStatusStmt);
    await db.query(usersTableStmt);

    const storedNames = await db.query('SELECT id, first_name, last_name FROM users');
    for (const row of storedNames.rows) {
      const firstName = unescapeStoredName(row.first_name);
      const lastName = unescapeStoredName(row.last_name);
      if (firstName === row.first_name && lastName === row.last_name) continue;
      await db.query(
        `UPDATE users
         SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [firstName, lastName, row.id]
      );
    }

    await db.query(productsTableStmt);
    await db.query(productsMigrateStmt);
    await db.query(ordersTableStmt);
    await db.query(ordersMigrateStmt);
    await db.query(orderItemsTableStmt);

    const missingNumbers = await db.query('SELECT id FROM orders WHERE order_number IS NULL ORDER BY id');
    for (const row of missingNumbers.rows) {
      let saved = false;
      for (let attempt = 0; attempt < 5 && !saved; attempt += 1) {
        try {
          await db.query('UPDATE orders SET order_number = $1 WHERE id = $2 AND order_number IS NULL', [
            createOrderNumber(),
            row.id
          ]);
          saved = true;
        } catch (err) {
          if (err.code !== '23505') throw err;
        }
      }
      if (!saved) {
        throw new Error(`Could not assign an order number to order ${row.id}`);
      }
    }
    await db.query('CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key ON orders (order_number)');
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_charge_id_key
                    ON orders (stripe_charge_id)
                    WHERE stripe_charge_id IS NOT NULL`);
    await db.query('ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL');
    await db.query(cartsTableStmt);
    await db.query(cartItemsTableStmt);

    let inserted = 0;
    for (const product of seedProducts) {
      const existing = await db.query('SELECT 1 FROM products WHERE name = $1', [product.name]);
      if (existing.rowCount) continue;

      await db.query(
        `INSERT INTO products (name, price, description, stock_qty, image_url, category, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
        [
          product.name,
          product.price,
          product.description,
          product.stock_qty,
          product.image_url,
          product.category,
          JSON.stringify(product.details)
        ]
      );
      inserted += 1;
    }
    console.log(inserted ? `Seeded ${inserted} products.` : 'Product catalog already includes the seed products.');

    console.log('Database setup complete.');
  } catch (err) {
    console.error('ERROR CREATING ONE OR MORE TABLES: ', err);
    process.exitCode = 1;
  } finally {
    await db.end().catch(() => {});
  }
})();
