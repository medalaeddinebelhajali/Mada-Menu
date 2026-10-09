import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getProducts, getCategories, getSubscription } from '../../lib/supabase';
import { UtensilsCrossed, FolderKanban, QrCode, Sparkles, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  const { currentRestaurant } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [maxProducts, setMaxProducts] = useState(15);
  const [planName, setPlanName] = useState('Gratuit');
  const [subStatus, setSubStatus] = useState('trial');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentRestaurant) return;
    const load = async () => {
      const [prods, cats, sub] = await Promise.all([
        getProducts(currentRestaurant.id),
        getCategories(currentRestaurant.id),
        getSubscription(currentRestaurant.id),
      ]);
      setProductCount(prods.length);
      setCategoryCount(cats.length);
      if (sub?.plan) {
        setMaxProducts(sub.plan.max_products_per_restaurant);
        setPlanName(sub.plan.name_fr);
        setSubStatus(sub.status);
      }
      setLoading(false);
    };
    load();
  }, [currentRestaurant?.id]);

  if (!currentRestaurant) return null;

  const prodUsagePercent = Math.min(100, Math.round((productCount / maxProducts) * 100));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Vue d'ensemble — {currentRestaurant.name}</h1>
        <p className="text-xs text-slate-400">Statistiques et état d'activité de votre menu QR digital</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold text-slate-400 uppercase">Produits au Menu</span>
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{productCount}</span>
            <span className="text-xs text-slate-500">/ {maxProducts === 9999 ? 'Illimité' : maxProducts}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${prodUsagePercent >= 90 ? 'bg-rose-500' : 'bg-amber-500'}`}
              style={{ width: `${prodUsagePercent}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold text-slate-400 uppercase">Catégories</span>
            <FolderKanban className="w-5 h-5" />
          </div>
          <span className="text-3xl font-black text-white">{categoryCount}</span>
          <p className="text-[11px] text-slate-400">Catégories actives sur le menu</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold text-slate-400 uppercase">Abonnement</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-white capitalize">{planName}</span>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 uppercase">
            {subStatus}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold text-slate-400 uppercase">QR Code</span>
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-white">Actif & HD</span>
          <p className="text-[11px] text-slate-400">Prêt pour impression SVG/PNG</p>
        </div>
      </div>

      {/* Quota Warning */}
      {prodUsagePercent >= 80 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-amber-200">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Vous avez utilisé {productCount} sur {maxProducts} produits autorisés par votre plan.</span>
          </div>
          <button onClick={() => onNavigateTab('subscriptions')} className="gold-button px-4 py-2 rounded-xl text-xs font-bold shrink-0">
            Changer d'offre
          </button>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => onNavigateTab('products')} className="glass-panel p-6 rounded-3xl text-left border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
            <span>Gérer les Produits</span><ArrowRight className="w-4 h-4" />
          </h3>
          <p className="text-xs text-slate-400">Ajoutez de nouveaux prix, photos et descriptions en TND.</p>
        </button>

        <button onClick={() => onNavigateTab('qr')} className="glass-panel p-6 rounded-3xl text-left border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
            <span>Télécharger le Code QR</span><ArrowRight className="w-4 h-4" />
          </h3>
          <p className="text-xs text-slate-400">Formats PNG et SVG vectoriel pour impression de table.</p>
        </button>

        <button onClick={() => onNavigateTab('appearance')} className="glass-panel p-6 rounded-3xl text-left border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
            <span>Personnaliser l'Apparence</span><ArrowRight className="w-4 h-4" />
          </h3>
          <p className="text-xs text-slate-400">Modifiez le logo, les couleurs et la bannière de couverture.</p>
        </button>
      </div>
    </div>
  );
};
