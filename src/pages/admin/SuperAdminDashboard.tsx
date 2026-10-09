import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  supabase, getPlans, getSuperAdminStats, getPendingD17Payments,
  approveD17Payment, rejectD17Payment, adminUpdateSubscription, updatePlanPrice
} from '../../lib/supabase';
import { Plan, PlanTier, License, Payment } from '../../types';
import {
  ShieldCheck, AlertCircle, Plus, ArrowLeft, FileText, Loader2, Phone, Check, X, Eye, Image as ImageIcon,
  Calendar, DollarSign, Edit3, Save, Clock, Sparkles, Settings
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'd17_payments' | 'restaurants' | 'plans' | 'licenses' | 'tickets'>('d17_payments');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // Modal de validation personnalisée d'un paiement D17
  const [d17ModalPayment, setD17ModalPayment] = useState<Payment | null>(null);
  const [modalPlanId, setModalPlanId] = useState<PlanTier>('starter');
  const [modalDurationDays, setModalDurationDays] = useState<number>(30);
  const [modalAmount, setModalAmount] = useState<number>(25);

  // Modal de gestion d'abonnement d'un restaurant
  const [restSubModal, setRestSubModal] = useState<{
    restaurantId: string;
    restaurantName: string;
    planId: PlanTier;
    durationDays: number;
    amount: number;
    status: 'active' | 'trial' | 'expired';
  } | null>(null);

  // Édition des prix des plans SaaS
  const [editingPlanPrices, setEditingPlanPrices] = useState<{ [key: string]: number }>({});
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

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

  const reloadData = async () => {
    try {
      const adminStats = await getSuperAdminStats();
      setStats(adminStats);
    } catch { /* fallback */ }

    // Charger les paiements D17 en attente
    const pending = await getPendingD17Payments();
    setPendingPayments(pending);

    // Charger restaurants avec leurs abonnements
    const { data: rests } = await supabase
      .from('restaurants')
      .select('*, subscription:subscriptions(*)')
      .order('created_at', { ascending: false });
    setRestaurants(rests || []);

    // Charger plans
    const planList = await getPlans();
    setPlans(planList);

    // Initialiser les prix édités
    const pricesObj: { [key: string]: number } = {};
    planList.forEach(p => { pricesObj[p.id] = p.price_monthly; });
    setEditingPlanPrices(pricesObj);

    // Charger tickets ouverts
    const { data: tix } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(50);
    setTickets(tix || []);

    setLoading(false);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Ouvrir le modal d'approbation D17
  const handleOpenApproveModal = (pay: Payment) => {
    setD17ModalPayment(pay);
    const targetPlan = pay.plan_id || 'starter';
    setModalPlanId(targetPlan);
    setModalDurationDays(30);
    setModalAmount(pay.amount || (targetPlan === 'pro' ? 50 : 25));
  };

  // Confirmer l'approbation D17 avec durée et prix sur mesure
  const handleConfirmApproveD17 = async () => {
    if (!d17ModalPayment) return;
    setActionProcessing(d17ModalPayment.id);
    try {
      await approveD17Payment(d17ModalPayment.id, modalPlanId, modalDurationDays, modalAmount);
      alert(`✅ Paiement D17 validé avec succès !\nOffre : ${modalPlanId.toUpperCase()}\nDurée : ${modalDurationDays} jours\nMontant : ${modalAmount.toFixed(3)} TND`);
      setD17ModalPayment(null);
      await reloadData();
    } catch (err: any) {
      alert("Erreur lors de la validation : " + err.message);
    } finally {
      setActionProcessing(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!confirm("Voulez-vous vraiment rejeter cette preuve de paiement D17 ?")) return;
    setActionProcessing(paymentId);
    try {
      await rejectD17Payment(paymentId);
      alert("Demande de paiement rejetée.");
      await reloadData();
    } catch (err: any) {
      alert("Erreur lors du rejet : " + err.message);
    } finally {
      setActionProcessing(null);
    }
  };

  // Ouvrir le modal de modification d'abonnement pour un restaurant
  const handleOpenRestSubModal = (rest: any) => {
    const sub = rest.subscription;
    const currentPlan = (sub?.plan_id as PlanTier) || 'starter';
    setRestSubModal({
      restaurantId: rest.id,
      restaurantName: rest.name,
      planId: currentPlan,
      durationDays: 30,
      amount: currentPlan === 'pro' ? 50 : currentPlan === 'starter' ? 25 : 0,
      status: sub?.status === 'active' ? 'active' : sub?.status === 'trial' ? 'trial' : 'expired',
    });
  };

  // Sauvegarder la modification d'un abonnement restaurant
  const handleSaveRestSub = async () => {
    if (!restSubModal) return;
    setActionProcessing(restSubModal.restaurantId);
    try {
      await adminUpdateSubscription(
        restSubModal.restaurantId,
        restSubModal.planId,
        restSubModal.durationDays,
        restSubModal.amount,
        restSubModal.status
      );
      alert(`✅ Abonnement mis à jour pour ${restSubModal.restaurantName} !\nPlan : ${restSubModal.planId.toUpperCase()} | Durée : ${restSubModal.durationDays} jours`);
      setRestSubModal(null);
      await reloadData();
    } catch (err: any) {
      alert("Erreur lors de la mise à jour de l'abonnement : " + err.message);
    } finally {
      setActionProcessing(null);
    }
  };

  // Sauvegarder le prix d'un plan SaaS
  const handleSavePlanPrice = async (planId: string) => {
    const newPrice = editingPlanPrices[planId];
    if (newPrice === undefined || newPrice < 0) {
      alert("Veuillez saisir un prix valide.");
      return;
    }
    setSavingPlanId(planId);
    try {
      await updatePlanPrice(planId, newPrice);
      alert(`✅ Prix du plan ${planId.toUpperCase()} mis à jour à ${newPrice.toFixed(3)} TND/mois !`);
      await reloadData();
    } catch (err: any) {
      alert("Erreur lors de la mise à jour du prix : " + err.message);
    } finally {
      setSavingPlanId(null);
    }
  };

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
  };

  const tabList = [
    { id: 'd17_payments', label: `Paiements D17 (${pendingPayments.length})`, badge: pendingPayments.length > 0 },
    { id: 'restaurants', label: `Établissements (${restaurants.length})` },
    { id: 'plans', label: 'Gestion des Plans & Prix' },
    { id: 'overview', label: 'Vue Globale' },
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
          <Link to="/dashboard" className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <h1 className="text-2xl font-black text-white">Super Administration SaaS</h1>
            </div>
            <p className="text-xs text-slate-400">Gestion des abonnements, ajustement des tarifs et validation D17 (20934403)</p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-purple-400" />
          <span>D17 Admin : 20934403</span>
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-2">
          <span className="text-xs font-bold text-purple-300 uppercase flex items-center justify-between">
            <span>D17 en Attente</span>
            <Phone className="w-4 h-4 text-purple-400" />
          </span>
          <div className="text-3xl font-black text-purple-300">{pendingPayments.length}</div>
        </div>
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
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── D17 Payments Tab ── */}
      {activeTab === 'd17_payments' && (
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-400" />
                Preuves de Paiement D17 à Valider ({pendingPayments.length})
              </h3>
              <p className="text-xs text-slate-400">
                Vérifiez la réception sur le <strong>20934403</strong> puis validez avec la durée et le tarif de votre choix.
              </p>
            </div>
            <button onClick={reloadData} className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-bold border border-slate-800">
              Rafraîchir
            </button>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Check className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-white font-bold text-base">Aucun paiement D17 en attente !</h4>
              <p className="text-xs text-slate-400">Toutes les soumissions de paiement ont été traitées.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingPayments.map(pay => (
                <div key={pay.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  {/* Restaurant info & Requested Plan */}
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                    <div>
                      <h4 className="font-extrabold text-white text-base">{pay.restaurant?.name || 'Restaurant'}</h4>
                      <p className="text-xs text-slate-400">
                        Slug : <span className="text-amber-400 font-mono">/m/{pay.restaurant?.slug}</span>
                      </p>
                      {pay.restaurant?.phone && (
                        <p className="text-xs text-slate-400">Tél : {pay.restaurant.phone}</p>
                      )}
                      <div className="mt-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs inline-block">
                          Offre Demandée : {(pay.plan_id || 'starter').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-amber-400 block">{pay.amount.toFixed(3)} TND</span>
                      <span className="text-[10px] text-slate-500">{new Date(pay.created_at).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Reference */}
                  <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Référence / Note client :</span>
                    <span className="font-mono text-white font-bold">{pay.provider_reference || 'Aucune note'}</span>
                  </div>

                  {/* Proof image thumbnail */}
                  {pay.proof_url ? (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Preuve Reçu D17 (Cliquez pour agrandir)</span>
                      <div 
                        onClick={() => setPreviewProofUrl(pay.proof_url || null)} 
                        className="relative rounded-xl overflow-hidden border border-purple-500/30 group cursor-pointer bg-slate-950 h-44 flex items-center justify-center"
                      >
                        <img src={pay.proof_url} alt="Reçu D17" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
                            <Eye className="w-4 h-4" /> Agrandir la preuve
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                      ⚠️ Aucune photo reçue pour ce paiement.
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleReject(pay.id)}
                      disabled={actionProcessing === pay.id}
                      className="w-1/3 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 text-rose-400" />
                      <span>Rejeter</span>
                    </button>
                    <button
                      onClick={() => handleOpenApproveModal(pay)}
                      disabled={actionProcessing === pay.id}
                      className="gold-button w-2/3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Valider & Configurer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Restaurants Tab ── */}
      {activeTab === 'restaurants' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Établissements Registrés ({restaurants.length})</h3>
              <p className="text-xs text-slate-400">Gérez directement les abonnements, la durée de validité et les tarifs de chaque client.</p>
            </div>
            <button onClick={reloadData} className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-bold border border-slate-800">
              Rafraîchir
            </button>
          </div>

          <div className="space-y-4">
            {restaurants.map(r => {
              const sub = r.subscription;
              const isSubActive = sub?.status === 'active' && new Date(sub.current_period_end) > new Date();
              return (
                <div key={r.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-extrabold text-white text-base">{r.name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isSubActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {sub?.plan_id ? sub.plan_id.toUpperCase() : 'FREE'} • {sub?.status?.toUpperCase() || 'INACTIF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Slug : <span className="text-amber-400 font-mono">/m/{r.slug}</span> • Ville : {r.city} • État : {r.is_active ? '✅ Actif' : '🔴 Inactif'}
                    </p>
                    {sub?.current_period_end && (
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Valide jusqu'au : <strong>{new Date(sub.current_period_end).toLocaleDateString('fr-FR')}</strong></span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/m/${r.slug}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700"
                    >
                      Voir Menu
                    </Link>
                    <button
                      onClick={() => handleOpenRestSubModal(r)}
                      className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Gérer l'Abonnement</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {restaurants.length === 0 && <p className="text-xs text-slate-400">Aucun établissement enregistré.</p>}
          </div>
        </div>
      )}

      {/* ── Plans Tab (Édition des Prix) ── */}
      {activeTab === 'plans' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Gestion des Offres SaaS & Édition des Prix</h3>
            <p className="text-xs text-slate-400">Modifiez le prix mensuel des abonnements pour l'ensemble de la plateforme Mada Menu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-lg">{p.name_fr}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
                    {p.id}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Prix Mensuel (TND/mois)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={editingPlanPrices[p.id] ?? p.price_monthly}
                      onChange={e => setEditingPlanPrices({ ...editingPlanPrices, [p.id]: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-extrabold focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs font-bold text-slate-400 shrink-0">TND</span>
                  </div>
                </div>

                <ul className="text-xs space-y-1.5 text-slate-400 border-t border-slate-800/80 pt-3">
                  <li>• Max {p.max_restaurants} établissement(s)</li>
                  <li>• Max {p.max_products_per_restaurant === 9999 ? 'Illimité' : p.max_products_per_restaurant} produits</li>
                </ul>

                <button
                  type="button"
                  onClick={() => handleSavePlanPrice(p.id)}
                  disabled={savingPlanId === p.id}
                  className="gold-button w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingPlanId === p.id ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" /> Enregistrer le Prix</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Aperçu du Système</h3>
          <p className="text-xs text-slate-400">
            Plateforme Mada Menu active avec {restaurants.length} établissement(s) et {pendingPayments.length} paiement(s) D17 en attente.
          </p>
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

      {/* ── Modal 1: Validation & Personnalisation D17 ── */}
      {d17ModalPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-6 shadow-2xl relative">
            <button onClick={() => setD17ModalPayment(null)} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900">
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Validation & Configuration D17
              </span>
              <h3 className="text-xl font-bold text-white pt-2">
                Validation pour {d17ModalPayment.restaurant?.name || 'Restaurant'}
              </h3>
              <p className="text-xs text-slate-400">
                Ajustez l'offre, la durée de l'abonnement et le montant final à enregistrer.
              </p>
            </div>

            {/* Choix du Plan */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Offre / Formule Abonnement</label>
              <div className="grid grid-cols-3 gap-2">
                {(['starter', 'pro', 'free'] as PlanTier[]).map(pId => (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => {
                      setModalPlanId(pId);
                      setModalAmount(pId === 'pro' ? 50 : pId === 'starter' ? 25 : 0);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase border transition-all ${
                      modalPlanId === pId
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/30'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {pId}
                  </button>
                ))}
              </div>
            </div>

            {/* Choix de la Période / Durée */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Période d'Abonnement (Durée)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { days: 30, label: '1 Mois' },
                  { days: 90, label: '3 Mois' },
                  { days: 180, label: '6 Mois' },
                  { days: 365, label: '1 An (365j)' },
                ].map(opt => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setModalDurationDays(opt.days)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      modalDurationDays === opt.days
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400">Durée personnalisée (jours) :</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={modalDurationDays}
                  onChange={e => setModalDurationDays(parseInt(e.target.value) || 30)}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Montant / Prix */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">Montant / Prix Payé (TND)</label>
              <input
                type="number"
                step="0.5"
                value={modalAmount}
                onChange={e => setModalAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-extrabold focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Calcul date expiration */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Nouvelle Date d'Expiration :</span>
              <span className="font-extrabold text-emerald-400">
                {new Date(Date.now() + modalDurationDays * 86400000).toLocaleDateString('fr-FR')}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setD17ModalPayment(null)} className="w-1/3 py-3 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmApproveD17}
                disabled={actionProcessing === d17ModalPayment.id}
                className="gold-button w-2/3 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionProcessing === d17ModalPayment.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
                ) : (
                  <><Check className="w-4 h-4" /> Valider & Activer l'Abonnement</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Gestion directe de l'abonnement d'un restaurant ── */}
      {restSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative">
            <button onClick={() => setRestSubModal(null)} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900">
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold inline-flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> Gestion Abonnement Restaurant
              </span>
              <h3 className="text-xl font-bold text-white pt-2">
                {restSubModal.restaurantName}
              </h3>
              <p className="text-xs text-slate-400">Ajustez manuellement le plan, la durée de l'offre et le montant.</p>
            </div>

            {/* Choix du Plan */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Offre / Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {(['starter', 'pro', 'free'] as PlanTier[]).map(pId => (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => setRestSubModal({ ...restSubModal, planId: pId, amount: pId === 'pro' ? 50 : pId === 'starter' ? 25 : 0 })}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase border transition-all ${
                      restSubModal.planId === pId
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/30'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {pId}
                  </button>
                ))}
              </div>
            </div>

            {/* Statut d'Abonnement */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Statut de l'Abonnement</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { st: 'active', label: '✅ Actif' },
                  { st: 'trial', label: '⏳ Trial (Essai)' },
                  { st: 'expired', label: '🔴 Expiré' },
                ].map(opt => (
                  <button
                    key={opt.st}
                    type="button"
                    onClick={() => setRestSubModal({ ...restSubModal, status: opt.st as any })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      restSubModal.status === opt.st
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Durée de l'Abonnement */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Durée d'Abonnement à Ajouter</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { days: 30, label: '1 Mois' },
                  { days: 90, label: '3 Mois' },
                  { days: 180, label: '6 Mois' },
                  { days: 365, label: '1 An' },
                ].map(opt => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setRestSubModal({ ...restSubModal, durationDays: opt.days })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      restSubModal.durationDays === opt.days
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400">Jours personnalisés :</span>
                <input
                  type="number"
                  min="1"
                  value={restSubModal.durationDays}
                  onChange={e => setRestSubModal({ ...restSubModal, durationDays: parseInt(e.target.value) || 30 })}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Prix enregistré */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">Montant Enregistré (TND)</label>
              <input
                type="number"
                step="0.5"
                value={restSubModal.amount}
                onChange={e => setRestSubModal({ ...restSubModal, amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-extrabold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setRestSubModal(null)} className="w-1/3 py-3 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveRestSub}
                disabled={actionProcessing === restSubModal.restaurantId}
                className="gold-button w-2/3 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionProcessing === restSubModal.restaurantId ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                ) : (
                  <><Save className="w-4 h-4" /> Enregistrer les Modifications</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Preview Proof Image ── */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewProofUrl(null)}>
          <div className="max-w-3xl w-full glass-panel p-4 rounded-3xl border border-purple-500/40 space-y-4 relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Preuve de Paiement D17 - Reçu de Transfert vers 20934403
              </h4>
              <button onClick={() => setPreviewProofUrl(null)} className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-[80vh] flex items-center justify-center">
              <img src={previewProofUrl} alt="Reçu D17" className="max-h-[80vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
