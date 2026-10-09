import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Restaurant, Category, Product } from '../../types';
import { AlertCircle, Loader2 } from 'lucide-react';
import { RestaurantTemplate } from './RestaurantTemplate';
import { CafeTemplate } from './CafeTemplate';

export const PublicMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      const targetSlug = slug || '';
      if (!targetSlug) { setNotFound(true); setLoading(false); return; }

      const { data, error } = await supabase.rpc('get_public_menu', { p_slug: targetSlug });
      if (error || !data) { setNotFound(true); setLoading(false); return; }

      setRestaurant(data.restaurant as Restaurant);
      if (data.is_expired) { setIsExpired(true); setLoading(false); return; }

      const cats: Category[] = [];
      const prods: Product[] = [];
      for (const cat of data.categories || []) {
        cats.push({
          id: cat.id, restaurant_id: data.restaurant.id, name_fr: cat.name_fr,
          name_ar: cat.name_ar, icon: cat.icon, sort_order: cat.sort_order, is_visible: true,
        });
        for (const p of cat.products || []) prods.push(p as Product);
      }
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    };
    loadMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (isExpired && restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Menu temporairement indisponible</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Le menu de <span className="text-white font-semibold">{restaurant.name}</span> n'est pas accessible pour le moment.
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-slate-500 mb-4" />
        <h2 className="text-xl font-bold text-white">Établissement introuvable</h2>
        <p className="text-slate-400 text-sm mt-2">Ce menu n'existe pas ou n'est plus actif.</p>
      </div>
    );
  }

  const template = (restaurant as any).menu_template === 'cafe' ? 'cafe' : 'restaurant';
  const Template = template === 'cafe' ? CafeTemplate : RestaurantTemplate;

  return (
    <Template
      restaurant={restaurant}
      categories={categories}
      products={products}
      lang={lang}
      setLang={setLang}
    />
  );
};
