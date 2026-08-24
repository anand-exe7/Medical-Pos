# VINAYAKA MEDICALS - POS & Inventory Billing System

A PWA-enabled Point of Sale (POS), billing, and inventory management system built for **VINAYAKA MEDICALS**, Anaimalai. It handles quick invoice generation, WhatsApp delivery of digital receipts, order history, and full medical inventory (with expiry-date and low-stock alerts).

## Features

### 🧾 POS Billing Panel
- Quick invoice generator with a searchable product catalog
- Add custom items with price and quantity controls
- Manual discounts (fixed ₹ or percent %)
- Apply GST with configurable percentage
- Optional delivery fee
- Cash payment tracking with auto-calculated change return
- Backdate support (custom / past bill dates)
- Online / Offline (POS) order source toggle
- Send bill directly to the customer via WhatsApp with a digital invoice link

### 📦 Inventory (Admin only)
- Full CRUD on medicine products
- **Expiry date is mandatory** on every product
- Track stock quantity, low-stock threshold, batch number, manufacturer, HSN
- Export the complete product catalog to CSV

### 🔔 Stock Alerts (Staff & Admin)
- Read-only view of items that are low on stock or expiring soon
- Audible alert when new low-stock items are detected

### 📜 Order History
- Search orders by ID, customer name, or phone number
- Filter by source (Online / Offline) and status
- Period filters (All Time, Today, Week, Month, Year, Custom range)
- View detailed order modal
- Print / download invoice as PDF
- Resend invoice via WhatsApp
- Export filtered orders to CSV (admin only)
- Delete invoices (admin only)

### 📊 Analytics Dashboard (Admin only)
- KPIs: total revenue, completed bills, offline/online split, items sold, avg order value
- Today's Sales tab with revenue, bills, items sold, and top items
- Monthly and weekly revenue trend charts
- Product sales leaderboard with market share
- Coupon / promo campaign performance tracking
- Custom period filters and contact/invoice search

### 📱 PWA & Mobile
- Installable as a standalone app
- Offline-first service worker with network-first caching
- Responsive mobile-friendly UI

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Browser `localStorage` for data persistence (no external DB required)
- lucide-react (icons)

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Vinayaka-Medicals-POS
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
ADMIN_PASSCODE=your-admin-passcode
STAFF_PASSCODE=your-staff-passcode
```

### 3. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000.

- Public store page: `/`
- POS terminal: `/pos/admin/secure/control-panel/vinayaka-medicals`
- Digital invoice: `/invoice/[invoice-id]`

## Data Storage

All data (products, customers, orders, order items) is persisted in the browser's `localStorage` under the key `vinayaka_medicals_store_v1`. No external database is required.

Because the store lives in the browser, data is per-device — clearing browser data will wipe it. For multi-device sync, plug in a real backend by swapping `lib/localStore.ts` for a remote implementation with the same API surface.

## Roles

- **Staff** — Billing Panel, Order History, Stock Alerts (view-only).
- **Admin** — Full access, including Inventory CRUD, Analytics Dashboard, and delete permissions.

The role is determined by which passcode is used to log in.

## License

© 2026 VINAYAKA MEDICALS. All Rights Reserved.

Powered by [Cenexa Systems](https://www.cenexasystems.com/).
