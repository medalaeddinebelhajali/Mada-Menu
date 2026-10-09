import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSubscription, getPlans, getPayments, getInvoices } from '../../lib/supabase';
import { Subscription, PlanTier, Payment, Invoice, Plan } from '../../types';
import { CreditCard, Sparkles, Check, FileText, Loader2 } from 'lucide-react';

export const SubscriptionTab: React.FC = () => {
  const { currentRestaurant } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState<PlanTier>('starter');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  useEffect(() => {
    if (!currentRestaurant) return;
    const load = async () => {
      const [subscription, planList, payList, invList] = await Promise.all([
        getSubscription(currentRestaurant.id),
        getPlans(),
        getPayments(currentRestaurant.id),
        getInvoices(currentRestaurant.id),
      ]);
      setSub(subscription);
      setPlans(planList);
      setPayments(payList);
      setInvoices(invList);
      setLoading(false);
    };
    load();
  }, [currentRestaurant?.id]);

  if (!currentRestaurant) return null;

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>;
  }

  const currentPlan = sub?.plan || plans[0];

  const handleInitiateUpgrade = (planId: PlanTier) => {
    setTargetPlanId(planId);
    setShowCheckoutModal(true);
  };

  // Mode sandbox — simulation Konnect
  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      setShowCheckoutModal(false);
      const targetPlan = plans.find(p => p.id === targetPlanId) || plans[1];
      setPaymentSuccessMsg(`Félicitations ! Votre abonnement a été mis à jour vers l'offre ${targetPlan.name_fr}.`);
      // NOTE : En production, appeler supabase.rpc('record_payment_and_activate', {...})
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Abonnement & Facturation</h1>
        <p className="text-xs text-slate-400">Gérez votre offre Mada Menu, vos paiements Konnect et vos factures</p>
      </div>

      {paymentSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {/* Current Plan Banner */}
      {sub && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Abonnement Actuel</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                {sub.status.toUpperCase()}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white">
              Plan {currentPlan?.name_fr} ({currentPlan?.price_monthly.toFixed(3)} TND/mois)
            </h2>
            <p className="text-xs text-slate-400">
              Période valide jusqu'au {new Date(sub.current_period_end).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button onClick={() => handleInitiateUpgrade(sub.plan_id === 'pro' ? 'starter' : 'pro')} className="gold-button px-6 py-3 rounded-2xl text-xs font-bold shrink-0">
            Changer de Plan
          </button>
        </div>
      )}

      {/* Available Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Offres Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(p => {
            const isCurrent = sub?.plan_id === p.id;
            return (
              <div key={p.id} className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${isCurrent ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800'}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">{p.name_fr}</h4>
                    {isCurrent && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">Actuel</span>}
                  </div>
                  <div className="text-2xl font-black text-white">
                    {p.price_monthly.toFixed(3)} <span className="text-xs text-amber-400">TND/mois</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li>• Max {p.max_restaurants} établissement(s)</li>
                    <li>• Max {p.max_products_per_restaurant === 9999 ? 'Illimité' : p.max_products_per_restaurant} produits</li>
                    <li>• Support QR Code HD</li>
                  </ul>
                </div>
                {!isCurrent && (
                  <button onClick={() => handleInitiateUpgrade(p.id as PlanTier)} className="gold-button w-full py-2.5 rounded-xl text-xs font-bold">
                    Choisir cette offre
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Historique des Paiements & Reçus
        </h3>
        {payments.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun paiement enregistré pour l'instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Référence</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Montant</th>
                  <th className="pb-3">Passerelle</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-mono text-white font-bold">{pay.provider_reference || pay.id.slice(0, 8)}</td>
                    <td className="py-3">{new Date(pay.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 font-bold text-amber-400">{pay.amount.toFixed(3)} TND</td>
                    <td className="py-3 uppercase">{pay.provider}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">{pay.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Paiement Sécurisé Konnect Tunisie</span>
              </div>
              <h3 className="text-xl font-bold text-white pt-2">Validation de la Commande</h3>
              <p className="text-xs text-slate-400">
                Montant à débiter : <span className="font-bold text-amber-400">
                  {plans.find(p => p.id === targetPlanId)?.price_monthly.toFixed(3)} TND
                </span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between"><span>Carte bancaire tunisienne</span><span className="font-bold text-white">e-DINAR / Visa / Mastercard</span></div>
              <div className="flex justify-between"><span>Passerelle de paiement</span><span className="font-bold text-emerald-400">Konnect Sandbox</span></div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCheckoutModal(false)} className="w-1/2 py-3 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">Annuler</button>
              <button type="button" onClick={handleSimulatePayment} disabled={isProcessing} className="gold-button w-1/2 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {isProcessing ? <><Loader2 className="w-3 h-3 animate-spin" /> Traitement...</> : 'Payer & Activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
