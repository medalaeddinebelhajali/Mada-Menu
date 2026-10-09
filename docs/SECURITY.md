# SECURITY MODEL & POLICIES: MADA MENU

## 1. Threat Model & Security Principles

Mada Menu operates as a multi-tenant SaaS. Security is governed by three primary pillars:
1. **Zero Data Leakage**: Tenant A must never view, mutate, or delete Tenant B's private data.
2. **Server-Enforced Authorization**: Client applications are treated as untrusted. Roles (`owner`, `manager`, `staff`, `super_admin`), quota limits, and plan statuses are checked server-side via Supabase RLS and database triggers.
3. **Immutability of Audit Trails & Billing**: Audit logs, completed payments, and invoices cannot be edited or deleted by non-super-admin users.

---

## 2. Row Level Security (RLS) Rules Matrix

| Table | SELECT Policy | INSERT / UPDATE / DELETE Policy |
| :--- | :--- | :--- |
| `profiles` | User can read own profile; Super Admins read all. | User can update own non-privileged fields (`full_name`, `phone`, `preferred_language`). Cannot set `is_super_admin`. |
| `restaurants` | Members of restaurant OR public lookup by slug for active restaurants. | Only restaurant `owner` or `manager` can update settings. Only valid plan holders can insert new restaurants. |
| `restaurant_members` | Members of the same restaurant. | Only `owner` can add/remove members or change roles. |
| `categories` | Public read for active categories; Restaurant members read all. | `owner` and `manager` can insert/update/delete within their restaurant. |
| `products` | Public read for available products; Restaurant members read all. | `owner` and `manager` can insert/update/delete within their restaurant, enforced by plan product limit trigger. |
| `plans` | Public read for active plans. | Only `is_super_admin = true` can create/update plans. |
| `subscriptions` | Restaurant members read their own subscription. | System/Server-only or Super Admin for write operations. |
| `payments` | Restaurant members read payment history. | Read-only for tenants; Write operations restricted to Webhook edge functions. |
| `invoices` | Restaurant members read own invoices. | Immutable once issued. |
| `licenses` | Licence owner reads own licence. | Write operations restricted to Super Admin. |
| `audit_logs` | Super Admin read-only. | Append-only via server functions. |

---

## 3. Webhook & Payment Security

1. **Idempotency**: Webhook events are keyed by `event_id`. Duplicate webhook payloads are logged in `webhook_events` and acknowledged without re-processing.
2. **Signature Verification**: Webhooks from payment gateways (Konnect) require secret token header checks.
3. **No Frontend Success Trust**: The client returning to a `/payment/success` URL never activates a subscription directly. Subscriptions are activated exclusively via validated webhook payload processing or backend status verification.

---

## 4. File Upload & Storage Security

1. **Bucket Constraints**: Supabase storage buckets `restaurant-logos` and `product-images` enforce strict MIME-type checks (`image/jpeg`, `image/png`, `image/webp`).
2. **Size Restrictions**: Logo uploads are capped at **2MB**; product image uploads are capped at **5MB**.
3. **Public Access**: Uploaded media buckets are public read-only with authenticated user write access scoped to path `/restaurant_id/*`.

---

## 5. Defense Against Privilege Escalation

- Users cannot update `profiles.is_super_admin`. Database RLS policies ignore `is_super_admin` in `UPDATE` `WITH CHECK` clauses for regular user tokens.
- Security-critical helper functions operate under `SECURITY DEFINER` with explicit search paths to prevent path-injection attacks.
