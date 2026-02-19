import type { APIRoute } from 'astro';
import { writeJSON } from '@admin/utils/storage';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SEO_SETTINGS_PATH = join(__dirname, '../../../../src/config/seo-settings.json');

export const prerender = false;

function readSeoSettings() {
    if (!existsSync(SEO_SETTINGS_PATH)) {
        return {
            robots: {
                userAgents: [{ name: '*', allow: ['/'], disallow: ['/admin/', '/api/'] }],
                customDirectives: '',
                sitemapUrl: '/sitemap-index.xml',
            },
            sitemap: {
                excludePatterns: ['/admin/*', '/api/*', '/404'],
                changefreq: 'weekly',
                priority: '0.7',
            },
            metaRobots: {
                globalDefault: 'index, follow',
                noindexPatterns: ['/admin/*', '/api/*'],
            },
        };
    }
    return JSON.parse(readFileSync(SEO_SETTINGS_PATH, 'utf-8'));
}

export const GET: APIRoute = async () => {
    try {
        const data = readSeoSettings();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error reading SEO settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to load SEO settings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        if (!body || typeof body !== 'object') {
            return new Response(JSON.stringify({ error: 'Invalid SEO settings data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Merge with existing to preserve any fields not sent
        const existing = readSeoSettings();
        const merged = { ...existing, ...body };

        writeJSON(SEO_SETTINGS_PATH, merged);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error saving SEO settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to save SEO settings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
