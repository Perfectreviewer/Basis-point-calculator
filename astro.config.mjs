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

    // Localized old URLs → canonical localized pages
    '/[lang]/terms/': '/[lang]/legal/terms-and-conditions/',
    '/[lang]/privacy/': '/[lang]/legal/privacy-policy/',

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
