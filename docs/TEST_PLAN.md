# TEST PLAN & ACCEPTANCE CRITERIA: MADA MENU

## 1. Overview & Verification Strategy

The test suite validates functional correctness, tenant isolation, security controls, RTL responsiveness, and quota enforcement.

---

## 2. Mandatory Security & Acceptance Test Scenarios

### Scenario 1: Multi-Tenant Data Isolation
- **Goal**: Verify Customer A cannot read or modify Customer B's menu items, categories, or restaurant settings.
- **Criteria**:
  - Requesting `/products` with User A's token returns only products belonging to User A's restaurants.
  - Direct update call to `products` belonging to Restaurant B using User A's JWT yields HTTP 403 / 0 affected rows.

### Scenario 2: Role Authorization & Privilege Protection
- **Goal**: Verify ordinary users cannot access `/super-admin` or escalate privileges.
- **Criteria**:
  - Attempting to set `is_super_admin = true` via Supabase API fails silently or returns an error without updating DB.
  - Non-super-admin navigating to `/super-admin` route is redirected to dashboard root.

### Scenario 3: Subscription Quota Enforcement
- **Goal**: Prevent users on Free Plan (max 15 products) from inserting a 16th product.
- **Criteria**:
  - Insertion attempt #16 on Free Plan throws a PostgreSQL database exception (`EXCEEDED_PRODUCT_LIMIT`).
  - Frontend displays clean user notification: "Plan product limit reached. Please upgrade to Starter."

### Scenario 4: Webhook Security & Idempotency
- **Goal**: Ensure fake, tampered, or duplicate payment webhooks cannot activate paid subscriptions.
- **Criteria**:
  - Webhook payload missing secret token returns HTTP 401.
  - Resending identical valid webhook payload returns HTTP 200 with message `Event already processed` and does not duplicate payments or extend subscription dates twice.

### Scenario 5: Public QR Menu Access & Stability
- **Goal**: Public menu at `/m/:slug` loads cleanly without authentication.
- **Criteria**:
  - Opening `/m/cafe-central` in unauthenticated browser renders logo, category tabs, and items.
  - Editing product price or name in dashboard immediately reflects on public menu refresh without altering QR code URL.

### Scenario 6: File Upload Validation
- **Goal**: Reject invalid file types or oversized files during logo/product photo upload.
- **Criteria**:
  - Attempting to upload an `.exe` or `.pdf` file to image bucket throws error.
  - File exceeding 5MB triggers validation message before upload initiation.

### Scenario 7: Localization & RTL Behavior
- **Goal**: Arabic language toggle switches entire UI layout to RTL.
- **Criteria**:
  - Main HTML element toggles `dir="rtl"`.
  - Sidebar, modal alignment, and price badges shift mirroring LTR layout without visual breakage.

---

## 3. Test Execution Matrix

| Test Suite | Framework | Target Command |
| :--- | :--- | :--- |
| **Unit & Component Tests** | Vitest + React Testing Library | `npm run test` |
| **Type Check & Lint** | TypeScript Compiler | `npx tsc --noEmit` |
| **Build Verification** | Vite | `npm run build` |
