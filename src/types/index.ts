export type UserRole = 'owner' | 'manager' | 'staff';

export type PlanTier = 'free' | 'starter' | 'pro';

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  preferred_language: 'fr' | 'ar' | 'en';
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string;
  currency: string;
  theme_color: string;
  theme_mode: 'light' | 'dark' | 'system';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantMember {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  profile?: Profile;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name_fr: string;
  name_ar?: string | null;
  icon: string;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name_fr: string;
  name_ar?: string | null;
  description_fr: string;
  description_ar?: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Plan {
  id: PlanTier;
  name_fr: string;
  name_ar: string;
  price_monthly: number;
  max_restaurants: number;
  max_products_per_restaurant: number;
  features: {
    qr_code: boolean;
    custom_theme: boolean;
    multi_establishment?: boolean;
    support_priority: string;
  };
  is_active: boolean;
}

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan_id: PlanTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  plan?: Plan;
}

export interface Payment {
  id: string;
  subscription_id?: string;
  restaurant_id: string;
  amount: number;
  currency: string;
  provider: 'konnect' | 'sandbox';
  provider_reference?: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  payment_id?: string;
  restaurant_id: string;
  amount: number;
  tax_amount: number;
  pdf_url?: string;
  issued_at: string;
}

export interface License {
  id: string;
  license_key: string;
  owner_id: string;
  max_restaurants: number;
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  terms_version: string;
  issued_at: string;
  expires_at?: string | null;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  restaurant_id?: string;
  user_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: PriorityLevel;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}
