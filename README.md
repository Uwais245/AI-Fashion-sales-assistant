# FashionHub AI — Admin Dashboard

Frontend for the AI Fashion Sales Assistant (CodeCelix internship project). This is
the admin panel a FashionHub employee uses to manage products, orders, customers,
and the Instagram/WhatsApp conversations the AI is handling.

The AI conversation logic, WhatsApp/Instagram automation, and backend/database are
being built separately — see `API_CONTRACT.md` for exactly what this frontend
expects from that side.

## Project Contributors

This frontend was collaboratively developed by:

- **Mina Khan**
- **Muhammad Huzaifa Afzal**

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router
- TanStack Query (server state / caching)
- Zustand (auth session + UI state)
- React Hook Form + Zod (forms/validation)
- Recharts (analytics)

## Running it

```bash
npm install
npm run dev
```

Login screen is pre-filled with demo credentials (`admin@fashionhub.pk` / `admin123`)
since there's no real auth backend yet.

## Where things stand

Right now everything runs against mock data in `src/services/mockData.js` — there's
no backend to hit. Every API call is behind a function in `src/services/api/`, and
each one already has the real `axios` call written, gated behind a `USE_MOCK` flag
(`src/services/config.js`). Once the backend team has endpoints up, flip
`VITE_USE_MOCK_DATA=false` in `.env.local` (copy from `.env.example`) and it should
just work — no component changes needed, assuming the response shapes match
`API_CONTRACT.md`.

## Folder structure

```text
src/
  components/     shared UI (DataTable, Modal, Badge, etc.) + layout pieces
  pages/          one file per route
  hooks/          React Query hooks, one per resource
  services/       api/ (per-resource calls), mockData.js, apiClient.js, config.js
  store/          Zustand stores (auth, ui/toasts)
  layouts/        DashboardLayout wraps all authenticated pages
  utils/          small shared constants (status/sentiment color mapping)
```

## What's not done yet

- No real backend — everything is mock data
- No image upload for products
- Export button on the dashboard doesn't actually generate a file yet
- Conversations list polls every 15s instead of a real live feed — fine for now,
  worth revisiting once there's a WebSocket source from the automation side
- No role-based access — single admin user only

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build the project for production
- `npm run lint` — Run ESLint
