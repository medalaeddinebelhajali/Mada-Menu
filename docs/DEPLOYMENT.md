# DEPLOYMENT GUIDE: MADA MENU SAAS

## 1. Overview & Deployment Strategy

Mada Menu is built with Vite, React 18, and Supabase PostgreSQL. It can be deployed to static web hosts (Netlify, Vercel, Cloudflare Pages) with serverless edge functions for payment webhooks.

---

## 2. Supabase Database Migration

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Open the SQL Editor in your Supabase dashboard.
3. Execute the migration script located at:
   `supabase/migrations/20261009000000_schema_and_rls.sql`
4. Confirm that all 14 tables, helper functions, and RLS policies are active.
5. In Storage, create two public buckets: `restaurant-logos` and `product-images`.

---

## 3. Environment Variables Setup

Configure the following variables in your hosting provider settings (Netlify / Vercel):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_KONNECT_API_KEY=your-konnect-api-key
VITE_KONNECT_WALLET_ID=your-konnect-wallet-id
VITE_KONNECT_MODE=production
```

---

## 4. Building & Deploying Static Frontend

```bash
# Clean build command
npm run build
```

The output files in `dist/` should be published to your web host. 

For Netlify deployments, the included `netlify.toml` automatically handles Single Page Application (SPA) routing redirects to `index.html`.
