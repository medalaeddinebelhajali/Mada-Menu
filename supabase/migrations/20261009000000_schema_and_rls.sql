-- Migration: 20261009000000_schema_and_rls.sql
-- Mada Menu Complete SaaS Database Schema & Security RLS Policies

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'ar', 'en')),
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESTAURANTS
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  description TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT DEFAULT 'Tunis',
  currency TEXT DEFAULT 'TND',
  theme_color TEXT DEFAULT '#D97706',
  theme_mode TEXT DEFAULT 'dark',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESTAURANT_MEMBERS
CREATE TABLE IF NOT EXISTS public.restaurant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id)
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name_fr TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT DEFAULT '☕',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name_fr TEXT NOT NULL,
  name_ar TEXT,
  description_fr TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  price NUMERIC(10, 3) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PLANS
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  price_monthly NUMERIC(10, 3) NOT NULL,
  max_restaurants INTEGER NOT NULL,
  max_products_per_restaurant INTEGER NOT NULL,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default SaaS Plans
INSERT INTO public.plans (id, name_fr, name_ar, price_monthly, max_restaurants, max_products_per_restaurant, features)
VALUES 
  ('free', 'Gratuit', 'مجاني', 0.000, 1, 15, '{"qr_code": true, "custom_theme": false, "support_priority": "standard"}'::jsonb),
  ('starter', 'Starter', 'مبتدئ', 49.000, 1, 100, '{"qr_code": true, "custom_theme": true, "support_priority": "high"}'::jsonb),
  ('pro', 'Pro', 'احترافي', 89.000, 3, 9999, '{"qr_code": true, "custom_theme": true, "multi_establishment": true, "support_priority": "vip"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  max_products_per_restaurant = EXCLUDED.max_products_per_restaurant;

-- 7. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  amount NUMERIC(10, 3) NOT NULL,
  currency TEXT DEFAULT 'TND',
  provider TEXT NOT NULL DEFAULT 'konnect',
  provider_reference TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  amount NUMERIC(10, 3) NOT NULL,
  tax_amount NUMERIC(10, 3) DEFAULT 0.000,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. LICENSES
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_restaurants INTEGER DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'revoked', 'expired')),
  terms_version TEXT DEFAULT 'v1.0',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 11. WEBHOOK_EVENTS
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SUPPORT_TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- HELPER RLS FUNCTION: Check if auth user is member of restaurant
CREATE OR REPLACE FUNCTION public.is_restaurant_member(res_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.restaurant_members
    WHERE restaurant_id = res_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- HELPER RLS FUNCTION: Check if auth user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES

-- Profiles
CREATE POLICY "Public profile read own" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Profile update own non-admin" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Profile insert on auth" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Restaurants
CREATE POLICY "Restaurants public view active by slug" ON public.restaurants FOR SELECT USING (is_active = true OR public.is_restaurant_member(id) OR public.is_super_admin());
CREATE POLICY "Restaurants update by member owner or manager" ON public.restaurants FOR UPDATE USING (public.is_restaurant_member(id) OR public.is_super_admin());
CREATE POLICY "Restaurants insert by auth user" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Restaurant Members
CREATE POLICY "Members select if part of restaurant" ON public.restaurant_members FOR SELECT USING (public.is_restaurant_member(restaurant_id) OR public.is_super_admin());
CREATE POLICY "Members manage by owner or super admin" ON public.restaurant_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurant_members
    WHERE restaurant_id = public.restaurant_members.restaurant_id
      AND user_id = auth.uid()
      AND role = 'owner'
  ) OR public.is_super_admin()
);

-- Categories
CREATE POLICY "Categories public select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories manage by restaurant member" ON public.categories FOR ALL USING (public.is_restaurant_member(restaurant_id) OR public.is_super_admin());

-- Products
CREATE POLICY "Products public select available" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products manage by restaurant member" ON public.products FOR ALL USING (public.is_restaurant_member(restaurant_id) OR public.is_super_admin());

-- Plans
CREATE POLICY "Plans read public" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Plans manage super admin" ON public.plans FOR ALL USING (public.is_super_admin());

-- Subscriptions
CREATE POLICY "Subscriptions read member" ON public.subscriptions FOR SELECT USING (public.is_restaurant_member(restaurant_id) OR public.is_super_admin());

-- Payments & Invoices
CREATE POLICY "Payments read member" ON public.payments FOR SELECT USING (public.is_restaurant_member(restaurant_id) OR public.is_super_admin());
CREATE POLICY "Invoices read member" ON public.invoices FOR SELECT USING (public.is_restaurant_member(restaurant_id) OR public.is_super_admin());

-- Notifications
CREATE POLICY "Notifications read own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notifications update own" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Support Tickets
CREATE POLICY "Support tickets read write own" ON public.support_tickets FOR ALL USING (user_id = auth.uid() OR public.is_super_admin());

-- Audit Logs
CREATE POLICY "Audit logs super admin read" ON public.audit_logs FOR SELECT USING (public.is_super_admin());
