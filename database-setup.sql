-- ============================================================
--  MADA MENU — Base de données complète Supabase
--  Tables + RLS + Fonctions SQL + Données initiales
--  Projet : SaaS de menus numériques QR (Tunisie)
-- ============================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 1 : TYPES ÉNUMÉRÉS
-- ============================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_tier') THEN
    CREATE TYPE plan_tier AS ENUM ('free', 'starter', 'pro');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'expired');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'license_status') THEN
    CREATE TYPE license_status AS ENUM ('active', 'suspended', 'revoked', 'expired');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_mode') THEN
    CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'system');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_provider') THEN
    CREATE TYPE payment_provider AS ENUM ('konnect', 'sandbox');
  END IF;
END $$;

-- ============================================================
-- SECTION 2 : TABLES PRINCIPALES
-- ============================================================

-- 2.1 — Profils utilisateurs (extension de auth.users Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT        NOT NULL,
  full_name          TEXT,
  phone              TEXT,
  preferred_language TEXT        NOT NULL DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'ar', 'en')),
  is_super_admin     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 — Restaurants / Cafés / Établissements
CREATE TABLE IF NOT EXISTS public.restaurants (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  logo_url    TEXT,
  cover_url   TEXT,
  description TEXT,
  phone       TEXT,
  whatsapp    TEXT,
  address     TEXT,
  city        TEXT        NOT NULL DEFAULT 'Tunis',
  currency    TEXT        NOT NULL DEFAULT 'TND',
  theme_color TEXT        NOT NULL DEFAULT '#d97706',
  bg_color    TEXT        NOT NULL DEFAULT '#020617',
  theme_mode  theme_mode  NOT NULL DEFAULT 'dark',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS bg_color TEXT NOT NULL DEFAULT '#020617';

-- 2.3 — Membres d'un restaurant (propriétaire, gérant, staff)
CREATE TABLE IF NOT EXISTS public.restaurant_members (
  id            UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID      NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id       UUID      NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, user_id)
);

-- 2.4 — Catégories du menu
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name_fr       TEXT        NOT NULL,
  name_ar       TEXT,
  icon          TEXT        NOT NULL DEFAULT '🍽️',
  sort_order    INT         NOT NULL DEFAULT 0,
  is_visible    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 — Produits du menu
CREATE TABLE IF NOT EXISTS public.products (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id  UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id    UUID        REFERENCES public.categories(id) ON DELETE SET NULL,
  name_fr        TEXT        NOT NULL,
  name_ar        TEXT,
  description_fr TEXT        NOT NULL DEFAULT '',
  description_ar TEXT,
  price          NUMERIC(10,3) NOT NULL DEFAULT 0,
  image_url      TEXT,
  is_available   BOOLEAN     NOT NULL DEFAULT TRUE,
  is_featured    BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order     INT         NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 — Plans tarifaires
CREATE TABLE IF NOT EXISTS public.plans (
  id                          plan_tier PRIMARY KEY,
  name_fr                     TEXT      NOT NULL,
  name_ar                     TEXT      NOT NULL,
  price_monthly               NUMERIC(10,3) NOT NULL DEFAULT 0,
  max_restaurants             INT       NOT NULL DEFAULT 1,
  max_products_per_restaurant INT       NOT NULL DEFAULT 15,
  features                    JSONB     NOT NULL DEFAULT '{}',
  is_active                   BOOLEAN   NOT NULL DEFAULT TRUE
);

-- 2.7 — Abonnements
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id        UUID                NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  plan_id              plan_tier           NOT NULL REFERENCES public.plans(id),
  status               subscription_status NOT NULL DEFAULT 'trial',
  current_period_start TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  current_period_end   TIMESTAMPTZ         NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN             NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id)
);

