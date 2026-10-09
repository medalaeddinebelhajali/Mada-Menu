# MADA MENU — SAAS PLATFORM FOR CAFÉS & RESTAURANTS IN TUNISIA 🇹🇳

**Mada Menu** is a complete, production-oriented Software-as-a-Service (SaaS) platform designed for cafés, coffee shops, salons de thé, and restaurants in Tunisia. The platform enables business owners to digitalize their menus with mobile-first, QR-code-driven experiences, manage multiple establishments, enforce subscription quotas (Free, Starter, Pro), and process local payments via Tunisian payment gateway adapters (Konnect).

---

## 🌟 Key Features

### 1. Public Marketing Website
- High-converting Landing Page with hero section, live interactive demo showcase, features grid, pricing tier cards in TND, FAQ accordion, contact form, and legal policies.
- Dedicated pages for **Features**, **Pricing**, **FAQ**, **Contact**, **Terms of Service**, **Privacy Policy**, and **Billing Policy**.

### 2. Multi-Language & RTL Layout Support
- Instant bilingual toggle between **French (FR)** and **Arabic (AR)**.
- Native Right-to-Left (RTL) document direction rendering (`dir="rtl"`).

### 3. Public QR Menu (`/m/:slug`)
- Ultra-fast, mobile-first menu view requiring zero visitor authentication.
- Stable QR codes (PNG & SVG HD formats) that remain unchanged even when product prices or menu items are updated.
- Search bar, category filters, disponibility badges (Disponible / Épuisé), prices formatted in Tunisian Dinar (`TND`).

### 4. Merchant Dashboard
- Overview analytics (Product quota bar, active subscription status, quick action links).
- **Category Manager**: Add, edit, delete, and reorder categories.
- **Product Manager**: Manage photos, descriptions in FR/AR, prices in TND, disponibility toggles, with automated plan quota enforcement.
- **Appearance & Brand Customizer**: Custom color palette, logo upload, cover banner, description, and contact info.
- **QR Code Engine**: Instant PNG and SVG vector downloads for table placement.
- **Subscription & Invoicing**: Konnect payment gateway adapter / Sandbox simulator, status tracking, payment receipts, and software licence management.
- **Team Management**: Role-based permissions (`owner`, `manager`, `staff`).
- **Support System**: Customer ticket creation and tracking.

### 5. Super Admin Dashboard (`/super-admin`)
- Accessible only to authorized super administrators (`is_super_admin = true`).
- System-wide overview (Total revenue in TND, client restaurants, active subscriptions).
- Customer management, global plan configurator, unique contractual licence key generator, audit logs, and support ticket manager.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ or v22+
- npm v10+

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```bash
cp .env.example .env
```

3. Start local development server:
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

---

## 🧪 Testing & Verification

Run automated Vitest unit and security isolation tests:
```bash
npm run test
```

Run TypeScript compilation check & Vite production build:
```bash
npm run build
```

---

## 📚 Documentation Links
- [Project Architecture & Milestones](file:///c:/Users/belhaj%20ali/Downloads/mada-menu/mada-menu/docs/PROJECT_PLAN.md)
- [Database Schema & ERD](file:///c:/Users/belhaj%20ali/Downloads/mada-menu/mada-menu/docs/DATABASE.md)
- [Security Model & RLS Policies](file:///c:/Users/belhaj%20ali/Downloads/mada-menu/mada-menu/docs/SECURITY.md)
- [Test Plan & Acceptance Criteria](file:///c:/Users/belhaj%20ali/Downloads/mada-menu/mada-menu/docs/TEST_PLAN.md)
- [Deployment Guide](file:///c:/Users/belhaj%20ali/Downloads/mada-menu/mada-menu/docs/DEPLOYMENT.md)
- [Merchant User Guide](file:///c:/Users/belhaj%20ali/Downloads/mada-menu/mada-menu/docs/USER_GUIDE.md)
- [Super Admin Guide](file:///c:/Users/belhaj%20ali/Downloads/mada-menu/mada-menu/docs/ADMIN_GUIDE.md)
