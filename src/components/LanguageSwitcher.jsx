import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-md bg-transparent hover:bg-slate-100 transition-colors text-xs"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Globe size={16} className="text-slate-600" />
        <span className="text-xs font-medium text-slate-700">{currentLanguage.label}</span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-sm border border-slate-200 z-50"
        >
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                lang.code === i18n.language ? 'bg-slate-50' : ''
              }`}
              whileHover={{ backgroundColor: '#f8fafc' }}
            >
              <span className={`text-sm font-medium ${lang.code === i18n.language ? 'text-blue-600' : 'text-slate-700'}`}>
                {lang.label}
              </span>
              {lang.code === i18n.language && (
                <span className="ml-auto text-blue-600 text-sm">✓</span>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
