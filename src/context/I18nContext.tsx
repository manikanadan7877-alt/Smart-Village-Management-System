import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'hi';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    complaints: 'Complaints',
    map: 'Digital Twin Map',
    profile: 'Profile',
    settings: 'Settings',
    signOut: 'Sign Out',
    submitComplaint: 'Report an Issue',
    waterTanks: 'Water Tanks',
    garbageBins: 'Garbage Bins',
    analytics: 'Analytics',
    agriculture: 'Agriculture',
    healthcare: 'Healthcare',
    education: 'Education',
    infrastructure: 'Infrastructure',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    complaints: 'शिकायतें',
    map: 'डिजिटल ट्विन मानचित्र',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    submitComplaint: 'शिकायत दर्ज करें',
    waterTanks: 'जल टैंक',
    garbageBins: 'कचरा बिन',
    analytics: 'विश्लेषण',
    agriculture: 'कृषि',
    healthcare: 'स्वास्थ्य सेवा',
    education: 'शिक्षा',
    infrastructure: 'बुनियादी ढांचा',
  },
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => translations[language][key] ?? key;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
