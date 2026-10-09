import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Globe, Menu, X, LayoutDashboard, LogIn, Sparkles, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              MADA <span className="gold-gradient-text">MENU</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/90">
              SaaS Tunisie
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-amber-400 transition-colors">{t.home}</Link>
          <Link to="/features" className="hover:text-amber-400 transition-colors">{t.features}</Link>
          <Link to="/pricing" className="hover:text-amber-400 transition-colors">{t.pricing}</Link>
          <Link to="/m/cafe-central" target="_blank" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-amber-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            {t.demo}
          </Link>
          <Link to="/faq" className="hover:text-amber-400 transition-colors">{t.faq}</Link>
          <Link to="/contact" className="hover:text-amber-400 transition-colors">{t.contact}</Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            title="Changer de langue / تغيير اللغة"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
          </button>

          {/* Auth Action */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.is_super_admin && (
                <Link
                  to="/super-admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/20 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Super Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                className="gold-button px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-950" />
                {t.dashboard}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                {t.login}
              </Link>
              <Link
                to="/register"
                className="gold-button px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                {t.register}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-6 py-6 space-y-4">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-slate-200 font-medium">{t.home}</Link>
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block text-slate-200 font-medium">{t.features}</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block text-slate-200 font-medium">{t.pricing}</Link>
          <Link to="/m/cafe-central" target="_blank" onClick={() => setMobileMenuOpen(false)} className="block text-amber-400 font-semibold">{t.demo}</Link>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="block text-slate-200 font-medium">{t.faq}</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-slate-200 font-medium">{t.contact}</Link>
          
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="gold-button py-3 text-center rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-950" />
                {t.dashboard}
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 text-sm font-semibold"
                >
                  {t.login}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gold-button py-2.5 text-center rounded-xl text-sm font-bold"
                >
                  {t.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
