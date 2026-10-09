import { useEffect } from 'react';
import { Restaurant, Category, Product } from '../../types';

export interface MenuTemplateProps {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  lang: 'fr' | 'ar';
  setLang: (l: 'fr' | 'ar') => void;
}

export const hexToRgb = (hex: string) => {
  let h = (hex || '#000000').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

export const luminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export const withAlpha = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

export const formatPrice = (price: number, currency?: string) => {
  const c = (currency || '').toUpperCase();
  const decimals = c === 'TND' || c === 'DT' ? 3 : 2;
  return Number(price).toFixed(decimals);
};

export const whatsappUrl = (n?: string | null) =>
  n ? `https://wa.me/${n.replace(/[^\d]/g, '')}` : null;

/** Palette dérivée automatiquement de la couleur de fond choisie */
export const getPalette = (bg: string, theme: string) => {
  const isLight = luminance(bg) > 0.5;
  return {
    isLight,
    ink: isLight ? '#1f1a17' : '#f5f1ea',
    muted: isLight ? 'rgba(31,26,23,0.62)' : 'rgba(245,241,234,0.62)',
    surface: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
    border: isLight ? 'rgba(31,26,23,0.09)' : 'rgba(255,255,255,0.1)',
    onTheme: luminance(theme) > 0.5 ? '#1a1410' : '#ffffff',
  };
};

export const groupProducts = (
  categories: Category[],
  products: Product[],
  active: string,
  query: string,
  isRtl: boolean
) => {
  const q = query.trim().toLowerCase();
  return [...categories]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .filter(c => active === 'all' || c.id === active)
    .map(cat => ({
      cat,
      items: products.filter(p => {
        if (p.category_id !== cat.id) return false;
        if (!q) return true;
        return (isRtl ? p.name_ar || p.name_fr : p.name_fr).toLowerCase().includes(q);
      }),
    }))
    .filter(g => g.items.length > 0);
};

/** Charge les polices Google une seule fois (pas besoin de toucher index.html) */
export const useMenuFonts = () => {
  useEffect(() => {
    const id = 'menu-fonts';
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id;
    l.rel = 'stylesheet';
    l.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap';
    document.head.appendChild(l);
  }, []);
};
