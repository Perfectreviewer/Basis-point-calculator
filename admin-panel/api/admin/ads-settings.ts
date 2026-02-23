import type { APIRoute } from 'astro';
import { saveConfigFile } from '@admin/utils/github-commit';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ADS_SETTINGS_PATH = join(process.cwd(), 'src/config/ads-settings.json');

export const prerender = false;

function readAdsSettings() {
    if (!existsSync(ADS_SETTINGS_PATH)) {
        return {
            publisherId: '',
            autoAds: false,
            slots: {},
        };
    }
    return JSON.parse(readFileSync(ADS_SETTINGS_PATH, 'utf-8'));
}

export const GET: APIRoute = async () => {
    try {
        const data = readAdsSettings();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error reading ads settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to load ads settings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        if (!body || typeof body !== 'object') {
            return new Response(JSON.stringify({ error: 'Invalid ads settings data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Validate publisher ID format (numeric only, can be empty)
        if (body.publisherId && !/^\d*$/.test(body.publisherId)) {
            return new Response(JSON.stringify({ error: 'Publisher ID must be numeric' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Merge with existing to preserve any fields not sent
        const existing = readAdsSettings();
        const merged = { ...existing, ...body };

        const result = await saveConfigFile(ADS_SETTINGS_PATH, merged, 'chore(admin): update ads settings');
        if (!result.success) {
            return new Response(JSON.stringify({ error: result.error || 'Failed to save ads settings' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error saving ads settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to save ads settings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