-- 2.8 — Paiements
CREATE TABLE IF NOT EXISTS public.payments (
  id                 UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id    UUID             REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  restaurant_id      UUID             NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  amount             NUMERIC(10,3)    NOT NULL,
  currency           TEXT             NOT NULL DEFAULT 'TND',
  provider           payment_provider NOT NULL DEFAULT 'konnect',
  provider_reference TEXT,
  status             payment_status   NOT NULL DEFAULT 'pending',
  created_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- 2.9 — Factures
CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT          NOT NULL UNIQUE,
  payment_id     UUID          REFERENCES public.payments(id) ON DELETE SET NULL,
  restaurant_id  UUID          NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  amount         NUMERIC(10,3) NOT NULL,
  tax_amount     NUMERIC(10,3) NOT NULL DEFAULT 0,
  pdf_url        TEXT,
  issued_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2.10 — Licences logicielles
CREATE TABLE IF NOT EXISTS public.licenses (
  id             UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_key    TEXT           NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  owner_id       UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_restaurants INT           NOT NULL DEFAULT 1,
  status         license_status NOT NULL DEFAULT 'active',
  terms_version  TEXT           NOT NULL DEFAULT '1.0',
  issued_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ
);

-- 2.11 — Notifications utilisateurs
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  type       TEXT        NOT NULL DEFAULT 'info',
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.12 — Tickets support
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id            UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID           REFERENCES public.restaurants(id) ON DELETE SET NULL,
  user_id       UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject       TEXT           NOT NULL,
  message       TEXT           NOT NULL,
  status        ticket_status  NOT NULL DEFAULT 'open',
  priority      priority_level NOT NULL DEFAULT 'medium',
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- 2.13 — Journal d'audit
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,
  entity_type TEXT        NOT NULL,
  entity_id   TEXT,
  details     JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 3 : INDEX DE PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_restaurants_slug        ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurant_members_uid  ON public.restaurant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_members_rid  ON public.restaurant_members(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_rid          ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_rid            ON public.products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_cid            ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_rid       ON public.subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payments_rid            ON public.payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_rid            ON public.invoices(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_uid       ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_uid     ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor        ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity       ON public.audit_logs(entity_type, entity_id);

-- ============================================================
-- SECTION 4 : FONCTIONS SQL
-- ============================================================

-- 4.1 — Trigger : mise à jour auto de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_restaurants ON public.restaurants;
CREATE TRIGGER set_updated_at_restaurants
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 4.2 — Trigger : création automatique du profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'fr')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4.3 — Fonction : créer un restaurant + abonnement trial + membre owner
CREATE OR REPLACE FUNCTION public.create_restaurant_with_trial(
  p_name        TEXT,
  p_slug        TEXT,
  p_city        TEXT,
  p_description TEXT DEFAULT NULL,
  p_phone       TEXT DEFAULT NULL,
  p_owner_id    UUID DEFAULT auth.uid()
)
RETURNS public.restaurants LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_restaurant public.restaurants;
BEGIN
  -- S'assurer que le profil existe dans public.profiles
  INSERT INTO public.profiles (id, email)
  VALUES (p_owner_id, COALESCE((SELECT email FROM auth.users WHERE id = p_owner_id), 'user@mada-menu.tn'))
  ON CONFLICT (id) DO NOTHING;

  -- Créer le restaurant
  INSERT INTO public.restaurants (name, slug, city, description, phone)
  VALUES (p_name, p_slug, p_city, p_description, p_phone)
  RETURNING * INTO v_restaurant;

  -- Ajouter le propriétaire
  INSERT INTO public.restaurant_members (restaurant_id, user_id, role)
  VALUES (v_restaurant.id, p_owner_id, 'owner');

  -- Créer l'abonnement trial (14 jours)
  INSERT INTO public.subscriptions (restaurant_id, plan_id, status, current_period_end)
  VALUES (v_restaurant.id, 'free', 'trial', NOW() + INTERVAL '14 days');

  -- Log audit
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (p_owner_id, 'CREATE', 'restaurant', v_restaurant.id::TEXT,
          jsonb_build_object('name', p_name, 'slug', p_slug));

  RETURN v_restaurant;
END;
$$;


-- 4.4 — Fonction : vérifier si l'utilisateur est membre d'un restaurant
CREATE OR REPLACE FUNCTION public.is_member_of(p_restaurant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_members
    WHERE restaurant_id = p_restaurant_id
      AND user_id = auth.uid()
  );
$$;


-- 4.5 — Fonction : vérifier si l'utilisateur est owner/manager d'un restaurant
CREATE OR REPLACE FUNCTION public.is_owner_or_manager(p_restaurant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_members
    WHERE restaurant_id = p_restaurant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
  );
$$;


-- 4.6 — Fonction : vérifier si l'utilisateur est super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;


-- 4.7 — Fonction : obtenir le nombre de produits d'un restaurant
CREATE OR REPLACE FUNCTION public.get_product_count(p_restaurant_id UUID)
RETURNS INT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COUNT(*)::INT FROM public.products
  WHERE restaurant_id = p_restaurant_id;
$$;


-- 4.8 — Fonction : vérifier la limite de produits selon le plan
CREATE OR REPLACE FUNCTION public.check_product_limit(p_restaurant_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_current_count INT;
  v_max_products  INT;
BEGIN
  SELECT get_product_count(p_restaurant_id) INTO v_current_count;

  SELECT p.max_products_per_restaurant INTO v_max_products
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.restaurant_id = p_restaurant_id;

  RETURN v_current_count < COALESCE(v_max_products, 15);
END;
$$;


-- 4.9 — Fonction : obtenir le menu public complet d'un restaurant par slug
CREATE OR REPLACE FUNCTION public.get_public_menu(p_slug TEXT)
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_restaurant public.restaurants;
  v_subscription public.subscriptions;
  v_result JSON;
BEGIN
  SELECT * INTO v_restaurant FROM public.restaurants
  WHERE slug = p_slug AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Vérifier l'abonnement
  SELECT * INTO v_subscription FROM public.subscriptions
  WHERE restaurant_id = v_restaurant.id;

  -- Si l'abonnement a expiré ou que la période est dépassée
  IF v_subscription.id IS NOT NULL AND (v_subscription.status = 'expired' OR v_subscription.current_period_end < NOW()) THEN
    RETURN json_build_object(
      'restaurant', row_to_json(v_restaurant),
      'is_expired', TRUE
    );
  END IF;

  SELECT json_build_object(
    'restaurant', row_to_json(v_restaurant),
    'is_expired', FALSE,
    'categories', (
      SELECT json_agg(
        json_build_object(
          'id',         c.id,
          'name_fr',    c.name_fr,
          'name_ar',    c.name_ar,
          'icon',       c.icon,
          'sort_order', c.sort_order,
          'products', (
            SELECT json_agg(row_to_json(p) ORDER BY p.sort_order)
            FROM public.products p
            WHERE p.category_id = c.id AND p.is_available = TRUE
          )
        ) ORDER BY c.sort_order
      )
      FROM public.categories c
      WHERE c.restaurant_id = v_restaurant.id AND c.is_visible = TRUE
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;


-- 4.10 — Fonction : générer un numéro de facture unique
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_year    TEXT;
  v_seq     INT;
  v_number  TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(split_part(invoice_number, '-', 3) AS INT)), 0) + 1
  INTO v_seq
  FROM public.invoices
  WHERE invoice_number LIKE 'FAC-' || v_year || '-%';

  v_number := 'FAC-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
  RETURN v_number;
END;
$$;


-- 4.11 — Fonction : enregistrer un paiement et mettre à jour l'abonnement
CREATE OR REPLACE FUNCTION public.record_payment_and_activate(
  p_restaurant_id UUID,
  p_plan_id       plan_tier,
  p_amount        NUMERIC,
  p_provider      payment_provider DEFAULT 'konnect',
  p_reference     TEXT DEFAULT NULL
)
RETURNS public.payments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_sub_id  UUID;
  v_payment public.payments;
  v_inv_num TEXT;
BEGIN
  -- Récupérer ou créer l'abonnement
  SELECT id INTO v_sub_id FROM public.subscriptions
  WHERE restaurant_id = p_restaurant_id;

  -- Créer le paiement
  INSERT INTO public.payments (subscription_id, restaurant_id, amount, provider, provider_reference, status)
  VALUES (v_sub_id, p_restaurant_id, p_amount, p_provider, p_reference, 'completed')
  RETURNING * INTO v_payment;

  -- Mettre à jour l'abonnement
  UPDATE public.subscriptions
  SET plan_id              = p_plan_id,
      status               = 'active',
      current_period_start = NOW(),
      current_period_end   = NOW() + INTERVAL '30 days',
      cancel_at_period_end = FALSE
  WHERE restaurant_id = p_restaurant_id;

  -- Générer la facture
  v_inv_num := public.generate_invoice_number();
  INSERT INTO public.invoices (invoice_number, payment_id, restaurant_id, amount, tax_amount)
  VALUES (v_inv_num, v_payment.id, p_restaurant_id, p_amount, ROUND(p_amount * 0.19, 3));

  -- Log audit
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'PAYMENT', 'subscription', v_sub_id::TEXT,
          jsonb_build_object('plan', p_plan_id, 'amount', p_amount, 'reference', p_reference));

  RETURN v_payment;
END;
$$;


-- 4.12 — Fonction : marquer toutes les notifications comme lues
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID DEFAULT auth.uid())
RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE user_id = p_user_id AND is_read = FALSE;
$$;


-- 4.13 — Fonction : statistiques tableau de bord super admin
CREATE OR REPLACE FUNCTION public.get_super_admin_stats()
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  RETURN json_build_object(
    'total_restaurants',   (SELECT COUNT(*) FROM public.restaurants),
    'active_restaurants',  (SELECT COUNT(*) FROM public.restaurants WHERE is_active = TRUE),
    'total_users',         (SELECT COUNT(*) FROM public.profiles),
    'active_subscriptions',(SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active'),
    'trial_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'trial'),
    'total_revenue',       (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'completed'),
    'open_tickets',        (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'open'),
    'plans_breakdown', (
      SELECT json_agg(json_build_object('plan', plan_id, 'count', cnt))
      FROM (SELECT plan_id, COUNT(*) AS cnt FROM public.subscriptions GROUP BY plan_id) t
    )
  );
END;
$$;


-- ============================================================
-- SECTION 5 : ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs          ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_super_admin());
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ── RESTAURANTS ───────────────────────────────────────────────
DROP POLICY IF EXISTS "restaurants_select_public" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_insert_member" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_update_member" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_delete_admin"  ON public.restaurants;
CREATE POLICY "restaurants_select_public"  ON public.restaurants FOR SELECT USING (is_active = TRUE OR public.is_member_of(id) OR public.is_super_admin());
CREATE POLICY "restaurants_insert_member"  ON public.restaurants FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "restaurants_update_member"  ON public.restaurants FOR UPDATE USING (public.is_owner_or_manager(id) OR public.is_super_admin());
CREATE POLICY "restaurants_delete_admin"   ON public.restaurants FOR DELETE USING (public.is_super_admin());

-- ── RESTAURANT MEMBERS ────────────────────────────────────────
DROP POLICY IF EXISTS "members_select" ON public.restaurant_members;
DROP POLICY IF EXISTS "members_insert" ON public.restaurant_members;
DROP POLICY IF EXISTS "members_update" ON public.restaurant_members;
DROP POLICY IF EXISTS "members_delete" ON public.restaurant_members;
CREATE POLICY "members_select"  ON public.restaurant_members FOR SELECT USING (public.is_member_of(restaurant_id) OR public.is_super_admin());
CREATE POLICY "members_insert"  ON public.restaurant_members FOR INSERT WITH CHECK (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());
CREATE POLICY "members_update"  ON public.restaurant_members FOR UPDATE USING (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());
CREATE POLICY "members_delete"  ON public.restaurant_members FOR DELETE USING (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());

-- ── CATEGORIES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
DROP POLICY IF EXISTS "categories_insert"        ON public.categories;
DROP POLICY IF EXISTS "categories_update"        ON public.categories;
DROP POLICY IF EXISTS "categories_delete"        ON public.categories;
CREATE POLICY "categories_select_public" ON public.categories FOR SELECT USING (
  (SELECT is_active FROM public.restaurants WHERE id = restaurant_id) = TRUE
  OR public.is_member_of(restaurant_id)
  OR public.is_super_admin()
);
CREATE POLICY "categories_insert"        ON public.categories FOR INSERT WITH CHECK (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());
CREATE POLICY "categories_update"        ON public.categories FOR UPDATE USING (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());
CREATE POLICY "categories_delete"        ON public.categories FOR DELETE USING (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());

-- ── PRODUCTS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_insert"        ON public.products;
DROP POLICY IF EXISTS "products_update"        ON public.products;
DROP POLICY IF EXISTS "products_delete"        ON public.products;
CREATE POLICY "products_select_public"   ON public.products FOR SELECT USING (
  (is_available = TRUE AND (SELECT is_active FROM public.restaurants WHERE id = restaurant_id) = TRUE)
  OR public.is_member_of(restaurant_id)
  OR public.is_super_admin()
);
CREATE POLICY "products_insert"          ON public.products FOR INSERT WITH CHECK (
  (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin())
  AND public.check_product_limit(restaurant_id)
);
CREATE POLICY "products_update"          ON public.products FOR UPDATE USING (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());
CREATE POLICY "products_delete"          ON public.products FOR DELETE USING (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());

-- ── PLANS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "plans_select_all"   ON public.plans;
DROP POLICY IF EXISTS "plans_insert_admin" ON public.plans;
DROP POLICY IF EXISTS "plans_update_admin" ON public.plans;
DROP POLICY IF EXISTS "plans_delete_admin" ON public.plans;
CREATE POLICY "plans_select_all"   ON public.plans FOR SELECT USING (TRUE);
CREATE POLICY "plans_insert_admin" ON public.plans FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "plans_update_admin" ON public.plans FOR UPDATE USING (public.is_super_admin());
CREATE POLICY "plans_delete_admin" ON public.plans FOR DELETE USING (public.is_super_admin());

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON public.subscriptions;
CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT USING (public.is_member_of(restaurant_id) OR public.is_super_admin());
CREATE POLICY "subscriptions_insert" ON public.subscriptions FOR INSERT WITH CHECK (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());
CREATE POLICY "subscriptions_update" ON public.subscriptions FOR UPDATE USING (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());

-- ── PAYMENTS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());
CREATE POLICY "payments_insert" ON public.payments FOR INSERT WITH CHECK (public.is_owner_or_manager(restaurant_id) OR public.is_super_admin());

