# Expressive Cart storefront

React storefront for Expressive Cart. It talks to the Express API through `/api` and keeps the shopper’s session, catalog, cart, and orders in Redux.

Setup for PostgreSQL, Stripe, and the API is in the [backend README](../backend/README.md). The project overview is in the [root README](../README.md).

## Run locally

The API should already be listening on port 5000.

```bash
npm install
npm run dev
```

Vite serves the app at [http://localhost:5173](http://localhost:5173) and proxies `/api` to `http://localhost:5000`. That proxy keeps the `connect.sid` session cookie on the frontend origin, which is also why the Google callback URL in the backend env points at port 5173.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck with `tsc -b`, then production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest in watch mode |

## Stack

- React 19 and TypeScript, bundled with Vite
- Material UI for layout, forms, and feedback
- React Router 7, with route screens lazy-loaded behind a Suspense boundary
- Redux Toolkit for client state
- Axios (`src/apis/client.ts`) with `withCredentials: true`
- Formik and Yup on login and registration
- Stripe.js and React Stripe.js on checkout

A 401 from any API call other than login or registration clears the signed-in session and shows “Your session ended. Please sign in again.”

## Routes

| Path | Who can open it | Screen |
| --- | --- | --- |
| `/` | Everyone | Home: promo carousel, category tiles, and, after an order, “Buy it again” plus recommendations |
| `/categories/:category` | Everyone | Products in that category. `All` lists the whole catalog |
| `/products/:productId` | Everyone | Image, price, description, detail list, quantity, add to cart |
| `/search?q=` | Everyone | Products whose name, description, or category match every search term |
| `/login`, `/register` | Everyone | Email and password, plus Google when the API is configured |
| `/shipping`, `/returns`, `/privacy`, `/terms` | Everyone | Static policy copy |
| `/account` | Signed in | Email (read-only here) and editable first and last name |
| `/cart` | Signed in | Line items, quantity, remove, shipping quote, link to checkout |
| `/checkout` | Signed in | Delivery address, billing address, Stripe card, pay button |
| `/orders` | Signed in | Order history |
| `/orders/:orderId` | Signed in | One order: status, payment label, addresses, lines, and “Buy again” |

Unknown paths redirect to `/`. `PrivateRoute` sends a guest to `/login` and keeps the page they asked for in `next`.

The header has search, category links (Tech, Fashion, Home & Kitchen, Beauty & Wellness, Garden Essentials, Must Haves), an orders shortcut, account menu, and a cart button with the item count. The same cart opens in a right-hand drawer. The footer repeats shop and support links.

## Shopper behavior

**Cart before login.** Add to cart while signed out stores `{ productId, quantity }` in `sessionStorage`. After login or registration, the app posts that item and then loads the account cart.

**Stock.** The product page disables add to cart when stock is zero. The cart and drawer refuse a quantity above the stock returned with the line.

**Shipping quote.** `src/utils/shipping.ts` uses the same numbers as the API: $5.99 when the merchandise subtotal is above $0 and below $30, otherwise free. The cart, drawer, and checkout all show the remaining amount until free shipping applies.

**Checkout.** The form requires a delivery address. Billing defaults to that address and can be entered separately. Stripe.js turns the card into a token; the token plus both addresses go to `POST /api/cart/checkout`. A successful response navigates to `/orders`. Stripe test mode is loaded with the publishable key in `src/routes/Checkout/Checkout.tsx`. The matching secret key belongs in the backend `.env`.

**Recommendations.** `buildOrderSuggestions` walks the signed-in user’s orders newest first. “Buy it again” is those products still in the catalog. Recommendations are other products in the categories they bought most, capped at 12.

## Client state

`src/store/store.ts` combines five slices:

| Slice | Holds |
| --- | --- |
| `auth` | Session user, authenticated flag, login and profile errors. Screens read this slice |
| `user` | A copy of the user written on login, registration, and session restore |
| `products` | Catalog keyed by product id |
| `cart` | Cart id, line items, notices, and in-flight updates |
| `orders` | Orders keyed by order number |

API modules in `src/apis` match the backend resources: `auth`, `cart`, `order`, `product`, and `user`. Product prices on the client are dollars.

## Layout

```text
src/
  apis/            Axios client and resource calls
  components/      Header, footer, cart drawer, cards, checkout form
  routes/          One folder per screen
  store/           Redux slices and thunks
  utils/           Address, shipping, navigation, suggestions
  theme/           MUI theme
```

## Tests

Vitest runs in jsdom (`src/setupTests.ts`). Current tests cover private-route redirects, address helpers, order display labels, order suggestions, and formatted dates.
