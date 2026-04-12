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

    // Localized sitemap hits → HTML sitemap
    '/[lang]/sitemap/': '/sitemap/',
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