-- ── INVOICES ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT USING (public.is_member_of(restaurant_id) OR public.is_super_admin());
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT WITH CHECK (public.is_super_admin());

-- ── LICENSES ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "licenses_select" ON public.licenses;
DROP POLICY IF EXISTS "licenses_insert" ON public.licenses;
DROP POLICY IF EXISTS "licenses_update" ON public.licenses;
CREATE POLICY "licenses_select" ON public.licenses FOR SELECT USING (owner_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "licenses_insert" ON public.licenses FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "licenses_update" ON public.licenses FOR UPDATE USING (public.is_super_admin());

-- ── NOTIFICATIONS ─────────────────────────────────────────────
DROP POLICY IF EXISTS "notif_select" ON public.notifications;
DROP POLICY IF EXISTS "notif_update" ON public.notifications;
DROP POLICY IF EXISTS "notif_insert" ON public.notifications;
DROP POLICY IF EXISTS "notif_delete" ON public.notifications;
CREATE POLICY "notif_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "notif_delete" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- ── SUPPORT TICKETS ───────────────────────────────────────────
DROP POLICY IF EXISTS "tickets_select" ON public.support_tickets;
DROP POLICY IF EXISTS "tickets_insert" ON public.support_tickets;
DROP POLICY IF EXISTS "tickets_update" ON public.support_tickets;
CREATE POLICY "tickets_select" ON public.support_tickets FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "tickets_insert" ON public.support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tickets_update" ON public.support_tickets FOR UPDATE USING (user_id = auth.uid() OR public.is_super_admin());

-- ── AUDIT LOGS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "audit_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_insert" ON public.audit_logs;
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT USING (public.is_super_admin());
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT WITH CHECK (TRUE); -- interne (SECURITY DEFINER)

-- ============================================================
-- SECTION 6 : DONNÉES INITIALES (SEED)
-- ============================================================

-- 6.1 — Plans tarifaires
INSERT INTO public.plans (id, name_fr, name_ar, price_monthly, max_restaurants, max_products_per_restaurant, features, is_active)
VALUES
  ('free',    'Gratuit',  'مجاني',     0.000,  1, 15,   '{"qr_code":true,"custom_theme":false,"multi_establishment":false,"support_priority":"standard"}', TRUE),
  ('starter', 'Starter',  'مبتدئ',    49.000,  1, 100,  '{"qr_code":true,"custom_theme":true,"multi_establishment":false,"support_priority":"high"}', TRUE),
  ('pro',     'Pro',      'احترافي',   89.000,  3, 9999, '{"qr_code":true,"custom_theme":true,"multi_establishment":true,"support_priority":"vip"}', TRUE)
ON CONFLICT (id) DO UPDATE SET
  price_monthly               = EXCLUDED.price_monthly,
  max_products_per_restaurant = EXCLUDED.max_products_per_restaurant,
  features                    = EXCLUDED.features;

-- ============================================================
-- SECTION 7 : SUPABASE STORAGE (BUCKET & POLICIES)
-- ============================================================

-- Créer le bucket public menu-images s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politiques de sécurité pour le stockage d'images
DROP POLICY IF EXISTS "Menu Images Public Select" ON storage.objects;
CREATE POLICY "Menu Images Public Select" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Menu Images Authenticated Insert" ON storage.objects;
CREATE POLICY "Menu Images Authenticated Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Menu Images Authenticated Update" ON storage.objects;
CREATE POLICY "Menu Images Authenticated Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Menu Images Authenticated Delete" ON storage.objects;
CREATE POLICY "Menu Images Authenticated Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images');

-- ============================================================
-- SECTION 8 : SUPPORT PAIEMENT MOBILE D17 (TUNISIE POSTE)
-- ============================================================

-- 8.1 — Ajouter la valeur 'd17' à l'enum payment_provider si non existant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'payment_provider'::regtype 
    AND enumlabel = 'd17'
  ) THEN
    ALTER TYPE payment_provider ADD VALUE 'd17';
  END IF;
