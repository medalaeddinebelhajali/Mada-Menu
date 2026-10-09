import React from 'react';
import { QrCode, Smartphone, Sparkles, Zap, Shield, Globe2, Layers, RefreshCw, Eye, CheckCircle2 } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Toutes les fonctionnalités de <span className="gold-gradient-text">Mada Menu</span>
        </h1>
        <p className="text-slate-300 text-lg">
          Une plateforme moderne et intuitive pensée pour booster votre chiffre d'affaires et ravir vos clients.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="glass-panel p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Générateur QR Vectoriel (SVG & PNG)</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Téléchargez vos codes QR en haute résolution prêts pour l'impression professionnelle sur vos tables, chevalets ou vitrines.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Globe2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Multilingue Native (Français & Arabe)</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Offrez une expérience utilisateur personnalisée. Les textes s'alignent automatiquement en RTL pour la langue arabe.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Mise à jour instantanée sans réimpression</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Changez vos prix, ajoutez des nouveautés ou désactivez un plat épuisé. Les modifications sont immédiates pour vos visiteurs.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Multi-Établissements & Sécurité RLS</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Gérez plusieurs cafés depuis un seul compte avec isolation totale des données et contrôle d'accès strict par rôles.
          </p>
        </div>
      </div>
    </div>
  );
};
