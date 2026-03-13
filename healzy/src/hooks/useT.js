import { createContext, useContext } from 'react';
import { translations } from '../utils/translations';
import { useUIStore } from '../features/ui/store';

export const LanguageContext = createContext(null);

export const useT = () => {
  const language = useUIStore((s) => s.language);
  const t = translations[language] || translations.en;

  const get = (path) => {
    const keys = path.split('.');
    let val = t;
    for (const k of keys) {
      if (val == null) return path;
      val = val[k];
    }
    return val ?? path;
  };

  return { t, get, language };
};