END $$;

-- 8.2 — Colonne proof_url et plan_id dans public.payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS plan_id plan_tier DEFAULT 'starter';

-- 8.3 — Politique de mise à jour des paiements pour le SuperAdmin
DROP POLICY IF EXISTS "payments_update" ON public.payments;
CREATE POLICY "payments_update" ON public.payments 
  FOR UPDATE USING (public.is_super_admin());

-- 8.4 — Fonction RPC : Soumettre un paiement D17 avec preuve et plan_id
CREATE OR REPLACE FUNCTION public.submit_d17_payment(
  p_restaurant_id UUID,
  p_amount NUMERIC,
  p_proof_url TEXT,
  p_reference TEXT DEFAULT NULL,
  p_plan_id plan_tier DEFAULT 'starter'
)
RETURNS public.payments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_sub_id UUID;
  v_payment public.payments;
BEGIN
  SELECT id INTO v_sub_id FROM public.subscriptions
  WHERE restaurant_id = p_restaurant_id;

  INSERT INTO public.payments (
    subscription_id,
    restaurant_id,
    plan_id,
    amount,
    currency,
    provider,
    provider_reference,
    proof_url,
    status
  )
  VALUES (
    v_sub_id,
    p_restaurant_id,
    p_plan_id,
    p_amount,
    'TND',
    'd17',
    COALESCE(p_reference, 'Paiement D17 vers 20934403'),
    p_proof_url,
    'pending'
  )
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

