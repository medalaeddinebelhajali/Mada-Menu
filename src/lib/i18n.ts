import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar';

export interface Translations {
  // Navigation
  home: string;
  features: string;
  pricing: string;
  demo: string;
  faq: string;
  contact: string;
  login: string;
  register: string;
  dashboard: string;
  superAdmin: string;
  logout: string;
  
  // Hero
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  startFreeTrial: string;
  viewDemoMenu: string;
  
  // Dashboard & Navigation
  overview: string;
  categories: string;
  products: string;
  qrCode: string;
  appearance: string;
  subscriptions: string;
  team: string;
  settings: string;
  support: string;

  // Buttons & Actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  loading: string;
  downloadPNG: string;
  downloadSVG: string;
  previewPublicMenu: string;
  
  // Statuses
  available: string;
  unavailable: string;
  active: string;
  expired: string;
  pending: string;
}

const translationsFR: Translations = {
  home: 'Accueil',
  features: 'Fonctionnalités',
  pricing: 'Tarifs',
  demo: 'Démo interactive',
  faq: 'FAQ',
  contact: 'Contact',
  login: 'Se connecter',
  register: 'Créer un compte',
  dashboard: 'Tableau de bord',
  superAdmin: 'Super Admin',
  logout: 'Déconnexion',

  heroTitle: 'Le menu QR d\'exception pour les',
  heroHighlight: 'Cafés & Restaurants en Tunisie',
  heroSubtitle: 'Sublimez l\'expérience de vos clients avec un menu digital instantané, responsive et personnalisable en français et arabe.',
  startFreeTrial: 'Essai gratuit 14 jours',
  viewDemoMenu: 'Tester le menu démo',

  overview: 'Vue d\'ensemble',
  categories: 'Catégories',
  products: 'Produits & Cartes',
  qrCode: 'Code QR & Partage',
  appearance: 'Apparence & Design',
  subscriptions: 'Abonnement & Factures',
  team: 'Équipe & Rôles',
  settings: 'Paramètres du Café',
  support: 'Support & Aide',

  save: 'Enregistrer',
  cancel: 'Annuler',
  delete: 'Supprimer',
  edit: 'Modifier',
  add: 'Ajouter',
  loading: 'Chargement en cours...',
  downloadPNG: 'Télécharger QR (PNG)',
  downloadSVG: 'Télécharger QR (SVG)',
  previewPublicMenu: 'Aperçu du menu public',

  available: 'Disponible',
  unavailable: 'Épuisé',
  active: 'Actif',
  expired: 'Expiré',
  pending: 'En attente',
};

const translationsAR: Translations = {
  home: 'الرئيسية',
  features: 'المميزات',
  pricing: 'الأسعار',
  demo: 'قائمة تجريبية',
  faq: 'الأسئلة الشائعة',
  contact: 'اتصل بنا',
  login: 'تسجيل الدخول',
  register: 'إنشاء حساب',
  dashboard: 'لوحة التحكم',
  superAdmin: 'الإدارة العليا',
  logout: 'تسجيل الخروج',

  heroTitle: 'قائمة الطعام الرقمية الاستثنائية لـ',
  heroHighlight: 'المقاهي والمطاعم في تونس',
  heroSubtitle: 'ارتقِ بتجربة حرفائك عبر قائمة طعام رقمية فورية، تفاعلية ومصممة باللغتين العربية والفرنسية.',
  startFreeTrial: 'تجربة مجانية لمدة 14 يومًا',
  viewDemoMenu: 'تجربة القائمة الحية',

  overview: 'نظرة عامة',
  categories: 'الأصناف',
  products: 'المنتجات والأسعار',
  qrCode: 'رمز QR والمشاركة',
  appearance: 'التصميم والتخصيص',
  subscriptions: 'الاشتراك والفوترة',
  team: 'فريق العمل والصلاحيات',
  settings: 'إعدادات المحل',
  support: 'الدعم الفني',

  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  add: 'إضافة',
  loading: 'جاري التحميل...',
  downloadPNG: 'تحميل رمز QR (PNG)',
  downloadSVG: 'تحميل رمز QR (SVG)',
  previewPublicMenu: 'معاينة القائمة العامة',

  available: 'متوفر',
  unavailable: 'غير متوفر',
  active: 'نشط',
  expired: 'منتهي',
  pending: 'قيد الانتظار',
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mada_lang') as Language) || 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mada_lang', lang);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const t = language === 'ar' ? translationsAR : translationsFR;

  return React.createElement(
    I18nContext.Provider,
    { value: { language, setLanguage, t, dir } },
    children
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
