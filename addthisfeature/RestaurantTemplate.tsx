import React, { useMemo, useState } from 'react';
import { Search, Globe, MapPin, Phone, MessageCircle, Utensils, X } from 'lucide-react';
import {
  MenuTemplateProps, getPalette, groupProducts, formatPrice,
  whatsappUrl, withAlpha, useMenuFonts,
} from './menuShared';

const Ornament: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex items-center justify-center gap-2" aria-hidden>
    <span className="h-px w-10" style={{ backgroundColor: color, opacity: 0.6 }} />
    <span className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: color }} />
    <span className="h-px w-10" style={{ backgroundColor: color, opacity: 0.6 }} />
  </div>
);

export const RestaurantTemplate: React.FC<MenuTemplateProps> = ({
  restaurant, categories, products, lang, setLang,
}) => {
  useMenuFonts();
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');

  const isRtl = lang === 'ar';
  const theme = restaurant.theme_color || '#c9a46a';
  const bg = restaurant.bg_color || '#0f0f11';
  const P = getPalette(bg, theme);

  const serif = isRtl ? "'Tajawal',sans-serif" : "'Cormorant Garamond',Georgia,serif";
  const sans = isRtl ? "'Tajawal',sans-serif" : "'Inter',system-ui,sans-serif";

  const t = isRtl
    ? { label: 'قائمة الطعام', all: 'الكل', search: 'ابحث...', soldOut: 'غير متوفر', chef: 'اختيار الشيف', book: 'احجز طاولتك', bookText: 'تواصل معنا لحجز طاولتك', call: 'اتصل بنا', wa: 'واتساب', none: 'لا توجد نتائج' }
    : { label: 'Notre carte', all: 'Tout', search: 'Rechercher...', soldOut: 'Épuisé', chef: 'Sélection du chef', book: 'Réserver une table', bookText: 'Contactez-nous pour réserver votre table', call: 'Appeler', wa: 'WhatsApp', none: 'Aucun résultat' };

  const groups = useMemo(
    () => groupProducts(categories, products, active, query, isRtl),
    [categories, products, active, query, isRtl]
  );

  const featured = useMemo(
    () => products.find(p => p.is_available && p.image_url && (p.description_fr || p.description_ar)),
    [products]
  );
  const showFeatured = !!featured && active === 'all' && !query && products.length >= 4;
  const wa = whatsappUrl(restaurant.whatsapp);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen" style={{ backgroundColor: bg, color: P.ink, fontFamily: sans }}>
      {/* ===== HERO ===== */}
      <header className="relative h-72 sm:h-96 w-full overflow-hidden" style={{ backgroundColor: withAlpha(theme, 0.2) }}>
        {restaurant.cover_url && <img src={restaurant.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.45) 50%, ${bg})` }} />

        <button
          onClick={() => setLang(isRtl ? 'fr' : 'ar')}
          className="absolute top-4 end-4 z-10 h-9 px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md bg-black/40 text-white border border-white/20 hover:bg-black/60 transition"
        >
          <Globe className="w-3.5 h-3.5" />
          {isRtl ? 'Français' : 'العربية'}
        </button>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 text-white">
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt="" className="w-16 h-16 rounded-full object-cover mb-4 border" style={{ borderColor: theme }} />
          )}
          <p className="text-[11px] tracking-[0.35em] uppercase mb-3" style={{ color: theme }}>{t.label}</p>
          <h1 className="text-4xl sm:text-6xl font-semibold leading-tight" style={{ fontFamily: serif }}>{restaurant.name}</h1>
          <div className="mt-4"><Ornament color={theme} /></div>
          {restaurant.description && <p className="mt-4 text-sm text-white/75 max-w-md leading-relaxed">{restaurant.description}</p>}
        </div>
      </header>

      {/* ===== BARRE CATÉGORIES ===== */}
      <div className="sticky top-0 z-30 backdrop-blur-xl" style={{ backgroundColor: withAlpha(bg, 0.9), borderBottom: `1px solid ${P.border}` }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-3">
          <nav className="flex-1 flex gap-1 overflow-x-auto sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ id: 'all', label: t.all }, ...categories.map(c => ({ id: c.id, label: isRtl ? c.name_ar || c.name_fr : c.name_fr }))].map(tab => {
              const on = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className="shrink-0 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap relative transition-colors"
                  style={{ color: on ? theme : P.muted }}
                >
                  {tab.label}
                  <span className="absolute inset-x-4 -bottom-0.5 h-px transition-opacity" style={{ backgroundColor: theme, opacity: on ? 1 : 0 }} />
                </button>
              );
            })}
          </nav>
          <div className="relative sm:w-56">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3" style={{ color: P.muted }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.search}
              className="w-full h-9 rounded-full text-sm ps-9 pe-8 outline-none bg-transparent"
              style={{ border: `1px solid ${P.border}`, color: P.ink }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute top-1/2 -translate-y-1/2 end-2.5" style={{ color: P.muted }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== MENU ===== */}
      <main className="max-w-5xl mx-auto px-5 py-14 space-y-16">
        {groups.length === 0 && (
          <div className="py-20 text-center" style={{ color: P.muted }}>
            <Utensils className="w-9 h-9 mx-auto mb-3 opacity-60" />
            {t.none}
          </div>
        )}

        {groups.map(({ cat, items }, idx) => (
          <React.Fragment key={cat.id}>
            <section>
              <div className="text-center mb-10 space-y-3">
                <h2 className="text-3xl sm:text-4xl font-semibold" style={{ fontFamily: serif }}>
                  {cat.icon && <span className="me-2 text-2xl">{cat.icon}</span>}
                  {isRtl ? cat.name_ar || cat.name_fr : cat.name_fr}
                </h2>
                <Ornament color={theme} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {items.map(p => {
                  const name = isRtl ? p.name_ar || p.name_fr : p.name_fr;
                  const desc = isRtl ? p.description_ar || p.description_fr : p.description_fr;
                  return (
                    <article key={p.id} className="group text-center" style={{ opacity: p.is_available ? 1 : 0.5 }}>
                      <div className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: P.surface, border: `1px solid ${P.border}` }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={name} loading="lazy" className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${p.is_available ? '' : 'grayscale'}`} />
                        ) : (
                          <Utensils className="w-8 h-8" style={{ color: P.muted, opacity: 0.5 }} />
                        )}
                      </div>
                      <h3 className="mt-4 text-lg font-semibold leading-snug" style={{ fontFamily: serif }}>{name}</h3>
                      {desc && <p className="mt-1 text-[12px] leading-relaxed line-clamp-2 px-1" style={{ color: P.muted }}>{desc}</p>}
                      <p className="mt-2 text-sm font-semibold tabular-nums" style={{ color: theme }}>
                        {formatPrice(p.price, restaurant.currency)} {restaurant.currency}
                      </p>
                      {!p.is_available && <p className="mt-1 text-[11px] uppercase tracking-wider text-rose-500">{t.soldOut}</p>}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Sélection du chef après la 1re catégorie */}
            {idx === 0 && showFeatured && featured && (
              <section className="rounded-3xl overflow-hidden grid md:grid-cols-2" style={{ backgroundColor: P.surface, border: `1px solid ${P.border}` }}>
                <div className="aspect-[4/3] md:aspect-auto">
                  <img src={featured.image_url!} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 sm:p-12 flex flex-col justify-center gap-3">
                  <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: theme }}>{t.chef}</p>
                  <h3 className="text-3xl font-semibold" style={{ fontFamily: serif }}>
                    {isRtl ? featured.name_ar || featured.name_fr : featured.name_fr}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: P.muted }}>
                    {isRtl ? featured.description_ar || featured.description_fr : featured.description_fr}
                  </p>
                  <p className="text-xl font-semibold mt-2" style={{ color: theme }}>
                    {formatPrice(featured.price, restaurant.currency)} {restaurant.currency}
                  </p>
                </div>
              </section>
            )}
          </React.Fragment>
        ))}
      </main>

      {/* ===== RÉSERVATION ===== */}
      {(wa || restaurant.phone) && (
        <section className="relative py-20 text-center px-6" style={{ backgroundColor: withAlpha(theme, P.isLight ? 0.1 : 0.08), borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}` }}>
          <p className="text-[11px] tracking-[0.35em] uppercase mb-3" style={{ color: theme }}>{t.label}</p>
          <h2 className="text-3xl sm:text-4xl font-semibold" style={{ fontFamily: serif }}>{t.book}</h2>
          <p className="mt-3 text-sm" style={{ color: P.muted }}>{t.bookText}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="h-11 px-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition" style={{ backgroundColor: theme, color: P.onTheme }}>
                <MessageCircle className="w-4 h-4" /> {t.wa}
              </a>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone.replace(/\s/g, '')}`} className="h-11 px-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition hover:opacity-80" style={{ border: `1px solid ${theme}`, color: theme }}>
                <Phone className="w-4 h-4" /> {t.call}
              </a>
            )}
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="py-14 px-6 flex justify-center">
        <div className="w-full max-w-sm text-center p-8 space-y-3" style={{ border: `1px solid ${withAlpha(theme, 0.4)}` }}>
          <h3 className="text-2xl font-semibold" style={{ fontFamily: serif }}>{restaurant.name}</h3>
          <Ornament color={theme} />
          {restaurant.address && (
            <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: P.muted }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: theme }} />
              {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
            </p>
          )}
          {restaurant.phone && <p className="text-xs" dir="ltr" style={{ color: P.muted }}>{restaurant.phone}</p>}
          <p className="pt-4 text-[11px]" style={{ color: P.muted }}>Propulsé par <span style={{ color: P.ink }} className="font-semibold">Mada Menu</span></p>
        </div>
      </footer>
    </div>
  );
};
