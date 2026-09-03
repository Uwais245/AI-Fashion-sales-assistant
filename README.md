# AI Fashion Sales Assistant

A chatbot-driven sales assistant for a fashion store: customers can look up their
profile and orders, search the catalog, check stock, get recommendations, and ask
policy questions (returns/shipping/warranty) via a RAG-backed agent. The repo has
two parts: the Node/Express + MongoDB backend, and the Python chatbot agent that
calls into it.

## Project structure

```
Backend/
  config/db.js           # Mongo connection
  Models/                 # Mongoose schemas (Customer, Order, Product, User)
  Middleware/authMiddleware.js  # JWT auth (protect, adminOnly)
  Controllers/            # Route handlers / business logic
  Routes/                 # Express routers, wired to Controllers
  server.js               # App entrypoint
  AI/                     # Python chatbot agent (LangChain/LangGraph + Gemini)
    main.py                # Entrypoint - run this to chat
    tools.py                # Backend-calling tools (customer/order/product lookups)
    classifier.py            # Intent/sentiment classification
    rag.py                    # Policy document RAG (Chroma vector store)
    policies/                  # Store policy documents (returns, shipping, etc.)
```

## Backend setup

```
cd Backend
npm install
cp .env.example .env    # then set MONGO_URI, and set JWT_SECRET to a random string
npm run dev              # nodemon, http://localhost:5000
```

### Environment variables (`Backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random secret used to sign/verify auth tokens |

## Chatbot agent setup (`Backend/AI`)

```
cd Backend/AI
python -m venv .venv
.venv\Scripts\activate        # Windows; source .venv/bin/activate on Mac/Linux
pip install -r requirements.txt
cp .env.example .env if present, or create .env (see below)
python main.py                 # runs the backend server first, then this
```

### Environment variables (`Backend/AI/.env`)

| Variable | Description |
|---|---|
| `GOOGLE_API_KEY` / `GEMINI_API_KEY` | Gemini API key (used for chat, embeddings, and classification) |
| `BASE_URL_BACKEND` | The Node backend's API root, e.g. `http://localhost:5000/api` |

`main.py` asks for a phone number to sign in as (must match a seeded `Customer.phone`),
then chats in a loop until you type `exit`/`quit`.

## Data models

- **Customer** — name, phone (unique), instagramId, address, orderHistory, preferences (favoriteColor, budget, category, size)
- **Order** — orderId (e.g. `ORD-1001`), customerId, products (productId, quantity, size, color), status, paymentStatus, trackingNumber
- **Product** — name, category, price, description, sizes, colors, stock (array of `{ size, color, quantity }`), images, discount, rating
- **User** — name, email (unique), password (hashed), role (`customer`/`admin`) — used for authenticating write requests, separate from `Customer`

## API reference

Write routes (create/update) require a Bearer token from a `role: "admin"` user;
read routes are public since the chatbot has no login flow.

### Auth (`/api/auth`)
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a new user (always created as `role: "customer"`) |
| POST | `/login` | Log in, returns a JWT |
| GET | `/profile` | Get the logged-in user's profile (requires token) |

### Customers (`/api/customers`)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | admin | Create a customer |
| GET | `/` | — | List all customers |
| GET | `/lookup?phone=&instagramId=` | — | Find a customer by phone or Instagram handle |
| GET | `/:id/orders` | — | Get a customer's order history |
| GET | `/:id` | — | Get a customer by Mongo ID |

### Orders (`/api/orders`)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | admin | Create an order (auto-generates `orderId`, decrements stock, appends to customer's history) |
| GET | `/` | — | List all orders |
| GET | `/:orderId` | — | Find an order by its human-readable order number (e.g. `ORD-1005`) |
| GET | `/customer/:customerId` | — | Get all orders for a customer |
| PUT | `/:id/status` | admin | Update status / paymentStatus / trackingNumber |

### Products (`/api/products`)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | admin | Create a product |
| GET | `/` | — | List all products |
| GET | `/search?q=&category=&color=&size=&minPrice=&maxPrice=&discount=&sort=&limit=` | — | Filter/search the catalog (`sort=price_asc\|price_desc`, `discount=true`) |
| GET | `/:id/availability?size=&color=` | — | Check stock for a product (optionally for a specific size/color) |
| GET | `/:id` | — | Get a product by Mongo ID |

All responses follow `{ success, message?, data }` on success and `{ success: false, message, error }` on failure.
