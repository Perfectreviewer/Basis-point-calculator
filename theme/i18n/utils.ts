import type { GetStaticPaths } from 'astro';

import indexTranslations from '~/i18n/index.json';
import faqsTranslations from '~/i18n/faqs.json';
import aboutTranslations from '~/i18n/about.json';

import otherTranslations from '@theme/i18n/translations/other.json';

export type Locale = 'en' | 'hi' | 'es' | 'ru' | 'fr' | 'de' | 'it' | 'pt' | 'bn' | 'ja' | 'ko' | 'ms' | 'pl' | 'id' | 'ar' | 'bg' | 'tr' | 'sv';

export const languageMap: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  es: 'Español',
  ru: 'Русский',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  bn: 'বাংলা',
  ja: '日本語',
  ko: '한국어',
  ms: 'Malay',
  pl: 'Polski',
  id: 'Indonesia',
  ar: 'العربية',
  bg: 'Български',
  tr: 'Türkçe',
  sv: 'Svenska',
};

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'hi', 'es', 'ru', 'fr', 'de', 'it', 'pt', 'bn', 'ja', 'ko', 'ms', 'pl', 'id', 'ar', 'bg', 'tr', 'sv'];

// Merge index and other translations for a given locale
function mergeTranslations(locale: Locale) {
  const indexData = (indexTranslations as any)[locale] || (indexTranslations as any)['en'];
  const otherData = (otherTranslations as any)[locale] || (otherTranslations as any)['en'];
  const faqsData = (faqsTranslations as any)[locale] || (faqsTranslations as any)['en'];
  const aboutData = (aboutTranslations as any)[locale] || (aboutTranslations as any)['en'];

  return {
    ...indexData,
    ...otherData,
    ...faqsData,
    about: aboutData,
  };
}

// Get translations for a given locale
export function getTranslations(locale: Locale = defaultLocale) {
  return mergeTranslations(locale);
}

// Get the current locale from Astro's URL
export function getLocaleFromUrl(url: URL): Locale {
  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);

  // Check if the first segment is a locale (not default locale)
  const firstSegment = segments[0];
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  // Default locale doesn't have a prefix in the URL
  return defaultLocale;
}

// Get locale from Astro params (for use in getStaticPaths)
export function getLocaleFromParams(params: { lang?: string }): Locale {
  if (params.lang && locales.includes(params.lang as Locale)) {
    return params.lang as Locale;
  }
  return defaultLocale;
}

// Generate localized URL
export function getLocalizedUrl(path: string, locale: Locale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // For default locale, don't prefix with locale
  if (locale === defaultLocale) {
    return '/' + cleanPath;
  }

  return `/${locale}/${cleanPath}`;
}

// Helper to get nested translation value
export function getTranslationValue(
  translations: any,
  key: string
): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key; // Return the key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
}

// Helper for static paths generation
export function getStaticPathsForLocales(
  paths: Array<{ params: Record<string, string | undefined> }>
): ReturnType<GetStaticPaths> {
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      params: {
        ...path.params,
        lang: locale === defaultLocale ? undefined : locale,
      },
      props: {
        locale,
      },
    }))
  );
}
