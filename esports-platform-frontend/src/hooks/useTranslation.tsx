import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import tr from '../locales/tr';
import en from '../locales/en';

type Locale = 'tr' | 'en';
type Translations = Record<string, any>;

const translations: Record<Locale, Translations> = { tr, en };

type TranslationContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const TranslationContext = createContext<TranslationContextType>({
  locale: 'tr',
  setLocale: () => {},
  t: (key: string) => key,
});

function resolveNestedKey(obj: any, key: string): string {
  const parts = key.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return key;
    }
  }
  return typeof current === 'string' ? current : key;
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    return (localStorage.getItem('megdev_locale') as Locale) || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('megdev_locale', locale);
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const text = resolveNestedKey(translations[locale], key);
    if (!params) return text;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      text
    );
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
