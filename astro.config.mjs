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

  redirects: {
    '/guides/what-are-basis-points/': '/bps-calculators/basis-point-guide/',
    '/en/bps-calculators-page-list/': '/bps-calculators/',
    '/en/bps/basis-point-faq/': '/faq/basis-point-faq/',
    '/bn/bps/': '/bn/bps-calculators/',
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
