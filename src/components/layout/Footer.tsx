import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Heart, Shield, FileText, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
                <QrCode className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                MADA <span className="gold-gradient-text">MENU</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              La solution SaaS N°1 en Tunisie pour digitaliser les menus de cafés, salons de thé et restaurants avec QR codes haute résolution.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>in Tunisia 🇹🇳</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Plateforme</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/features" className="hover:text-amber-400 transition-colors">Fonctionnalités</Link></li>
              <li><Link to="/pricing" className="hover:text-amber-400 transition-colors">Offres & Tarifs</Link></li>
              <li><Link to="/m/cafe-central" target="_blank" className="hover:text-amber-400 transition-colors text-amber-400">Démo interactive</Link></li>
              <li><Link to="/faq" className="hover:text-amber-400 transition-colors">Foire aux questions</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Informations Légales</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/terms" className="hover:text-amber-400 transition-colors flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-amber-400" />Conditions d'Utilisation</Link></li>
              <li><Link to="/privacy" className="hover:text-amber-400 transition-colors flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-amber-400" />Politique de Confidentialité</Link></li>
              <li><Link to="/billing-policy" className="hover:text-amber-400 transition-colors flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-amber-400" />Politique de Facturation</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Payment */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Paiements & Support</h4>
            <p className="text-sm text-slate-400 mb-3">
              Intégration bancaire sécurisée Konnect & cartes bancaires tunisiennes (e-DINAR, Visa, Mastercard).
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Support client réactif 7j/7
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Mada Menu SaaS. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-slate-300">CGU</Link>
            <Link to="/privacy" className="hover:text-slate-300">Confidentialité</Link>
            <Link to="/billing-policy" className="hover:text-slate-300">Remboursements</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
