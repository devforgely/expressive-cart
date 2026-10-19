# Expressive Cart API

Express REST API for Expressive Cart. It stores users, a product catalog, one cart per user, and paid orders in PostgreSQL. Checkout creates a Stripe charge, then writes the order.

The storefront that calls this API is documented in the [frontend README](../frontend/README.md). The project overview is in the [root README](../README.md).

## Run locally

PostgreSQL has to be running. [pgAdmin](https://www.pgadmin.org/) is a convenient way to inspect the tables.

```bash
npm install
```

Copy `example.env` to `.env` and replace the placeholders:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port. The storefront expects `5000` |
| `SESSION_SECRET` | Secret for the Express session cookie |
| `FRONTEND_ORIGIN` | Storefront origin allowed by CORS. Default `http://localhost:5173` |
| `PGHOST`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`, `PGPORT` | PostgreSQL connection |
| `STRIPE_SECRET_KEY` | Stripe test secret (`sk_test_...`). Required to place an order |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional. Both must be set or Google sign-in stays off |
| `GOOGLE_CALLBACK_URL` | Must match the redirect URI in Google Cloud. With the Vite dev server use `http://localhost:5173/api/auth/google/callback` so the session cookie is set on port 5173 |

Create the schema and seed the catalog, then start the API:

```bash
npm run create-db
npm run start
```

`create-db` runs `setupDatabase.js`. It creates missing tables, adds columns that older databases do not have yet, and inserts the seed products when a product with the same name is not already there. The API then listens on `PORT`.

| Script | What it does |
| --- | --- |
| `npm run start` | `nodemon` with `dotenv` on `index.js` |
| `npm test` | Jest |
| `npm run create-db` | Create or migrate tables and seed products |

Interactive docs from `swagger.yml` are at [http://localhost:5000/docs](http://localhost:5000/docs). That file does not yet list Google sign-in, logout, session restore, or the address fields on checkout. The routes below are the live API.

## Stack

Express 5, `pg` / `pg-promise`, Passport (local and optional Google), `express-session`, `express-validator`, bcrypt, Stripe, and Swagger UI.

Startup in `loaders/` is: CORS and the session cookie, Passport, route mounting, Swagger, then a JSON error handler that returns `{ message }` with the error status.

Every route is mounted under `/api`. The Vite dev server proxies that prefix, so the browser calls `/api/...` on port 5173.

## Auth

Sessions last 24 hours. The cookie is `httpOnly`, `sameSite: lax`, and `secure` when `NODE_ENV` is `production`. Passwords are hashed with bcrypt. Responses go through `safeUser`, which strips `password`.

- `POST /api/auth/register` creates the user and signs them in. Email must be unique. Password must be at least 8 characters. `firstName` and `lastName` are optional and capped at 50 characters.
- `POST /api/auth/login` checks email and password with the Passport local strategy. The username field is `email`.
- `GET /api/auth/google` and `GET /api/auth/google/callback` run the Google strategy when client id and secret are set. An existing email is linked; otherwise a user is created with a random password hash and the Google profile stored in `social_auth`. Failure redirects to the storefront login page with `error=google_unavailable` or `error=google_failed`.
- `POST /api/auth/logout` ends the Passport session and clears `connect.sid`.
- `GET /api/auth/logged_in` returns the current user, or a logged-out payload, so the storefront can restore a session.

Cart, order, and user routes use `requireAuth`. User routes also use `requireSelf`, so a session can only read or update its own id.

## Catalog, cart, and orders

Public catalog:

- `GET /api/products` lists products. `category` filters to one category. `search` splits on whitespace and requires every term to match name, description, or category (`ILIKE`). Name matches sort first.
- `GET /api/products/:productId` returns one product.

Prices in the database are integer cents. Catalog and cart JSON convert them to dollars and include `imageUrl`, `category`, `details`, and `stock`.

Signed-in cart (`/api/cart`). The service creates the user’s cart on first use. `user_id` is unique, so there is one cart per account.

- `GET /api/cart` returns `{ id, items, cartTotal }`.
- `POST /api/cart` ensures the cart exists.
- `POST /api/cart/items` with `{ productId, qty }` adds a line or increases the existing one. Quantity must be a positive integer and the resulting quantity cannot exceed `stock_qty`.
- `PUT /api/cart/items/:cartItemId` sets `quantity` (or `qty`) and checks stock again. The line must belong to the session user’s cart.
- `DELETE /api/cart/items/:cartItemId` removes that line.
- `POST /api/cart/checkout` charges the cart and creates the order. Body: `cartId`, `paymentInfo` (a Stripe token, using `paymentInfo.id`), `shippingAddress`, and `billingAddress`.

Signed-in orders:

- `GET /api/orders` lists the session user’s orders, newest first.
- `GET /api/orders/:orderId` loads one order. The path accepts the public order number (`EC…`) and, for older rows, the numeric primary key. Another user’s order returns 404.

Signed-in profile:

- `GET /api/users/:userId`
- `PUT /api/users/:userId` with `firstName`, `lastName`, and `email`.

Validation lives in `middleware/validate.js` and returns the first failure as a 400 `{ message }`.

## Checkout

Merchandise is the sum of each line’s cent price times quantity. Shipping is 599 cents when that subtotal is greater than 0 and below 3000 cents, otherwise 0. The charge is merchandise plus shipping, in USD, and must be at least 50 cents.

`stripe.charges.create` uses the token id as `source`. Card errors become 402 messages (declined, insufficient funds, invalid number, expired, incorrect CVC). A charge that is not `succeeded` is also a 402. When the charge succeeds, the API inserts an order with status `paid`, the card brand and last four, and both addresses, then inserts `order_items` at the current cent price and deletes the cart lines.

Stock is enforced when a line is added or updated. Checkout does not decrement `stock_qty`.

Order numbers are `EC` plus eight characters from a no-ambiguous alphabet. Creation retries on a unique collision. The storefront treats that number as the order id in its own state. The list and detail payloads also include status, dollar total, date, card label, addresses, and line snapshots (name, image, quantity, dollar price). If the product row is gone, the line name falls back to “Product no longer available”.

Status values are the `order_status` enum: `pending`, `paid`, `shipped`, `completed`, `cancelled`. This API only writes `paid`.

## Tables

`setupDatabase.js` is the current schema. `resources/ERD.png` is an earlier diagram and omits catalog fields, order numbers, card details, and addresses.

- **users** — `email` unique, `password`, `first_name`, `last_name`, optional `social_auth` jsonb.
- **products** — `name`, `price` (cents), `description`, `stock_qty`, `image_url`, `category`, `details` jsonb.
- **carts** — one row per `user_id`.
- **cart_items** — `cart_id`, `product_id`, `quantity`, unique on `(cart_id, product_id)`.
- **orders** — `order_number` unique, `user_id`, `total_price` (cents), `status`, `card_last4`, `card_brand`, `shipping_address`, `billing_address`.
- **order_items** — `order_id`, nullable `product_id`, `quantity`, `price` (cents at purchase).

Seed products cover Tech, Fashion, Home & Kitchen, Beauty & Wellness, Garden Essentials, and Must Haves.

## Tests

Jest runs the `*.test.js` files: auth service, auth middleware, request validation, order numbers, and Stripe error mapping.
