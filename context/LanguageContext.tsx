import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { translations } from '../i18n/translations';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  // Fix: Allow formatDate to accept a Date object as well as a string.
  formatDate: (date: string | Date) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'pt';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as any)[k];
      } else {
        return key; // Return key if not found
      }
    }
    return typeof result === 'string' ? result : key;
  }, [language]);

  // Fix: Update formatDate to handle both string and Date types. This resolves the error in CalendarPage.tsx.
  const formatDate = useCallback((date: string | Date): string => {
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    return new Date(date).toLocaleDateString(locale);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t, formatDate }), [language, t, formatDate]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};