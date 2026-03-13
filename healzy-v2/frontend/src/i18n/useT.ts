'use client';

import { useLocaleStore } from '@/store/appStore';
import { translations, type Locale } from './translations';

export function useT() {
  const { locale } = useLocaleStore();
  const t = translations[locale as Locale] || translations.en;
  return { t, locale };
}
