# API Contract — Frontend Expectations

The frontend is built and running against mock data (`src/services/mockData.js`).
Every network call goes through `src/services/api/*.js`, and each function already
has a `USE_MOCK` branch wired to `axios` — once these endpoints exist, set
`VITE_USE_MOCK_DATA=false` in `.env.local` and the app switches over. No component
changes needed.

Base URL: `VITE_API_BASE_URL` (see `.env.example`), e.g. `http://localhost:5000/api`

Auth: frontend sends `Authorization: Bearer <token>` on every request once logged in
(see `src/services/apiClient.js`).

---

## Auth

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ user, token }` |
| GET | `/auth/me` | — | `{ id, name, email, role }` |
| POST | `/auth/logout` | — | `{ success }` |

## Products

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/products` | — | `Product[]` |
| GET | `/products/:id` | — | `Product` |
| POST | `/products` | `Product` (no id) | `Product` |
| PUT | `/products/:id` | partial `Product` | `Product` |
| DELETE | `/products/:id` | — | `{ success }` |

`Product` shape: `{ id, name, category, price, description, sizes: string[], colors: string[], stock, discount, rating, image }`

## Customers

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/customers` | `Customer[]` |
| GET | `/customers/:id` | `Customer & { orders: Order[] }` |

`Customer` shape: `{ id, name, phone, instagramId, address, preferences, orderHistory: string[] }`

## Orders

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/orders` | — | `Order[]` |
| GET | `/orders/:id` | — | `Order` |
| PATCH | `/orders/:id/status` | `{ status, trackingNumber }` | `Order` |

`Order` shape: `{ id, orderId, customerId, customerName, products: [{productId, name, qty}], status, paymentStatus, trackingNumber, amount, date }`

`status` ∈ `Pending | Shipped | Delivered | Cancelled`
`paymentStatus` ∈ `Paid | Unpaid`

## Conversations (this is the one the AI/automation side owns most of)

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/conversations` | — | `Conversation[]` |
| GET | `/conversations/:id` | — | `Conversation` |
| POST | `/conversations/:id/reply` | `{ text }` | `Conversation` (human agent takeover) |
| PATCH | `/conversations/:id/resolve` | — | `Conversation` |

`Conversation` shape:
```
{
  id, customerName, channel: "Instagram" | "WhatsApp",
  status: "ai-handling" | "agent-handling" | "flagged" | "resolved",
  lastMessage, intent, sentiment,
  messages: [{ sender: "customer" | "ai" | "agent", text, time }]
}
```
`intent` values used in the UI: `Greeting, Product Search, Order Placement, Delivery Inquiry, Complaint, Return Request, Discount Inquiry`
`sentiment` values used in the UI: `Happy, Interested, Neutral, Frustrated, Angry`

Ideally this list updates in near-real-time — frontend currently polls every 15s
(`src/hooks/useConversations.js`). If a WebSocket/SSE feed becomes available, that's
a clean upgrade point — swap the `useQuery` for a subscription in that one hook.

## AI Training Rules

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/ai-rules` | — | `Rule[]` |
| POST | `/ai-rules` | `{ intent, trigger, response }` | `Rule` |
| DELETE | `/ai-rules/:id` | — | `{ success }` |

---

## Notes for whoever builds the backend

- All list endpoints currently return the full array — no pagination/filtering params
  are sent from the frontend yet. Fine for now given expected data volume; flag if
  that assumption breaks.
- Frontend has no image upload flow yet (`image` field is unused) — coordinate before
  building product image handling either side.
- Error responses: frontend reads `err.response.data.message` for the error string
  shown in toasts (see `apiClient.js`). Please return errors in that shape:
  `{ "message": "human readable error" }`.
