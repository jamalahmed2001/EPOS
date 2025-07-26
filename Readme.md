# Ministry of Vapes Platform

A unified, full‑stack solution providing:

* **E‑commerce Storefront**: A dynamic, SEO‑optimized, Next.js-based web store for customers to browse, purchase, and manage account details.
* **Point of Sale (POS) System**: An in‑store web app for staff to process sales, accept payments, and scan customer QR codes for loyalty and rewards.
* **Admin Dashboard**: Analytical interface to monitor sales, inventory, customer behavior, and marketing performance.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features & Requirements](#features--requirements)

   * [E‑commerce Storefront](#e‑commerce-storefront)
   * [POS System](#pos-system)
   * [QR Code Loyalty & Rewards](#qr-code-loyalty--rewards)
   * [Admin Dashboard](#admin-dashboard)
4. [Architecture & Data Flow](#architecture--data-flow)
5. [Setup & Development](#setup--development)
6. [Deployment](#deployment)
7. [Future Enhancements](#future-enhancements)
8. [License](#license)

---

## Project Overview

**Ministry of Vapes** is designed as a modular, future‑proof platform to serve both online customers and brick‑and‑mortar stores under a single codebase. Built on the T3 Stack (Next.js, tRPC, Prisma, Tailwind CSS) with Supabase as the backend, it delivers:

* A performant, SEO-friendly storefront with product catalog, cart, and secure checkout.
* An in-store POS interface enabling quick transactions and integrated payment processing.
* A loyalty program leveraging QR code scans to track customer rewards across channels.
* A robust admin panel providing real-time analytics and inventory management.

By combining Next.js’s hybrid rendering, Supabase’s real‑time database, and a Jamstack deployment on Vercel, the platform scales seamlessly from MVP to enterprise.

---

## Tech Stack

| Layer          | Technology                  | Purpose                                                    |   |      |                                             |
| -------------- | --------------------------- | ---------------------------------------------------------- | - | ---- | ------------------------------------------- |
| **Frontend**   | Next.js (v14, Pages Router) | SSG/SSR via pages router, built-in SEO, Image Optimization |   |      |                                             |
|                | React                       | Component architecture                                     |   |      |                                             |
|                | Tailwind CSS + shadcn       | Utility-first styling + prebuilt UI components             |   |      |                                             |
| **API Layer**  | tRPC                        | Type-safe RPC routes, zero-overhead codegen                |   | tRPC | Type-safe RPC routes, zero-overhead codegen |
|                | NextAuth.js                 | Authentication & session management                        |   |      |                                             |
| **Database**   | Supabase Postgres           | Relational storage, real-time subscriptions                |   |      |                                             |
|                | Supabase Edge Funcs         | Serverless functions for webhooks, auth hooks              |   |      |                                             |
| **ORM**        | Prisma                      | Schema-driven DB migrations & type-safe queries            |   |      |                                             |
| **Payments**   | Stripe + Stripe Terminal    | Online and in-person payment processing                    |   |      |                                             |
| **Hosting/CI** | Vercel + GitHub Actions     | Zero-config deploys, preview environments, CI/CD           |   |      |                                             |
| **Monitoring** | Sentry, PostHog             | Error tracking, event analytics                            |   |      |                                             |

---

## Features & Requirements

### E‑commerce Storefront

**Goal**: Provide an intuitive shopping experience that ranks #1 on search engines and is optimized for LLM ingestion (structured data, semantic markup).

* **Product Catalog**: Categories, search, filters, pagination, rich snippets.
* **Product Detail Pages**: High-res images, descriptions, pricing, reviews (JSON-LD schema), FAQ schema, LLM-friendly meta descriptions.
* **Cart & Checkout**: Persistent cart, guest & registered checkout, Stripe integration, order confirmation emails, support for **subscriptions** (recurring billing) seamlessly integrated in flow.
* **Account Management**: User profiles, order history, saved addresses, password reset, subscription management.
* **Loyalty & Referrals**: Track orders; after 10 completed orders, customers receive **20% off** on orders over £20. Support **referral codes** and **promo codes** both online and in-store.
* **Content Marketing**: Blog/FAQ using MDX, dynamic sitemap, Open Graph tags, semantic HTML5 for LLM and SEO dominance.
* **SEO & Performance**: Metadata per-page, incremental static regeneration (ISR), responsive images, structured data, LLM-optimized content outlines and headings.

### POS System

**Goal**: Enable in-store staff to process transactions quickly and accurately with full customer context.

* **Product Lookup**: Search by name, SKU, barcode scanner input, or QR code scan.
* **Customer Lookup & Enrollment**: Associate orders with existing customers or **register new customers** on-the-fly, including loyalty account creation.
* **Cart Interface**: Add/remove items, adjust quantities, apply **on-demand discounts** and **refunds** directly.
* **Payment Processing**: Integrate Stripe Terminal SDK for chip & contactless; support refunds via the same interface.
* **Subscriptions**: Sign up customers for recurring product subscriptions in POS.
* **Receipt Printing**: HTML/CSS-based printouts or PDF generation with loyalty and subscription info.
* **Inventory Sync**: Real-time deduction via atomic DB transactions (Prisma + Supabase).

### QR Code Loyalty & Rewards

**Goal**: Reward repeat customers and gather engagement data across channels.

* **QR Code Generation**: Unique per-user codes, displayed in account area & on receipts.
* **Scan Flow**: POS app scans code → tRPC endpoint validates, **credits loyalty points**, and checks **order count** for tiered discount (20% off over £20 after 10 orders).
* **Tiered Rewards**: Points and order-count thresholds for discounts or freebies; redeem codes at checkout or in POS.
* **Referral Program**: Generate unique referral links and codes; track referrals, credit both referrer and referee.
* **Analytics**: Track scan rates, referral conversions, redemption rates, subscription uptake.

### Admin Dashboard

**Goal**: Enable in-store staff to process transactions quickly and accurately.

* **Product Lookup**: Search by name, SKU, or barcode scanner input.
* **Cart Interface**: Add/remove items, adjust quantities, apply discounts.
* **Payment Processing**: Integrate Stripe Terminal SDK for chip & contactless.
* **Receipt Printing**: HTML/CSS-based printouts or PDF generation.
* **Inventory Sync**: Real-time deduction via atomic DB transactions (Prisma + Supabase).

### QR Code Loyalty & Rewards

**Goal**: Reward repeat customers and gather engagement data.

* **QR Code Generation**: Unique per-user codes, displayed in account area & on receipts.
* **Scan Flow**: POS app scans code → tRPC endpoint validates & credits points.
* **Tiered Rewards**: Points thresholds for discounts or freebies; redeem codes at checkout.
* **Analytics**: Track scan rates, redemption rates.

### Admin Dashboard

**Goal**: Provide actionable insights and management tools for store operators.

* **Sales Overview**: Daily, weekly, monthly revenue, order volume.
* **Inventory Management**: Current stock levels, low-stock alerts, restock workflows.
* **Customer Insights**: Top customers by spend, loyalty tier distributions.
* **Marketing Metrics**: Blog performance, coupon usage, referral sources.
* **User Roles & Permissions**: Admin vs Manager vs Staff roles.

---

## Architecture & Data Flow

1. **Client** (Next.js) makes RPC calls to **tRPC** routers.
2. **tRPC** handlers use **Prisma** to read/write **Supabase Postgres**.
3. **Supabase Auth** issues JWTs, NextAuth.js manages sessions.
4. **Stripe Webhooks** → Supabase Edge Function → tRPC handler → DB updates.
5. **Real-time** inventory & order updates pushed to clients via Supabase subscriptions.
6. **Vercel** serves static assets, SSR pages, and Edge Functions.

---

## Setup & Development

1. **Clone repo**:

   ```bash
   git clone https://github.com/<org>/ministry-of-vapes.git
   cd ministry-of-vapes
   ```
2. **Configure environment**:

   * Create a Supabase project, copy `.env.example` to `.env`, set keys.
   * Set up Stripe API keys and Terminal credentials.
3. **Install dependencies**:

   ```bash
   npm install
   ```
4. **Database migrations**:

   ```bash
   npx prisma migrate dev
   ```
5. **Run locally**:

   ```bash
   npm run dev
   ```

---

## Deployment

* **Vercel**: Connect GitHub repo, auto-deploy `main` branch, set environment variables.
* **Supabase**: Upgrade DB tier as needed, configure Edge Functions, set webhook URLs.
* **Stripe**: Activate production keys, configure webhooks endpoint in Supabase.

---

## Future Enhancements

* Offline-capable POS with local persistence
* Multi-warehouse inventory support
* Mobile apps (React Native / Expo)
* Third-party age verification integration
* Advanced A/B testing, personalization engine

---

## Development & Coding Guidelines

* **Package Manager**: Use **pnpm** for all installs and scripts to ensure fast, deterministic builds.
* **Component Architecture**: Build **functional** React components only. Group related components in feature folders; create new files only when the change demands separation of concerns.
* **State Management**: Centralize global state in **Zustand** stores under `src/store` for predictable, lightweight state logic.
* **Utilities & Helpers**: Place reusable functions in `src/helpers` or `src/utils`. Keep utilities small, single-purpose, and well-documented.
* **Project Structure**: Maintain one mono-repo. Separate the **storefront**, **POS**, and **admin** sections into distinct directories under `src/pages`, but share common modules via `src/components`, `src/store`, `src/utils`.
* **Code Quality**: Write concise, production-ready TypeScript. Avoid unnecessary abstraction or verbosity. Prioritize performance, accessibility, and scalability.
* **Modularity & Reusability**: Favor small, composable hooks and components. Keep business logic decoupled from UI.
* **Naming & Styles**: Follow established naming conventions (PascalCase for components, camelCase for functions/variables). Apply Tailwind classes directly, minimize custom CSS.

---

## License

MIT © Ministry of Vapes
