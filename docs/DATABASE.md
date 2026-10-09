# DATABASE ARCHITECTURE: MADA MENU

## 1. Overview & Schema Design

The **Mada Menu** database is designed for PostgreSQL on Supabase. It uses a **multi-tenant architecture** with strong Row Level Security (RLS) enforcement.

Every tenant resource (categories, products, subscriptions, invoices, support tickets) is linked directly or via hierarchy to a `restaurant_id`.

---

## 2. Entity-Relationship Diagram (ERD Overview)

```
[ auth.users ]
     │ 1:1
[ profiles ] ───< [ restaurant_members ] >─── [ restaurants ]
                          │                       │  │  │
                    Role Access                   │  │  └───< [ categories ] >───< [ products ]
                                                  │  └───< [ subscriptions ] >───< [ payments ] >───< [ invoices ]
                                                  └──────< [ licenses ]
```

---

## 3. Table Specifications

### 3.1 `profiles`
Extends `auth.users` with application-specific user metadata.
- `id` (UUID, PRIMARY KEY, REFERENCES auth.users ON DELETE CASCADE)
- `email` (TEXT, NOT NULL)
- `full_name` (TEXT)
- `phone` (TEXT)
- `preferred_language` (TEXT, DEFAULT 'fr')
- `is_super_admin` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.2 `restaurants`
Stores establishment profile and visual customizer configuration.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL)
- `slug` (TEXT, UNIQUE, NOT NULL)
- `logo_url` (TEXT)
- `cover_url` (TEXT)
- `description` (TEXT)
- `phone` (TEXT)
- `whatsapp` (TEXT)
- `address` (TEXT)
- `city` (TEXT)
- `currency` (TEXT, DEFAULT 'TND')
- `theme_color` (TEXT, DEFAULT '#D97706') -- Amber/Gold primary palette
- `theme_mode` (TEXT, DEFAULT 'system') -- light, dark, system
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.3 `restaurant_members`
Maps users to restaurants with tenant-specific roles (`owner`, `manager`, `staff`).
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `restaurant_id` (UUID, REFERENCES restaurants ON DELETE CASCADE)
- `user_id` (UUID, REFERENCES profiles ON DELETE CASCADE)
- `role` (TEXT, NOT NULL, CHECK (role IN ('owner', 'manager', 'staff')))
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- UNIQUE(`restaurant_id`, `user_id`)

