import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment fonctionne l'essai gratuit de 14 jours ?",
      a: "Vous pouvez créer votre compte et configurer votre établissement immédiatement sans saisir de carte bancaire. Vous bénéficiez de toutes les fonctionnalités pendant 14 jours."
    },
    {
      q: "Est-ce que le QR Code change si je modifie mes prix ou mes plats ?",
      a: "Non ! Vos QR codes sont 100% stables. Vous pouvez réordonner vos catégories, changer vos tarifs ou ajouter de nouveaux produits, le QR code imprimé sur vos tables reste toujours valide."
    },
    {
      q: "Quels moyens de paiement sont acceptés en Tunisie ?",
      a: "Nous acceptons les cartes bancaires tunisiennes (Visa, Mastercard, e-DINAR) via notre partenaire bancaire Konnect, ainsi que les virements ou paiements directs pour les abonnements annuels."
    },
    {
      q: "Mes clients doivent-ils télécharger une application pour lire le menu ?",
      a: "Absolument pas ! Le menu s'ouvre instantanément dans le navigateur mobile de vos clients lorsqu'ils scannent le QR code avec l'appareil photo de leur smartphone."
    },
    {
      q: "Puis-je gérer plusieurs établissements avec un seul compte ?",
      a: "Oui, l'offre Pro vous permet de gérer jusqu'à 3 établissements (cafés, salons de thé, restaurants) depuis un tableau de bord unique."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-white">Foire Aux Questions</h1>
        <p className="text-slate-400 text-base">Toutes les réponses à vos questions sur Mada Menu.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl overflow-hidden border border-slate-800 transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-6 text-left flex items-center justify-between font-bold text-white hover:text-amber-400 transition-colors"
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
                {faq.q}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-slate-800/60 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
