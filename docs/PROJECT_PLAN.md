# PROJECT PLAN: MADA MENU — SAAS PLATFORM FOR CAFÉS & RESTAURANTS IN TUNISIA

## 1. Executive Summary & Architecture Overview

**Mada Menu** is a multi-tenant Software-as-a-Service (SaaS) platform tailored for cafés, coffee shops, and restaurants in Tunisia. The platform empowers business owners to digitalize their menus with mobile-first, QR-code-driven experiences, manage multiple establishments, enforce subscription quotas (Free, Starter, Pro), and accept local payment processing via Tunisian payment gateway adapters (Konnect / Sandbox adapter).

### Key Architectural Pillars
- **Frontend Architecture**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide Icons, Framer Motion, and i18next (supporting French and Arabic with native RTL layout).
- **Backend Architecture & Database**: Supabase PostgreSQL database with Row Level Security (RLS) policies for tenant isolation, Supabase Auth (JWT), Supabase Storage for brand logos and product images.
- **Privileged Operations & Payment Engine**: Serverless edge/adapter functions for webhook handling, payment verification (Konnect adapter), and super-administrative operations.
- **Multi-Tenancy Model**: Shared database with row-level tenant segregation based on `restaurant_id` and role permissions in `restaurant_members`.

---

## 2. Assumptions & System Decisions

1. **Localization**: Primary target users in Tunisia prefer **French** and **Arabic (RTL)**. Complete language toggle with direction handling (`dir="ltr"` and `dir="rtl"`) is built into the layout wrapper.
2. **Currency**: Official system currency is **Tunisian Dinar (TND / DT)**.
3. **QR Menu Access**: Public menus accessible at `/m/:slug` require zero visitor authentication and render with ultra-fast initial load times.
4. **Ordering Exclusion**: As specified in requirements, food ordering, delivery, and table checkout are out of scope for the public menu phase; the public menu is purely informational and interactive.
5. **Payment Adapter**: Konnect gateway integration is abstracted via an adapter pattern. If Konnect secrets are not present in `.env`, the system automatically falls back to a sandbox payment simulator.
6. **Vite Build System**: Upgrading from create-react-app (CRA) to Vite + Tailwind CSS for fast DX, optimized production bundles, and instant HMR.

---

## 3. Implementation Milestones

### Milestone 1: Project Setup, Architecture & Database Schema
- Migrate build system to **Vite** and configure **Tailwind CSS**.
- Establish clean directory structure (`src/components`, `src/pages`, `src/context`, `src/lib`, `src/services`, `src/types`, `supabase/migrations`).
- Define global design system, typography, color palette (Tunisian warmth + modern slate/gold hues), and RTL support infrastructure.
- Implement full PostgreSQL migrations for all 14 required tables and comprehensive RLS policies.

### Milestone 2: Authentication, Roles & Restaurant Onboarding
- Supabase Auth integration (email/password, verification, password recovery).
- User Profile management (`profiles` table).
- Multi-tenant ownership and membership model (`restaurant_members` with roles: `owner`, `manager`, `staff`).
- Step-by-step Restaurant Onboarding Wizard (Name, Slug availability check, Logo upload, Contact info, optional demo menu seed data).

### Milestone 3: Restaurant Dashboard & Public QR Menu
- Responsive Dashboard layout with collapsible sidebar and mobile navigation.
- Category Management (Create, Edit, Delete, Reorder with drag/drop or ordering handles).
- Product Management (Photos, descriptions, prices in TND, availability toggles, category grouping).
- Menu Appearance Customizer (Themes, colors, font styles, cover headers).
- QR Code Engine (Generation in PNG & SVG, download links, stable resolution independent of menu updates).
- Mobile-First Public Menu (`/m/:slug`) with category sticky navigation, search, filter by tag/category, dark/light theme, and RTL support.

### Milestone 4: Marketing Website & Public Pages
- High-converting Landing Page (Hero section, live interactive demo, feature breakdown, plan pricing cards, FAQ accordion, contact form).
- Dedicated pages for Features, Pricing, Terms of Service, Privacy Policy, and Billing & Cancellation Policies.

### Milestone 5: Subscription Engine & Quota Entitlements
- Plan definitions (Free: 0 TND, Starter: 49 TND/mo, Pro: 89 TND/mo).
- Feature flags & limit enforcement (Product limit: 15 for Free, 100 for Starter; Restaurant count limit: 1 for Free/Starter, 3 for Pro).
- Upgrade/Downgrade flows, status management (Trial, Active, Past-due, Grace period, Cancelled, Expired).
- Software Licence model management for perpetual or contractual one-time licence holders.

### Milestone 6: Payment Integration & Invoice Generation
- Konnect Payment Adapter & Sandbox Simulator for local development.
- Server-side transaction initialization and idempotent webhook processing.
- Immutable payment history logging and billing receipts / tax invoice document generation.

### Milestone 7: Super Admin Dashboard & System Operations
- `/super-admin` protected view for system administrators (`is_super_admin` flag).
- System analytics, user/customer management, restaurant suspension, global plan edits, audit trail logs, support ticket management.

### Milestone 8: Security Verification, Automated Testing & Final Deliverables
- Unit and integration tests (Vitest / React Testing Library / Cypress or Playwright E2E scenarios).
- Security policy verification (Tenant data leakage tests, role bypass checks, file upload constraint validation).
- Production build validation and deployment documentation (`README.md`, `docs/DEPLOYMENT.md`).

---

## 4. Risk Matrix & Mitigation Strategies

| Risk | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **RLS Policy Bypass** | High | Low | Enforce mandatory RLS on all tables with explicit sub-select checks using `auth.uid()` against `restaurant_members`. |
| **Payment Webhook Spoofing** | High | Medium | Implement signature verification, transaction status re-validation against provider API, and strict idempotency checks using `webhook_events` table. |
| **Quota Evasion via Direct API Calls** | Medium | Medium | Implement DB trigger checks and server-side RPC functions for item insertion that validate subscription quotas before insert. |
| **RTL Layout Misalignments** | Low | Medium | Use Tailwind logical properties (`ms-`, `me-`, `start-`, `end-`) and test all components in both French (LTR) and Arabic (RTL). |
