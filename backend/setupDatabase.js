const { Client } = require('pg');
const { DB } = require('./config');

(async () => {

  const orderStatusStmt = `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled');
      END IF;
    END
    $$;
  `

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
  `

  const productsTableStmt = `
    CREATE TABLE IF NOT EXISTS products (
      id              INT               PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name            VARCHAR(50)       NOT NULL,
      price           BIGINT            NOT NULL CHECK (price >= 0),
      description     TEXT,
      stock_qty       INT               DEFAULT 0 CHECK (stock_qty >= 0),
      created_at      TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP
    );
  `

  const ordersTableStmt = `
    CREATE TABLE IF NOT EXISTS orders (
      id              INT               PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      user_id         INT               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_price     BIGINT            NOT NULL DEFAULT 0 CHECK (total_price >= 0),
      status          order_status      DEFAULT 'pending',
      created_at      TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ       DEFAULT CURRENT_TIMESTAMP
    );
  `

  const orderItemsTableStmt = `
    CREATE TABLE IF NOT EXISTS order_items (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      order_id        INT             NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id      INT             REFERENCES products(id) ON DELETE SET NULL,
      quantity        INT             NOT NULL CHECK (quantity > 0),
      price           BIGINT          NOT NULL, -- Snapshot of price for accounting
      created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP
    );
  `

  const cartsTableStmt = `
    CREATE TABLE IF NOT EXISTS carts (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      user_id         INT             UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP
    );
  `

  const cartItemsTableStmt = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id              INT             PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      cart_id         INT             NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id      INT             NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity        INT             NOT NULL DEFAULT 1 CHECK (quantity > 0),
      created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(cart_id, product_id) -- Prevents duplicate rows for the same product in a cart
    );
  `

  try {
    const db = new Client({
      user: DB.PGUSER,
      host: DB.PGHOST,
      database: DB.PGDATABASE,
      password: DB.PGPASSWORD,
      port: DB.PGPORT
    });

    await db.connect();

    // Create order status enum type
    await db.query(orderStatusStmt);
    // Create tables on database
    await db.query(usersTableStmt);
    await db.query(productsTableStmt);
    await db.query(ordersTableStmt);
    await db.query(orderItemsTableStmt);
    await db.query(cartsTableStmt);
    await db.query(cartItemsTableStmt);

    await db.end();

  } catch(err) {
    console.log("ERROR CREATING ONE OR MORE TABLES: ", err);
  }

})();