import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Restaurant, Category, Product } from '../../types';
import { QrCode, Search, Phone, MapPin, Globe, Sparkles, AlertCircle, Coffee, Loader2 } from 'lucide-react';

export const PublicMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      const targetSlug = slug || '';
      if (!targetSlug) { setNotFound(true); setLoading(false); return; }

      // Utiliser la fonction SQL get_public_menu pour tout charger en une requête
      const { data, error } = await supabase.rpc('get_public_menu', { p_slug: targetSlug });

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setRestaurant(data.restaurant as Restaurant);

      // Extraire catégories et produits de la réponse JSON imbriquée
      const cats: Category[] = [];
      const prods: Product[] = [];
      if (data.categories) {
        for (const cat of data.categories) {
          cats.push({ id: cat.id, restaurant_id: data.restaurant.id, name_fr: cat.name_fr, name_ar: cat.name_ar, icon: cat.icon, sort_order: cat.sort_order, is_visible: true });
          if (cat.products) {
            for (const p of cat.products) {
              prods.push(p as Product);
            }
          }
        }
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
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (notFound || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white">Établissement Introuvable</h2>
        <p className="text-slate-400 text-sm mt-2">Le menu QR demandé n'existe pas ou n'est plus actif.</p>
      </div>
    );
  }

  const isRtl = lang === 'ar';
  const themeColor = restaurant.theme_color || '#d97706';

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
    const nameToSearch = isRtl ? (p.name_ar || p.name_fr) : p.name_fr;
    const matchesSearch = nameToSearch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-amber-500 selection:text-slate-950"
    >
      {/* Cover Header */}
      <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-900">
        {restaurant.cover_url ? (
          <img src={restaurant.cover_url} alt={restaurant.name} className="w-full h-full object-cover opacity-60 scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-950 opacity-80" style={{ backgroundImage: `linear-gradient(to right, ${themeColor}40, #020617)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-lg" style={{ color: themeColor }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />
            <span>Mada Menu</span>
          </div>
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg hover:border-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" style={{ color: themeColor }} />
            <span>{lang === 'fr' ? 'العربية' : 'Français'}</span>
          </button>
        </div>
      </div>

      {/* Profile & Info Header */}
      <div className="max-w-3xl mx-auto px-4 -mt-20 relative z-20 space-y-6">
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800/80 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 overflow-hidden shrink-0 shadow-xl flex items-center justify-center" style={{ borderColor: themeColor }}>
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: themeColor }}>☕</div>
              )}
            </div>
            <div className="space-y-1 flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{restaurant.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {restaurant.description || 'Bienvenue dans notre établissement.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                {restaurant.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" style={{ color: themeColor }} />
                    {restaurant.address}, {restaurant.city}
                  </span>
                )}
                {restaurant.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" style={{ color: themeColor }} />
                    {restaurant.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Search & Category Bar */}
        <div className="sticky top-4 z-30 space-y-3">
          <div className="relative">
            <Search className={`w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'ابحث عن مشروب أو طبق...' : 'Rechercher un plat ou une boisson...'}
              className={`w-full py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none backdrop-blur-xl shadow-xl text-sm ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-md ${
                activeCategory === 'all' ? 'text-slate-950 font-black' : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white'
              }`}
              style={activeCategory === 'all' ? { backgroundColor: themeColor, color: '#090d16' } : {}}
            >
              {isRtl ? 'الكل' : 'Tous'} ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category_id === cat.id).length;
              const catName = isRtl ? (cat.name_ar || cat.name_fr) : cat.name_fr;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shadow-md ${
                    isActive ? 'text-slate-950 font-black' : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  style={isActive ? { backgroundColor: themeColor, color: '#090d16' } : {}}
                >
                  <span>{cat.icon}</span>
                  <span>{catName}</span>
                  <span className="opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4 pt-2">
          {filteredProducts.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
              <Coffee className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">{isRtl ? 'لا توجد منتجات' : 'Aucun produit trouvé'}</h3>
              <p className="text-xs text-slate-400">{isRtl ? 'جرب البحث عن صنف آخر.' : 'Essayez de modifier vos critères de recherche.'}</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const productName = isRtl ? (product.name_ar || product.name_fr) : product.name_fr;
              const productDesc = isRtl ? (product.description_ar || product.description_fr) : product.description_fr;
              return (
                <div
                  key={product.id}
                  className="glass-card p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-slate-800/60 hover:border-slate-700 transition-all group"
                >
                  {product.image_url ? (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-800">
                      <img src={product.image_url} alt={productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0 text-2xl">☕</div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-white transition-colors">{productName}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-black shrink-0 border" style={{ backgroundColor: `${themeColor}18`, borderColor: `${themeColor}50`, color: themeColor }}>
                        {product.price.toFixed(3)} {restaurant.currency}
                      </span>
                    </div>
                    {productDesc && <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{productDesc}</p>}
                    <div className="pt-1 flex items-center gap-2 text-[10px] font-semibold">
                      {product.is_available ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {isRtl ? 'متوفر' : 'Disponible'}
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          {isRtl ? 'غير متوفر' : 'Épuisé'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-8 text-center border-t border-slate-900 space-y-2">
          <p className="text-xs text-slate-500">
            Powered by <span className="font-bold text-slate-300">Mada Menu SaaS</span> — Menu Digital Certifié
          </p>
        </div>
      </div>
    </div>
  );
};
