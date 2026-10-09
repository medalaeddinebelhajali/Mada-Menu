import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { QrCode, Smartphone, Sparkles, Zap, Shield, CheckCircle2, ArrowRight, Palette, Layers, Globe2, Coffee, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-500/5 blur-[90px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>N°1 des Menus Digitaux QR en Tunisie</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {t.heroTitle} <br className="hidden sm:inline" />
            <span className="gold-gradient-text">{t.heroHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="gold-button w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 shadow-xl"
            >
              <span>{t.startFreeTrial}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/m/cafe-central"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 text-white text-base font-semibold flex items-center justify-center gap-3 transition-all"
            >
              <Smartphone className="w-5 h-5 text-amber-400" />
              <span>{t.viewDemoMenu}</span>
            </Link>
          </div>

          {/* Features Highlights Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sans engagement</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> QR Code HD vectoriel</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Français & Arabe (RTL)</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mise à jour en temps réel</div>
          </div>
        </div>

        {/* Live Mockup Interactive Showcase */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/50 p-4 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden group">
            
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="px-4 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
                https://mada-menu.tn/m/cafe-central
              </div>
              <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Aperçu En Direct
              </div>
            </div>

            {/* Simulated Public Menu Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="h-40 rounded-xl bg-slate-800 overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop"
                    alt="Expresso"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                    2.200 DT
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Expresso Italien ☕</h4>
                  <p className="text-xs text-slate-400 mt-1">Café pur arabica, arôme intense et crème onctueuse.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="h-40 rounded-xl bg-slate-800 overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=300&fit=crop"
                    alt="Thé aux Amandes"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                    3.500 DT
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Thé Vert aux Amandes 🍵</h4>
                  <p className="text-xs text-slate-400 mt-1">Infusion traditionnelle aux amandes torréfiées.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="h-40 rounded-xl bg-slate-800 overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop"
                    alt="Tiramisu"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                    5.500 DT
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Tiramisu Maison 🥐</h4>
                  <p className="text-xs text-slate-400 mt-1">Fait maison selon la recette traditionnelle italienne.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Conçu spécialement pour les <span className="gold-gradient-text">Cafés & Restaurants</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400 text-base">
            Une suite complète d'outils modernes pour digitaliser votre établissement en moins de 10 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">QR Codes Inaltérables</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Imprimez vos QR codes en formats SVG et PNG HD. Même si vous modifiez vos prix ou plats, le QR code reste inchangé.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Support Bilingue & RTL</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Vos clients basculent instantanément entre le Français et l'Arabe avec une disposition fluide de droite à gauche.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Modification en Temps Réel</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Un article est en rupture de stock ? Marquez-le comme indisponible en un clic depuis votre téléphone.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Prêt à transformer l'expérience de vos clients ?
            </h3>
            <p className="text-slate-300 text-base">
              Essayez gratuitement pendant 14 jours. Aucune carte bancaire requise.
            </p>
          </div>
          <Link
            to="/register"
            className="gold-button px-8 py-4 rounded-2xl text-base font-bold shrink-0"
          >
            Démarrer Maintenant
          </Link>
        </div>
      </section>
    </div>
  );
};
