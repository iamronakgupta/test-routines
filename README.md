# Paper & Parcel

E-commerce storefront for papers, gift wrap, paper bags and accessories.

- **Backend:** Rails 7.2 JSON API (`app/controllers/api`), SQLite
- **Frontend:** React + Vite (`frontend/`), cart kept in localStorage

## Setup

```sh
bundle install
bin/rails db:prepare        # creates DB and loads seed catalog
cd frontend && npm install
```

## Run

```sh
bin/dev                      # starts Rails (3000) and Vite (5173) together
```

Or in two terminals:

```sh
bin/rails server -p 3000
cd frontend && npm run dev   # http://localhost:5173, proxies /api to Rails
```

## API

| Method | Path                         | Notes                                  |
|--------|------------------------------|----------------------------------------|
| GET    | `/api/categories`            |                                        |
| GET    | `/api/products?category=&q=` | filter by category slug / search term  |
| GET    | `/api/products/:slug`        |                                        |
| POST   | `/api/orders`                | `{ order: { customer_name, customer_email, shipping_address, items: [{ product_id, quantity }] } }` |

Order totals are computed from database prices and stock is decremented atomically
(`app/services/order_placement.rb`).

## Tests

```sh
bin/rails test                  # Rails: Minitest, fixtures in test/fixtures
cd frontend && npm test         # React: Vitest + Testing Library (watch mode)
cd frontend && npm run test:run # React: single run, as in CI
```

Frontend tests live next to the code as `src/**/*.test.jsx`. Use
`renderWithProviders` and `mockApiResponses` from `src/test/renderWithProviders.jsx`
to render components inside the router and cart providers and to stub the API.
