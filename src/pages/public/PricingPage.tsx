import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { Check, Zap, Sparkles, Shield, QrCode, Layers, HelpCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
          Tarification Transparente en Dinars Tunisien (TND)
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Des offres adaptées à <span className="gold-gradient-text">chaque établissement</span>
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          Démarrez gratuitement sans carte bancaire. Évoluez selon le développement de votre activité.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Plan 1: Free */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Gratuit</h3>
            <p className="text-xs text-slate-400">Idéal pour tester Mada Menu et créer votre premier menu digital.</p>
            <div className="flex items-baseline gap-1 pt-2">
              <span className="text-4xl font-black text-white">0</span>
              <span className="text-lg font-bold text-amber-400">DT</span>
              <span className="text-xs text-slate-500">/mois</span>
            </div>
            
            <hr className="border-slate-800" />

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Établissement</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Jusqu'à 15 Produits</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> QR Code HD illimité</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Support bilingue FR / AR</li>
              <li className="flex items-center gap-3 text-slate-500 line-through"><Check className="w-4 h-4 text-slate-600 shrink-0" /> Personnalisation de thème</li>
            </ul>
          </div>

          <Link
            to="/register"
            className="w-full py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold text-center hover:bg-slate-800 transition-all block"
          >
            Créer un compte gratuit
          </Link>
        </div>

        {/* Plan 2: Starter (POPULAR) */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border-2 border-amber-500 bg-slate-900/90 relative flex flex-col justify-between shadow-2xl shadow-amber-500/10 scale-105">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
            Le Plus Populaire
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Starter <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">Pour les salons de thé et cafés indépendants exigeants.</p>
            <div className="flex items-baseline gap-1 pt-2">
              <span className="text-4xl font-black text-white">49</span>
              <span className="text-lg font-bold text-amber-400">DT</span>
              <span className="text-xs text-slate-500">/mois</span>
            </div>
            
            <hr className="border-slate-800" />

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-400 shrink-0" /> 1 Établissement</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Jusqu'à 100 Produits</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-400 shrink-0" /> QR Code HD PNG & SVG</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Thèmes & couleurs personnalisés</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-amber-400 shrink-0" /> Support prioritaire</li>
            </ul>
          </div>

          <Link
            to="/register?plan=starter"
            className="gold-button w-full py-3.5 rounded-xl font-bold text-center block shadow-lg"
          >
            Choisir l'offre Starter
          </Link>
        </div>

        {/* Plan 3: Pro */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Pro</h3>
            <p className="text-xs text-slate-400">Pour les réseaux et multi-établissements en Tunisie.</p>
            <div className="flex items-baseline gap-1 pt-2">
              <span className="text-4xl font-black text-white">89</span>
              <span className="text-lg font-bold text-amber-400">DT</span>
              <span className="text-xs text-slate-500">/mois</span>
            </div>
            
            <hr className="border-slate-800" />

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Jusqu'à 3 Établissements</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Produits & Catégories Illimités</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> QR Code sur mesure avec logo</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Gestion multi-rôles & équipe</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Manager de compte dédié</li>
            </ul>
          </div>

          <Link
            to="/register?plan=pro"
            className="w-full py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-semibold text-center hover:bg-slate-800 transition-all block"
          >
            Passer à la version Pro
          </Link>
        </div>
      </div>
    </div>
  );
};
