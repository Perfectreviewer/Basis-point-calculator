import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

import config from './src/config/config.json';

import mdx from '@astrojs/mdx';

import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url,
  trailingSlash: 'ignore',

  // Disable built-in origin check — our API routes have their own auth (session + role checks).
  // This was blocking multipart form uploads on Vercel with "Cross-site request forgery" errors.
  security: {
    checkOrigin: false,
  },

  redirects: {
    // Existing
    '/guides/what-are-basis-points/': '/bps-calculators/basis-point-guide/',
    '/en/bps-calculators-page-list/': '/bps-calculators/',
    '/en/bps/basis-point-faq/': '/faq/basis-point-faq/',
    '/bn/bps/': '/bn/bps-calculators/',

    // Old root pages → canonical legal pages
    '/terms/': '/legal/terms-and-conditions/',
    '/privacy/': '/legal/privacy-policy/',
    '/about/contact/': '/contact-us/',

    // Old /terms/ redirects — expanded per locale
    '/hi/terms/': '/hi/legal/terms-and-conditions/',
    '/es/terms/': '/es/legal/terms-and-conditions/',
    '/ru/terms/': '/ru/legal/terms-and-conditions/',
    '/fr/terms/': '/fr/legal/terms-and-conditions/',
    '/de/terms/': '/de/legal/terms-and-conditions/',
    '/it/terms/': '/it/legal/terms-and-conditions/',
    '/pt/terms/': '/pt/legal/terms-and-conditions/',
    '/bn/terms/': '/bn/legal/terms-and-conditions/',
    '/ja/terms/': '/ja/legal/terms-and-conditions/',
    '/ko/terms/': '/ko/legal/terms-and-conditions/',
    '/ms/terms/': '/ms/legal/terms-and-conditions/',
    '/pl/terms/': '/pl/legal/terms-and-conditions/',
    '/id/terms/': '/id/legal/terms-and-conditions/',
    '/ar/terms/': '/ar/legal/terms-and-conditions/',
    '/bg/terms/': '/bg/legal/terms-and-conditions/',
    '/tr/terms/': '/tr/legal/terms-and-conditions/',
    '/sv/terms/': '/sv/legal/terms-and-conditions/',

    // Old /privacy/ redirects — expanded per locale
    '/hi/privacy/': '/hi/legal/privacy-policy/',
    '/es/privacy/': '/es/legal/privacy-policy/',
    '/ru/privacy/': '/ru/legal/privacy-policy/',
    '/fr/privacy/': '/fr/legal/privacy-policy/',
    '/de/privacy/': '/de/legal/privacy-policy/',
    '/it/privacy/': '/it/legal/privacy-policy/',
    '/pt/privacy/': '/pt/legal/privacy-policy/',
    '/bn/privacy/': '/bn/legal/privacy-policy/',
    '/ja/privacy/': '/ja/legal/privacy-policy/',
    '/ko/privacy/': '/ko/legal/privacy-policy/',
    '/ms/privacy/': '/ms/legal/privacy-policy/',
    '/pl/privacy/': '/pl/legal/privacy-policy/',
    '/id/privacy/': '/id/legal/privacy-policy/',
    '/ar/privacy/': '/ar/legal/privacy-policy/',
    '/bg/privacy/': '/bg/legal/privacy-policy/',
    '/tr/privacy/': '/tr/legal/privacy-policy/',
    '/sv/privacy/': '/sv/legal/privacy-policy/',

    // Old /about/contact/ redirects — expanded per locale to avoid getStaticPaths() build error
    '/hi/about/contact/': '/hi/contact-us/',
    '/es/about/contact/': '/es/contact-us/',
    '/ru/about/contact/': '/ru/contact-us/',
    '/fr/about/contact/': '/fr/contact-us/',
    '/de/about/contact/': '/de/contact-us/',
    '/it/about/contact/': '/it/contact-us/',
    '/pt/about/contact/': '/pt/contact-us/',
    '/bn/about/contact/': '/bn/contact-us/',
    '/ja/about/contact/': '/ja/contact-us/',
    '/ko/about/contact/': '/ko/contact-us/',
    '/ms/about/contact/': '/ms/contact-us/',
    '/pl/about/contact/': '/pl/contact-us/',
    '/id/about/contact/': '/id/contact-us/',
    '/ar/about/contact/': '/ar/contact-us/',
    '/bg/about/contact/': '/bg/contact-us/',
    '/tr/about/contact/': '/tr/contact-us/',
    '/sv/about/contact/': '/sv/contact-us/',

    // Old /sitemap/ redirects — expanded per locale
    '/hi/sitemap/': '/sitemap/',
    '/es/sitemap/': '/sitemap/',
    '/ru/sitemap/': '/sitemap/',
    '/fr/sitemap/': '/sitemap/',
    '/de/sitemap/': '/sitemap/',
    '/it/sitemap/': '/sitemap/',
    '/pt/sitemap/': '/sitemap/',
    '/bn/sitemap/': '/sitemap/',
    '/ja/sitemap/': '/sitemap/',
    '/ko/sitemap/': '/sitemap/',
    '/ms/sitemap/': '/sitemap/',
    '/pl/sitemap/': '/sitemap/',
    '/id/sitemap/': '/sitemap/',
    '/ar/sitemap/': '/sitemap/',
    '/bg/sitemap/': '/sitemap/',
    '/tr/sitemap/': '/sitemap/',
    '/sv/sitemap/': '/sitemap/',

    // /blog/ → /guides/ for all locales
    '/blog/': '/guides/',
    '/hi/blog/': '/hi/guides/',
    '/es/blog/': '/es/guides/',
    '/ru/blog/': '/ru/guides/',
    '/fr/blog/': '/fr/guides/',
    '/de/blog/': '/de/guides/',
    '/it/blog/': '/it/guides/',
    '/pt/blog/': '/pt/guides/',
    '/bn/blog/': '/bn/guides/',
    '/ja/blog/': '/ja/guides/',
    '/ko/blog/': '/ko/guides/',
    '/ms/blog/': '/ms/guides/',
    '/pl/blog/': '/pl/guides/',
    '/id/blog/': '/id/guides/',
    '/ar/blog/': '/ar/guides/',
    '/bg/blog/': '/bg/guides/',
    '/tr/blog/': '/tr/guides/',
    '/sv/blog/': '/sv/guides/',

    // /about/about-us/ → /about-us/ for all locales
    '/about/about-us/': '/about-us/',
    '/hi/about/about-us/': '/hi/about-us/',
    '/es/about/about-us/': '/es/about-us/',
    '/ru/about/about-us/': '/ru/about-us/',
    '/fr/about/about-us/': '/fr/about-us/',
    '/de/about/about-us/': '/de/about-us/',
    '/it/about/about-us/': '/it/about-us/',
    '/pt/about/about-us/': '/pt/about-us/',
    '/bn/about/about-us/': '/bn/about-us/',
    '/ja/about/about-us/': '/ja/about-us/',
    '/ko/about/about-us/': '/ko/about-us/',
    '/ms/about/about-us/': '/ms/about-us/',
    '/pl/about/about-us/': '/pl/about-us/',
    '/id/about/about-us/': '/id/about-us/',
    '/ar/about/about-us/': '/ar/about-us/',
    '/bg/about/about-us/': '/bg/about-us/',
    '/tr/about/about-us/': '/tr/about-us/',
    '/sv/about/about-us/': '/sv/about-us/',

    // /bps-calculators/basis-point-difference/ → /bps-calculators/basis-point-difference-calculator/ for all locales
    '/bps-calculators/basis-point-difference/': '/bps-calculators/basis-point-difference-calculator/',
    '/hi/bps-calculators/basis-point-difference/': '/hi/bps-calculators/basis-point-difference-calculator/',
    '/es/bps-calculators/basis-point-difference/': '/es/bps-calculators/basis-point-difference-calculator/',
    '/ru/bps-calculators/basis-point-difference/': '/ru/bps-calculators/basis-point-difference-calculator/',
    '/fr/bps-calculators/basis-point-difference/': '/fr/bps-calculators/basis-point-difference-calculator/',
    '/de/bps-calculators/basis-point-difference/': '/de/bps-calculators/basis-point-difference-calculator/',
    '/it/bps-calculators/basis-point-difference/': '/it/bps-calculators/basis-point-difference-calculator/',
    '/pt/bps-calculators/basis-point-difference/': '/pt/bps-calculators/basis-point-difference-calculator/',
    '/bn/bps-calculators/basis-point-difference/': '/bn/bps-calculators/basis-point-difference-calculator/',
    '/ja/bps-calculators/basis-point-difference/': '/ja/bps-calculators/basis-point-difference-calculator/',
    '/ko/bps-calculators/basis-point-difference/': '/ko/bps-calculators/basis-point-difference-calculator/',
    '/ms/bps-calculators/basis-point-difference/': '/ms/bps-calculators/basis-point-difference-calculator/',
    '/pl/bps-calculators/basis-point-difference/': '/pl/bps-calculators/basis-point-difference-calculator/',
    '/id/bps-calculators/basis-point-difference/': '/id/bps-calculators/basis-point-difference-calculator/',
    '/ar/bps-calculators/basis-point-difference/': '/ar/bps-calculators/basis-point-difference-calculator/',
    '/bg/bps-calculators/basis-point-difference/': '/bg/bps-calculators/basis-point-difference-calculator/',
    '/tr/bps-calculators/basis-point-difference/': '/tr/bps-calculators/basis-point-difference-calculator/',
    '/sv/bps-calculators/basis-point-difference/': '/sv/bps-calculators/basis-point-difference-calculator/',
  },

  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/api/') &&
        !page.includes('/design_preview') &&
        !new URL(page).pathname.startsWith('/en/'),
    }),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@admin': resolve(__dirname, 'admin-panel'),
      },
    },
  },

  adapter: vercel(),

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi', 'es', 'ru', 'fr', 'de', 'it', 'pt', 'bn', 'ja', 'ko', 'ms', 'pl', 'id', 'ar', 'bg', 'tr', 'sv'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
