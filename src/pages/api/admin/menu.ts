import type { APIRoute } from 'astro';
import { writeJSON } from '@admin/utils/storage';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Static import ensures data is available even if file system isn't matching src structure in prod
// @ts-ignore
import navData from '../../../../src/config/navigation.json';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
// Attempt to write to the source path for local dev
const NAV_CONFIG_PATH = join(__dirname, '../../../../src/config/navigation.json');

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        // Return statically imported data
        return new Response(JSON.stringify(navData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error reading navigation config:', error);
        return new Response(JSON.stringify({ error: 'Failed to load navigation data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.header || !Array.isArray(body.header) || !body.footer || !Array.isArray(body.footer)) {
            return new Response(JSON.stringify({ error: 'Invalid menu data structure' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Write directly to the config file (best effort for local dev)
        // On Vercel, this will likely write to ephemeral storage or fail silently if permissions deny
        // But for this current architecture, it is the intended behavior.
        writeJSON(NAV_CONFIG_PATH, body);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error saving navigation config:', error);
        return new Response(JSON.stringify({ error: 'Failed to save navigation data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
