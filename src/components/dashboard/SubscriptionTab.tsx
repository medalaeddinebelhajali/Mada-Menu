import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSubscription, getPlans, getPayments, getInvoices, uploadImage, submitD17Payment } from '../../lib/supabase';
import { Subscription, PlanTier, Payment, Invoice, Plan } from '../../types';
import { CreditCard, Sparkles, Check, FileText, Loader2, Phone, Upload, Copy, Eye, X, Image as ImageIcon } from 'lucide-react';

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

  // D17 state
  const [proofUrl, setProofUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [d17Reference, setD17Reference] = useState('');
  const [copiedD17Number, setCopiedD17Number] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

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
  const targetPlan = plans.find(p => p.id === targetPlanId) || plans[1] || plans[0];

  const handleInitiateUpgrade = (planId: PlanTier) => {
    setTargetPlanId(planId);
    setProofUrl('');
    setD17Reference('');
    setShowCheckoutModal(true);
  };

  const handleCopyD17Number = () => {
    navigator.clipboard.writeText('20934403');
    setCopiedD17Number(true);
    setTimeout(() => setCopiedD17Number(false), 2000);
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProof(true);
    try {
      const url = await uploadImage(file, 'd17-proofs');
      setProofUrl(url);
    } catch (err: any) {
      alert("Erreur lors de l'upload de la preuve : " + err.message);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmitD17Payment = async () => {
    if (!proofUrl) {
      alert("Veuillez charger une photo ou capture d'écran de votre reçu de paiement D17.");
      return;
    }
    setIsProcessing(true);
    try {
      await submitD17Payment(
        currentRestaurant.id,
        targetPlan.price_monthly,
        proofUrl,
        d17Reference || `D17 pour Offre ${targetPlan.name_fr}`
      );

      // Recharger l'historique des paiements
      const updatedPayments = await getPayments(currentRestaurant.id);
      setPayments(updatedPayments);

      setShowCheckoutModal(false);
      setPaymentSuccessMsg(
        `Votre preuve de paiement D17 (${targetPlan.price_monthly.toFixed(3)} TND pour l'offre ${targetPlan.name_fr}) a été soumise avec succès ! Nos équipes vont vérifier la transaction sur le 20934403 et activer votre compte sous peu.`
      );
    } catch (err: any) {
      alert("Erreur lors de la soumission du paiement : " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Abonnement & Facturation</h1>
        <p className="text-xs text-slate-400">Gérez votre offre Mada Menu, vos paiements D17 et vos factures</p>
      </div>

      {paymentSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{paymentSuccessMsg}</span>
          </div>
          <button onClick={() => setPaymentSuccessMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Plan Banner */}
      {sub && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Abonnement Actuel</span>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                sub.status === 'active' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
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
            Changer de Plan / Renouveler
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
                    <li>• Paiement Mobile D17 accepté</li>
                  </ul>
                </div>
                <button onClick={() => handleInitiateUpgrade(p.id as PlanTier)} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isCurrent ? 'border border-amber-500/40 text-amber-300 hover:bg-amber-500/10' : 'gold-button'
                }`}>
                  {isCurrent ? 'Renouveler via D17' : 'Choisir cette offre'}
                </button>
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
                  <th className="pb-3">Référence / Note</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Montant</th>
                  <th className="pb-3">Mode</th>
                  <th className="pb-3">Preuve D17</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-mono text-white font-bold">{pay.provider_reference || pay.id.slice(0, 8)}</td>
                    <td className="py-3">{new Date(pay.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 font-bold text-amber-400">{pay.amount.toFixed(3)} TND</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        pay.provider === 'd17' 
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
                          : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      }`}>
                        {pay.provider}
                      </span>
                    </td>
                    <td className="py-3">
                      {pay.proof_url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal(pay.proof_url || null)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold hover:bg-amber-500/20"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Voir Reçu</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                        pay.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : pay.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {pay.status === 'pending' ? 'En attente de vérification' : pay.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* D17 Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full glass-panel p-6 sm:p-7 rounded-3xl border border-amber-500/30 space-y-6 my-8 shadow-2xl relative">
            <button 
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>Paiement Mobile D17 (La Poste Tunisienne)</span>
              </div>
              <h3 className="text-xl font-bold text-white pt-1">
                Abonnement {targetPlan.name_fr}
              </h3>
              <p className="text-xs text-slate-400">
                Montant total à transférer : <span className="font-extrabold text-amber-400 text-sm">
                  {targetPlan.price_monthly.toFixed(3)} TND
                </span>
              </p>
            </div>

            {/* Instruction Box 1: D17 Transfer Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Numéro D17 Destination :</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 select-all">
                    20934403
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyD17Number}
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                  >
                    {copiedD17Number ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedD17Number ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-purple-500/20">
                <p>1️⃣ Ouvrez votre application <strong>D17</strong> sur téléphone.</p>
                <p>2️⃣ Effectuez un transfert du montant exact (<strong>{targetPlan.price_monthly.toFixed(3)} TND</strong>) au numéro <strong>20934403</strong>.</p>
                <p>3️⃣ Prenez une capture d'écran / photo du reçu de paiement D17.</p>
              </div>
            </div>

            {/* Instruction Box 2: Upload Proof */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                Capture / Photo du reçu D17 <span className="text-rose-400">*</span>
              </label>

              {proofUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 group bg-slate-900">
                  <img src={proofUrl} alt="Preuve D17" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center p-3 text-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Reçu D17 chargé
                    </span>
                    <label className="cursor-pointer text-xs text-amber-300 underline font-semibold">
                      Changer la photo
                      <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-purple-400/60 bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                  {uploadingProof ? (
                    <div className="flex flex-col items-center gap-2 text-amber-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-bold">Envoi de la photo en cours...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-purple-400 mb-2" />
                      <span className="text-xs font-bold text-white">Déposer la photo du reçu D17 ici</span>
                      <span className="text-[10px] text-slate-400 mt-1">Format JPG, PNG (Max 5Mo)</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleProofUpload} disabled={uploadingProof} className="hidden" />
                </label>
              )}
            </div>

            {/* Instruction Box 3: Reference (Optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                Téléphone de l'expéditeur / Référence (Optionnel)
              </label>
              <input
                type="text"
                value={d17Reference}
                onChange={e => setD17Reference(e.target.value)}
                placeholder="Ex: Envoyé depuis le 98 123 456"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowCheckoutModal(false)} 
                className="w-1/3 py-3 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                Annuler
              </button>
              <button 
                type="button" 
                onClick={handleSubmitD17Payment} 
                disabled={!proofUrl || isProcessing || uploadingProof} 
                className="gold-button w-2/3 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Validation...</>
                ) : (
                  <><Check className="w-4 h-4" /> Envoyer la Preuve D17</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Image Modal */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImageModal(null)}>
          <div className="max-w-2xl w-full glass-panel p-4 rounded-3xl border border-slate-800 space-y-4 relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Preuve de Paiement D17
              </h4>
              <button onClick={() => setPreviewImageModal(null)} className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-900 max-h-[75vh] flex items-center justify-center">
              <img src={previewImageModal} alt="Reçu D17" className="max-h-[75vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
