import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';
import esTranslation from './locales/es.json';
import frTranslation from './locales/fr.json';

// Define RTL languages
const rtlLanguages = ['ar'];

// Get saved language from localStorage or default to 'en'
const getSavedLanguage = () => {
  return localStorage.getItem('language') || 'en';
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation },
      es: { translation: esTranslation },
      fr: { translation: frTranslation }
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Disable suspense for now
    }
  });

// Handle language change
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  // Update document direction for RTL support
  const isRTL = rtlLanguages.includes(lng);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
const currentLang = i18n.language;
const isRTL = rtlLanguages.includes(currentLang);
document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
document.documentElement.lang = currentLang;

export default i18n;
