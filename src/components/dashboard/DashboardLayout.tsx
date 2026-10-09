import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { 
  LayoutDashboard, FolderKanban, UtensilsCrossed, QrCode, Palette, 
  CreditCard, Users, Settings, HelpCircle, LogOut, ChevronDown, 
  Menu, X, Sparkles, ExternalLink, ShieldCheck, Plus, Store
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { user, restaurants, currentRestaurant, setCurrentRestaurant, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resDropdownOpen, setResDropdownOpen] = useState(false);

  const navigationItems = [
    { id: 'overview', label: t.overview, icon: LayoutDashboard },
    { id: 'categories', label: t.categories, icon: FolderKanban },
    { id: 'products', label: t.products, icon: UtensilsCrossed },
    { id: 'qr', label: t.qrCode, icon: QrCode },
    { id: 'appearance', label: t.appearance, icon: Palette },
    { id: 'subscriptions', label: t.subscriptions, icon: CreditCard },
    { id: 'team', label: t.team, icon: Users },
    { id: 'support', label: t.support, icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl bg-slate-800 text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-white text-base">Mada Menu Dashboard</span>
        </div>

        {currentRestaurant && (
          <Link
            to={`/m/${currentRestaurant.slug}`}
            target="_blank"
            className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 border-r border-slate-800/80 p-5 flex flex-col justify-between backdrop-blur-2xl transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          
          {/* Brand & Restaurant Switcher */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
                <QrCode className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white">MADA <span className="gold-gradient-text">MENU</span></span>
                <span className="text-[10px] uppercase font-bold text-amber-500">Dashboard SaaS</span>
              </div>
            </Link>

            {/* Restaurant Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setResDropdownOpen(!resDropdownOpen)}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all text-left"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">
                      {currentRestaurant?.name || 'Sélectionner un café'}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">/m/{currentRestaurant?.slug}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {resDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 z-50 shadow-2xl space-y-1">
                  {restaurants.map(res => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setCurrentRestaurant(res);
                        setResDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        res.id === currentRestaurant?.id ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="truncate">{res.name}</span>
                      {res.id === currentRestaurant?.id && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setResDropdownOpen(false);
                      navigate('/onboarding');
                    }}
                    className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 border-t border-slate-900 mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un établissement
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'gold-button text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          
          {user?.is_super_admin && (
            <Link
              to="/super-admin"
              className="w-full py-2.5 px-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 hover:bg-purple-500/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Panneau Super Admin
            </Link>
          )}

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate text-xs">
                <p className="font-bold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 md:ml-72 p-4 sm:p-8 space-y-6 max-w-7xl">
        
        {/* Public Menu Quick Link Bar */}
        {currentRestaurant && (
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-500/20 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Menu QR Actif</h4>
                <p className="text-xs text-amber-400/90 font-mono">
                  https://mada-menu.tn/m/{currentRestaurant.slug}
                </p>
              </div>
            </div>

            <Link
              to={`/m/${currentRestaurant.slug}`}
              target="_blank"
              className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
            >
              <span>{t.previewPublicMenu}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {children}
      </main>
    </div>
  );
};
