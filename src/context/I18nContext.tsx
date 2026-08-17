import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Language, VillageContext } from '@/lib/village-types';
import { translations } from '@/lib/i18n';

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  village: VillageContext | null;
  setVillage: (v: VillageContext | null) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const DEFAULT_VILLAGE: VillageContext = {
  name: 'Melur',
  district: 'Madurai',
  state: 'Tamil Nadu',
  country: 'India',
  latitude: 10.0532,
  longitude: 78.3394,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('village-lang') as Language) || 'en';
  });
  const [village, setVillageState] = useState<VillageContext | null>(() => {
    const stored = localStorage.getItem('village-context');
    return stored ? JSON.parse(stored) : DEFAULT_VILLAGE;
  });

  useEffect(() => {
    localStorage.setItem('village-lang', lang);
  }, [lang]);

  useEffect(() => {
    if (village) {
      localStorage.setItem('village-context', JSON.stringify(village));
    }
  }, [village]);

  function setLang(l: Language) {
    setLangState(l);
  }

  function setVillage(v: VillageContext | null) {
    setVillageState(v);
  }

  function t(key: string): string {
    return translations[lang][key] ?? translations.en[key] ?? key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, village, setVillage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