### 3.4 `categories`
Groups products logically per restaurant.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `restaurant_id` (UUID, REFERENCES restaurants ON DELETE CASCADE)
- `name_fr` (TEXT, NOT NULL)
- `name_ar` (TEXT)
- `icon` (TEXT)
- `sort_order` (INTEGER, DEFAULT 0)
- `is_visible` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.5 `products`
Individual menu items offered by a restaurant.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `restaurant_id` (UUID, REFERENCES restaurants ON DELETE CASCADE)
- `category_id` (UUID, REFERENCES categories ON DELETE SET NULL)
- `name_fr` (TEXT, NOT NULL)
- `name_ar` (TEXT)
- `description_fr` (TEXT)
- `description_ar` (TEXT)
- `price` (NUMERIC(10, 3), NOT NULL) -- TND format (e.g. 3.500)
- `image_url` (TEXT)
- `is_available` (BOOLEAN, DEFAULT true)
- `is_featured` (BOOLEAN, DEFAULT false)
- `sort_order` (INTEGER, DEFAULT 0)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.6 `plans`
SaaS tier offerings managed by super admin.
- `id` (TEXT, PRIMARY KEY) -- 'free', 'starter', 'pro'
- `name_fr` (TEXT, NOT NULL)
- `name_ar` (TEXT, NOT NULL)
- `price_monthly` (NUMERIC(10, 3), NOT NULL)
- `max_restaurants` (INTEGER, NOT NULL)
- `max_products_per_restaurant` (INTEGER, NOT NULL)
- `features` (JSONB, DEFAULT '{}'::jsonb)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.7 `subscriptions`
Active and past restaurant subscriptions.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `restaurant_id` (UUID, REFERENCES restaurants ON DELETE CASCADE)
- `plan_id` (TEXT, REFERENCES plans ON DELETE RESTRICT)
- `status` (TEXT, NOT NULL, CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')))
- `current_period_start` (TIMESTAMPTZ, NOT NULL)
- `current_period_end` (TIMESTAMPTZ, NOT NULL)
- `cancel_at_period_end` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.8 `payments`
Immutable record of customer payment transactions.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `subscription_id` (UUID, REFERENCES subscriptions ON DELETE SET NULL)
- `restaurant_id` (UUID, REFERENCES restaurants ON DELETE CASCADE)
- `amount` (NUMERIC(10, 3), NOT NULL)
- `currency` (TEXT, DEFAULT 'TND')
- `provider` (TEXT, NOT NULL) -- 'konnect', 'sandbox'
- `provider_reference` (TEXT)
- `status` (TEXT, NOT NULL, CHECK (status IN ('pending', 'completed', 'failed', 'refunded')))
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.9 `invoices`
Formal tax invoices and receipts.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `invoice_number` (TEXT, UNIQUE, NOT NULL)
- `payment_id` (UUID, REFERENCES payments ON DELETE SET NULL)
- `restaurant_id` (UUID, REFERENCES restaurants ON DELETE CASCADE)
- `amount` (NUMERIC(10, 3), NOT NULL)
- `tax_amount` (NUMERIC(10, 3), DEFAULT 0)
- `pdf_url` (TEXT)
- `issued_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.10 `licenses`
One-time perpetual / contractual software purchase licence tracking.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `license_key` (TEXT, UNIQUE, NOT NULL)
- `owner_id` (UUID, REFERENCES profiles ON DELETE CASCADE)
- `max_restaurants` (INTEGER, DEFAULT 1)
- `status` (TEXT, NOT NULL, CHECK (status IN ('active', 'suspended', 'revoked', 'expired')))
- `terms_version` (TEXT, DEFAULT 'v1.0')
- `issued_at` (TIMESTAMPTZ, DEFAULT NOW())
- `expires_at` (TIMESTAMPTZ)

### 3.11 `webhook_events`
Idempotent payment webhook event audit ledger.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `event_id` (TEXT, UNIQUE, NOT NULL)
- `provider` (TEXT, NOT NULL)
- `payload` (JSONB, NOT NULL)
- `processed` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.12 `notifications`
In-app and email transactional notifications.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `user_id` (UUID, REFERENCES profiles ON DELETE CASCADE)
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL) -- 'payment', 'subscription', 'system'
- `is_read` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.13 `support_tickets`
Customer care support requests.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `restaurant_id` (UUID, REFERENCES restaurants ON DELETE CASCADE)
- `user_id` (UUID, REFERENCES profiles ON DELETE CASCADE)
- `subject` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `status` (TEXT, DEFAULT 'open', CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')))
- `priority` (TEXT, DEFAULT 'medium', CHECK (priority IN ('low', 'medium', 'high')))
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.14 `audit_logs`
Security and administrative sensitive operation audit trail.
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `actor_id` (UUID, REFERENCES profiles ON DELETE SET NULL)
- `action` (TEXT, NOT NULL)
- `entity_type` (TEXT, NOT NULL)
- `entity_id` (TEXT)
- `details` (JSONB)
- `ip_address` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

---

## 4. Key Database Functions & Triggers

1. `check_product_limit()`: Trigger function before INSERT on `products` to ensure product count does not exceed plan quota.
2. `check_restaurant_limit()`: Trigger function before INSERT on `restaurants` ensuring owner does not exceed active subscription max restaurants.
3. `handle_new_user()`: Trigger function on `auth.users` to automatically create a corresponding `profiles` record upon signup.
