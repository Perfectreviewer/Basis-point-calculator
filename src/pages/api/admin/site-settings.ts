import type { APIRoute } from 'astro';
import { writeJSON } from '@admin/utils/storage';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// @ts-ignore
import siteSettings from '../../../../src/config/site-settings.json';
// @ts-ignore
import configData from '../../../../src/config/config.json';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SITE_SETTINGS_PATH = join(__dirname, '../../../../src/config/site-settings.json');
const CONFIG_PATH = join(__dirname, '../../../../src/config/config.json');

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        return new Response(JSON.stringify({
            siteSettings,
            social: configData.social || [],
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error reading site settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to load site settings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // Validate structure
        if (!body.siteSettings || typeof body.siteSettings !== 'object') {
            return new Response(JSON.stringify({ error: 'Invalid site settings data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Write site-settings.json
        writeJSON(SITE_SETTINGS_PATH, body.siteSettings);

        // Write social links to config.json if provided
        if (body.social && Array.isArray(body.social)) {
            const updatedConfig = { ...configData, social: body.social };
            writeJSON(CONFIG_PATH, updatedConfig);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error saving site settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to save site settings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