-- 8.5 — Fonction RPC : Valider un paiement D17 par l'administrateur et activer l'abonnement
CREATE OR REPLACE FUNCTION public.approve_d17_payment(
  p_payment_id UUID,
  p_plan_id plan_tier DEFAULT NULL,
  p_duration_days INT DEFAULT 30
)
RETURNS public.payments LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_payment public.payments;
  v_inv_num TEXT;
  v_target_plan plan_tier;
BEGIN
  -- Seul le Super Admin peut exécuter
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Accès refusé. Réservé au SuperAdmin.';
  END IF;

  -- Mettre à jour le statut du paiement
  UPDATE public.payments
  SET status = 'completed'
  WHERE id = p_payment_id
  RETURNING * INTO v_payment;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Paiement introuvable';
  END IF;

  -- Utiliser le plan spécifié en paramètre ou celui enregistré sur le paiement (sinon 'starter' par défaut)
  v_target_plan := COALESCE(p_plan_id, v_payment.plan_id, 'starter');

  -- Mettre à jour l'abonnement du restaurant
  UPDATE public.subscriptions
  SET plan_id              = v_target_plan,
      status               = 'active',
      current_period_start = NOW(),
      current_period_end   = NOW() + (p_duration_days || ' days')::INTERVAL,
      cancel_at_period_end = FALSE
  WHERE restaurant_id = v_payment.restaurant_id;

  -- Générer la facture
  v_inv_num := public.generate_invoice_number();
  INSERT INTO public.invoices (invoice_number, payment_id, restaurant_id, amount, tax_amount)
  VALUES (v_inv_num, v_payment.id, v_payment.restaurant_id, v_payment.amount, ROUND(v_payment.amount * 0.19, 3));

  RETURN v_payment;
END;
$$;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
-- Pour exécuter : copiez ce script dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New Query > Coller > Run
-- ============================================================

