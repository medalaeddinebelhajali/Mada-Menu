import React, { useMemo, useRef, useState } from 'react';
import { Search, Globe, MapPin, Phone, MessageCircle, Coffee, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  MenuTemplateProps, getPalette, groupProducts, formatPrice,
  whatsappUrl, withAlpha, useMenuFonts,
} from './menuShared';
import { Product } from '../../types';

const Row: React.FC<{ children: React.ReactNode; border: string; ink: string; surface: string }> = ({ children, border, ink, surface }) => {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  const btn = 'hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full items-center justify-center shadow-md transition hover:scale-105';
  return (
    <div className="relative">
      <button type="button" onClick={() => go(-1)} className={`${btn} -left-3`} style={{ backgroundColor: surface, border: `1px solid ${border}`, color: ink }} aria-label="Précédent">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <button type="button" onClick={() => go(1)} className={`${btn} -right-3`} style={{ backgroundColor: surface, border: `1px solid ${border}`, color: ink }} aria-label="Suivant">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export const CafeTemplate: React.FC<MenuTemplateProps> = ({
  restaurant, categories, products, lang, setLang,
}) => {
  useMenuFonts();
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const isRtl = lang === 'ar';
  const theme = restaurant.theme_color || '#6f4e37';
  const bg = restaurant.bg_color || '#f3ece2';
  const P = getPalette(bg, theme);
  const font = isRtl ? "'Tajawal',sans-serif" : "'Poppins',system-ui,sans-serif";

  const t = isRtl
    ? { welcome: 'أهلاً بكم', cta: 'اكتشف القائمة', all: 'الكل', search: 'ابحث عن مشروب أو حلوى...', avail: 'متوفر', soldOut: 'غير متوفر', none: 'لا توجد نتائج', visit: 'تفضلوا بزيارتنا', call: 'اتصل بنا', wa: 'واتساب' }
    : { welcome: 'Bienvenue', cta: 'Découvrir le menu', all: 'Tout', search: 'Rechercher un café, un dessert...', avail: 'Disponible', soldOut: 'Épuisé', none: 'Aucun résultat', visit: 'Passez nous voir', call: 'Appeler', wa: 'WhatsApp' };

  const groups = useMemo(
    () => groupProducts(categories, products, active, query, isRtl),
    [categories, products, active, query, isRtl]
  );
  const wa = whatsappUrl(restaurant.whatsapp);
  const panel = P.isLight ? withAlpha('#ffffff', 0.55) : 'rgba(255,255,255,0.04)';

  const Card = ({ p }: { p: Product }) => {
    const name = isRtl ? p.name_ar || p.name_fr : p.name_fr;
    const desc = isRtl ? p.description_ar || p.description_fr : p.description_fr;
    return (
      <article className="snap-start shrink-0 w-44 sm:w-52 rounded-2xl p-2.5 flex flex-col" style={{ backgroundColor: P.isLight ? '#ffffff' : 'rgba(255,255,255,0.06)', border: `1px solid ${P.border}`, opacity: p.is_available ? 1 : 0.55 }}>
        <div className="aspect-[4/5] rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: withAlpha(theme, 0.12) }}>
          {p.image_url ? (
            <img src={p.image_url} alt={name} loading="lazy" className={`w-full h-full object-cover ${p.is_available ? '' : 'grayscale'}`} />
          ) : (
            <Coffee className="w-8 h-8" style={{ color: theme, opacity: 0.6 }} />
          )}
        </div>
        <h3 className="mt-2.5 text-sm font-semibold leading-snug line-clamp-1">{name}</h3>
        <p className="mt-0.5 text-[11px] leading-snug line-clamp-2 min-h-[2.1rem]" style={{ color: P.muted }}>{desc}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold tabular-nums">{formatPrice(p.price, restaurant.currency)}<span className="text-[10px] font-medium ms-0.5" style={{ color: P.muted }}>{restaurant.currency}</span></span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md" style={p.is_available ? { backgroundColor: theme, color: P.onTheme } : { backgroundColor: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>
            {p.is_available ? t.avail : t.soldOut}
          </span>
        </div>
      </article>
    );
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen" style={{ backgroundColor: bg, color: P.ink, fontFamily: font }}>
      <div className="max-w-5xl mx-auto px-4 pt-4">
        {/* ===== HERO ===== */}
        <header className="relative rounded-3xl overflow-hidden h-60 sm:h-80" style={{ backgroundColor: theme }}>
          {restaurant.cover_url && <img src={restaurant.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0" style={{ background: `linear-gradient(${isRtl ? 'to left' : 'to right'}, rgba(20,12,6,0.82), rgba(20,12,6,0.25))` }} />

          <div className="absolute top-4 inset-x-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              {restaurant.logo_url && <img src={restaurant.logo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-white/40" />}
              <span className="text-sm font-semibold tracking-wide">{restaurant.name}</span>
            </div>
            <button onClick={() => setLang(isRtl ? 'fr' : 'ar')} className="h-8 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 transition">
              <Globe className="w-3.5 h-3.5" /> {isRtl ? 'Français' : 'العربية'}
            </button>
          </div>

          <div className="absolute inset-x-6 sm:inset-x-10 bottom-7 text-white max-w-md">
            <p className="text-sm text-white/80">{t.welcome}</p>
            <h1 className="mt-1 text-2xl sm:text-4xl font-semibold leading-tight">{restaurant.description || restaurant.name}</h1>
            <button
              onClick={() => menuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="mt-4 h-10 px-6 rounded-full text-xs font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: '#fff', color: '#1f1a17' }}
            >
              {t.cta}
            </button>
          </div>
        </header>

        {/* ===== CATÉGORIES (icônes rondes) ===== */}
        <div className="mt-7 flex gap-5 overflow-x-auto sm:justify-center pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ id: 'all', icon: '☕', label: t.all }, ...categories.map(c => ({ id: c.id, icon: c.icon || '🍽️', label: isRtl ? c.name_ar || c.name_fr : c.name_fr }))].map(tab => {
            const on = active === tab.id;
            return (
              <button key={tab.id} onClick={() => setActive(tab.id)} className="shrink-0 flex flex-col items-center gap-1.5 w-16">
                <span className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition" style={{ backgroundColor: on ? theme : P.isLight ? '#ffffff' : 'rgba(255,255,255,0.07)', border: `1px solid ${on ? theme : P.border}`, boxShadow: on ? `0 6px 16px ${withAlpha(theme, 0.35)}` : 'none' }}>
                  {tab.icon}
                </span>
                <span className="text-[11px] font-medium text-center leading-tight line-clamp-2" style={{ color: on ? P.ink : P.muted }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===== RECHERCHE ===== */}
        <div className="mt-5 max-w-md mx-auto relative">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-4" style={{ color: P.muted }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} className="w-full h-11 rounded-full text-sm ps-11 pe-10 outline-none focus:ring-2" style={{ backgroundColor: P.isLight ? '#fff' : 'rgba(255,255,255,0.07)', border: `1px solid ${P.border}`, color: P.ink, ['--tw-ring-color' as any]: withAlpha(theme, 0.4) }} />
          {query && (
            <button onClick={() => setQuery('')} className="absolute top-1/2 -translate-y-1/2 end-3.5" style={{ color: P.muted }}><X className="w-4 h-4" /></button>
          )}
        </div>

        {/* ===== SECTIONS ===== */}
        <main ref={menuRef} className="mt-8 rounded-[2rem] p-4 sm:p-7 space-y-9 scroll-mt-4" style={{ backgroundColor: panel, border: `1px solid ${P.border}` }}>
          {groups.length === 0 && (
            <div className="py-16 text-center" style={{ color: P.muted }}>
              <Coffee className="w-9 h-9 mx-auto mb-3 opacity-60" />{t.none}
            </div>
          )}
          {groups.map(({ cat, items }) => (
            <section key={cat.id}>
              <h2 className="text-center text-[13px] font-bold uppercase tracking-[0.18em] mb-5">
                {cat.icon && <span className="me-2">{cat.icon}</span>}
                {isRtl ? cat.name_ar || cat.name_fr : cat.name_fr}
              </h2>
              <Row border={P.border} ink={P.ink} surface={P.isLight ? '#ffffff' : '#2a2a2e'}>
                {items.map(p => <Card key={p.id} p={p} />)}
              </Row>
            </section>
          ))}
        </main>

        {/* ===== BANDEAU CONTACT ===== */}
        {(wa || restaurant.phone || restaurant.address) && (
          <section className="mt-8 rounded-3xl px-6 py-10 text-center" style={{ backgroundColor: withAlpha(theme, P.isLight ? 0.14 : 0.12) }}>
            <h2 className="text-2xl font-semibold">{t.visit}</h2>
            {restaurant.address && (
              <p className="mt-2 text-sm flex items-center justify-center gap-1.5" style={{ color: P.muted }}>
                <MapPin className="w-4 h-4" style={{ color: theme }} />
                {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone.replace(/\s/g, '')}`} className="h-10 px-6 rounded-full inline-flex items-center gap-2 text-xs font-semibold" style={{ backgroundColor: theme, color: P.onTheme }}>
                  <Phone className="w-4 h-4" /> {t.call}
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="h-10 px-6 rounded-full inline-flex items-center gap-2 text-xs font-semibold text-white" style={{ backgroundColor: '#25D366' }}>
                  <MessageCircle className="w-4 h-4" /> {t.wa}
                </a>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="mt-8 px-6 py-8 text-center text-xs" style={{ backgroundColor: P.isLight ? '#2b1f17' : 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.65)' }}>
        <p className="text-base font-semibold text-white">{restaurant.name}</p>
        <p className="mt-3">Propulsé par <span className="font-semibold text-white">Mada Menu</span></p>
      </footer>
    </div>
  );
};
