import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase, getPlans, getSuperAdminStats } from '../../lib/supabase';
import { Plan, License } from '../../types';
import {
  ShieldCheck, AlertCircle, Plus, ArrowLeft, FileText, Loader2
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'plans' | 'licenses' | 'tickets'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<License[]>([
    { id: 'lic-1', license_key: 'MADA-PERPETUAL-2026-X98A', owner_id: user?.id || '', max_restaurants: 5, status: 'active', terms_version: 'v1.0', issued_at: '2026-01-01T00:00:00Z' },
  ]);

  // Verify super admin role
  if (!user?.is_super_admin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white">Accès Refusé</h2>
        <p className="text-slate-400 text-sm mt-2">Seuls les super-administrateurs système Mada Menu ont accès à cet espace.</p>
        <button onClick={() => navigate('/dashboard')} className="gold-button mt-6 px-6 py-3 rounded-xl text-xs font-bold">
          Retour au Dashboard Commerçant
        </button>
      </div>
    );
  }

  useEffect(() => {
    const load = async () => {
      try {
        // Charger les stats via la fonction SQL
        const adminStats = await getSuperAdminStats();
        setStats(adminStats);
      } catch { /* fallback */ }

      // Charger restaurants
      const { data: rests } = await supabase.from('restaurants').select('id, name, slug, city, is_active').order('created_at', { ascending: false });
      setRestaurants(rests || []);

      // Charger plans
      const planList = await getPlans();
      setPlans(planList);

      // Charger tickets ouverts
      const { data: tix } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(50);
      setTickets(tix || []);

      setLoading(false);
    };
    load();
  }, []);

  const handleGenerateLicense = () => {
    const key = `MADA-LIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newLic: License = {
      id: `lic-${Date.now()}`,
      license_key: key,
      owner_id: user.id,
      max_restaurants: 3,
      status: 'active',
      terms_version: 'v1.0',
      issued_at: new Date().toISOString(),
    };
    setLicenses(prev => [newLic, ...prev]);
    // En production : supabase.from('licenses').insert(newLic)
  };

  const tabList = [
    { id: 'overview', label: 'Vue Globale' },
    { id: 'restaurants', label: 'Établissements Clients' },
    { id: 'plans', label: 'Gestion des Plans' },
    { id: 'licenses', label: 'Licences Uniques' },
    { id: 'tickets', label: 'Tickets Support' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">

      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <h1 className="text-2xl font-black text-white">Super Administration SaaS</h1>
            </div>
            <p className="text-xs text-slate-400">Supervision globale de la plateforme Mada Menu Tunisie</p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
          Rôle : Super Administrator
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Établissements</span>
          <div className="text-3xl font-black text-white">{stats?.total_restaurants ?? restaurants.length}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Revenu Cumulé</span>
          <div className="text-3xl font-black text-amber-400">{Number(stats?.total_revenue ?? 0).toFixed(3)} TND</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Abonnements Actifs</span>
          <div className="text-3xl font-black text-emerald-400">{stats?.active_subscriptions ?? '—'}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Tickets Ouverts</span>
          <div className="text-3xl font-black text-purple-400">{stats?.open_tickets ?? tickets.filter(t => t.status === 'open').length}</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Restaurants Tab ── */}
      {activeTab === 'restaurants' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Liste des Établissements Registrés ({restaurants.length})</h3>
          <div className="space-y-3">
            {restaurants.map(r => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{r.name}</h4>
                  <p className="text-xs text-slate-400">/m/{r.slug} • {r.city} • {r.is_active ? '✅ Actif' : '🔴 Inactif'}</p>
                </div>
                <Link
                  to={`/m/${r.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold"
                >
                  Voir Menu
                </Link>
              </div>
            ))}
            {restaurants.length === 0 && <p className="text-xs text-slate-400">Aucun établissement enregistré.</p>}
          </div>
        </div>
      )}

      {/* ── Plans Tab ── */}
      {activeTab === 'plans' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Configuration des Offres SaaS</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(p => (
              <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-lg">{p.name_fr}</h4>
                <div className="text-2xl font-black text-amber-400">{p.price_monthly.toFixed(3)} TND/mo</div>
                <p className="text-xs text-slate-400">Max {p.max_products_per_restaurant === 9999 ? 'Illimité' : p.max_products_per_restaurant} produits</p>
                <p className="text-xs text-slate-400">Max {p.max_restaurants} établissement(s)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Licenses Tab ── */}
      {activeTab === 'licenses' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Gestion des Licences Logiciel Uniques</h3>
              <p className="text-xs text-slate-400">Pour les achats de licences définitives indépendantes de l'hébergement mensuel</p>
            </div>
            <button onClick={handleGenerateLicense} className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" />Générer une Licence
            </button>
          </div>
          <div className="space-y-3">
            {licenses.map(lic => (
              <div key={lic.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="font-bold text-amber-400">{lic.license_key}</span>
                  <span className="text-slate-400 text-[10px] block">Max {lic.max_restaurants} établissements • {lic.terms_version}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">{lic.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tickets Tab ── */}
      {activeTab === 'tickets' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white">Tous les Tickets Support ({tickets.length})</h3>
          {tickets.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun ticket pour l'instant.</p>
          ) : (
            tickets.map(t => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{t.subject}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                    t.status === 'open' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>{t.status}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{t.message}</p>
                <p className="text-[10px] text-slate-500">{new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
