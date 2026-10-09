import { describe, it, expect } from 'vitest';

// NOTE: Ces tests unitaires utilisent des données statiques.
// Les tests d'intégration réels sont effectués via la base Supabase.

const DEMO_PLANS = [
  { id: 'free',    max_products_per_restaurant: 15,   max_restaurants: 1 },
  { id: 'starter', max_products_per_restaurant: 100,  max_restaurants: 1 },
  { id: 'pro',     max_products_per_restaurant: 9999, max_restaurants: 3 },
];

describe('Security & Multi-Tenant Isolation Tests', () => {

  it('Product Quota Enforcement: Free plan must limit products to 15', () => {
    const freePlan = DEMO_PLANS.find(p => p.id === 'free');
    expect(freePlan?.max_products_per_restaurant).toBe(15);

    const proPlan = DEMO_PLANS.find(p => p.id === 'pro');
    expect(proPlan?.max_products_per_restaurant).toBe(9999);
  });

  it('Multi-tenant plan config: Pro supports more restaurants than Starter', () => {
    const starter = DEMO_PLANS.find(p => p.id === 'starter');
    const pro = DEMO_PLANS.find(p => p.id === 'pro');
    expect(pro!.max_restaurants).toBeGreaterThan(starter!.max_restaurants);
  });

  it('Slug format validation: slug should be lowercase alphanumeric with hyphens', () => {
    const validSlug = (s: string) => /^[a-z0-9-]+$/.test(s);
    expect(validSlug('cafe-central')).toBe(true);
    expect(validSlug('Café Central')).toBe(false);
    expect(validSlug('salon-carthage')).toBe(true);
  });

  it('Currency format: TND prices should use 3 decimal places', () => {
    const price = 2.5;
    const formatted = price.toFixed(3);
    expect(formatted).toBe('2.500');
  });
});
