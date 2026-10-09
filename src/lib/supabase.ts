import { createClient } from '@supabase/supabase-js';
import {
  Restaurant, Category, Product, Plan, PlanTier,
  Subscription, Payment, Invoice, SupportTicket, Profile,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vinqhhpezbkndwgdpize.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_W16rD_lcbp9TrsOYSSdrdA_nhuXmho1';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Variables Supabase non définies dans l\'environnement, utilisation des valeurs par défaut.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: (async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => await fn()) as any,
  },
});

// ============================================================
// PLANS
// ============================================================
export const getPlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase.from('plans').select('*').eq('is_active', true);
  if (error) throw error;
  return data as Plan[];
};

// ============================================================
// RESTAURANTS
// ============================================================
export const getRestaurantBySlug = async (slug: string): Promise<Restaurant | null> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return data as Restaurant;
};

export const updateRestaurant = async (id: string, updates: Partial<Restaurant>): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Restaurant;
};

// ============================================================
// CATEGORIES
// ============================================================
export const getCategories = async (restaurantId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order');
  if (error) throw error;
  return data as Category[];
};

export const createCategory = async (cat: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
  const { data, error } = await supabase.from('categories').insert(cat).select().single();
  if (error) throw error;
  return data as Category;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

// ============================================================
// PRODUCTS
// ============================================================
export const getProducts = async (restaurantId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order');
  if (error) throw error;
  return data as Product[];
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data as Product;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

// ============================================================
// MENU PUBLIC (via fonction SQL)
// ============================================================
export const getPublicMenu = async (slug: string) => {
  const { data, error } = await supabase.rpc('get_public_menu', { p_slug: slug });
  if (error) throw error;
  return data;
};

// ============================================================
// SUBSCRIPTION
// ============================================================
export const getSubscription = async (restaurantId: string): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .eq('restaurant_id', restaurantId)
    .single();
  if (error) return null;
  return data as Subscription;
};

// ============================================================
// PAYMENTS & INVOICES
// ============================================================
export const getPayments = async (restaurantId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Payment[];
};

export const getInvoices = async (restaurantId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('issued_at', { ascending: false });
  if (error) throw error;
  return data as Invoice[];
};

export const submitD17Payment = async (
  restaurantId: string,
  amount: number,
  proofUrl: string,
  reference?: string,
  planId: PlanTier = 'starter'
): Promise<Payment> => {
  const { data: rpcData, error: rpcError } = await supabase.rpc('submit_d17_payment', {
    p_restaurant_id: restaurantId,
    p_amount: amount,
    p_proof_url: proofUrl,
    p_reference: reference || null,
    p_plan_id: planId
  });

  if (rpcError) {
    console.warn('RPC submit_d17_payment not found or failed, using direct insert:', rpcError.message);
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .maybeSingle();

    const { data: insData, error: insErr } = await supabase
      .from('payments')
      .insert({
        subscription_id: sub?.id,
        restaurant_id: restaurantId,
        plan_id: planId,
        amount,
        currency: 'TND',
        provider: 'd17',
        provider_reference: reference || 'Paiement D17 vers 20934403',
        proof_url: proofUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (insErr) {
      console.error('Error in direct insert submitD17Payment:', insErr);
      throw insErr;
    }
    return insData as Payment;
  }

  return rpcData as Payment;
};

export const getPendingD17Payments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*, restaurant:restaurants(name, slug, phone)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending D17 payments:', error);
    return [];
  }
  return (data || []) as Payment[];
};

export const approveD17Payment = async (
  paymentId: string,
  planId?: PlanTier,
  durationDays: number = 30,
  customAmount?: number
): Promise<any> => {
  const { data: rpcData, error: rpcError } = await supabase.rpc('approve_d17_payment', {
    p_payment_id: paymentId,
    p_plan_id: planId || null,
    p_duration_days: durationDays,
    p_custom_amount: customAmount !== undefined ? customAmount : null
  });

  if (rpcError) {
    console.warn('RPC approve_d17_payment failed, using fallback update:', rpcError.message);
    const updatePayload: any = { status: 'completed' };
    if (customAmount !== undefined) updatePayload.amount = customAmount;

    const { data: pay } = await supabase
      .from('payments')
      .update(updatePayload)
      .eq('id', paymentId)
      .select()
      .single();

    if (pay) {
      const targetPlan = planId || pay.plan_id || 'starter';
      await supabase.from('subscriptions').update({
        plan_id: targetPlan,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + durationDays * 86400000).toISOString(),
        cancel_at_period_end: false
      }).eq('restaurant_id', pay.restaurant_id);
    }
    return pay;
  }
  return rpcData;
};

export const adminUpdateSubscription = async (
  restaurantId: string,
  planId: PlanTier,
  durationDays: number,
  amount: number = 0,
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired' = 'active'
): Promise<any> => {
  const { data: rpcData, error: rpcError } = await supabase.rpc('admin_update_subscription', {
    p_restaurant_id: restaurantId,
    p_plan_id: planId,
    p_duration_days: durationDays,
    p_amount: amount,
    p_status: status
  });

  if (rpcError) {
    console.warn('RPC admin_update_subscription failed, using fallback update:', rpcError.message);
    const { data: sub } = await supabase
      .from('subscriptions')
      .update({
        plan_id: planId,
        status: status,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + durationDays * 86400000).toISOString(),
        cancel_at_period_end: false
      })
      .eq('restaurant_id', restaurantId)
      .select()
      .single();
    return sub;
  }
  return rpcData;
};

export const updatePlanPrice = async (planId: string, priceMonthly: number): Promise<Plan> => {
  const { data, error } = await supabase
    .from('plans')
    .update({ price_monthly: priceMonthly })
    .eq('id', planId)
    .select()
    .single();

  if (error) throw error;
  return data as Plan;
};

export const rejectD17Payment = async (paymentId: string): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
};

// ============================================================
// SUPPORT TICKETS
// ============================================================
export const getTickets = async (userId: string): Promise<SupportTicket[]> => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SupportTicket[];
};

export const createTicket = async (ticket: Omit<SupportTicket, 'id' | 'created_at'>): Promise<SupportTicket> => {
  const { data, error } = await supabase.from('support_tickets').insert(ticket).select().single();
  if (error) throw error;
  return data as SupportTicket;
};

// ============================================================
// PROFILE
// ============================================================
export const updateProfile = async (id: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
};

// ============================================================
// SUPER ADMIN STATS
// ============================================================
export const getSuperAdminStats = async () => {
  const { data, error } = await supabase.rpc('get_super_admin_stats');
  if (error) throw error;
  return data;
};

// ============================================================
// UPLOAD IMAGES (SUPABASE STORAGE)
// ============================================================
export const uploadImage = async (file: File, folder: string = 'general'): Promise<string> => {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

  const { data, error } = await supabase.storage
    .from('menu-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Erreur upload Supabase Storage:', error);
    throw new Error(`Échec d'envoi d'image: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('menu-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};
