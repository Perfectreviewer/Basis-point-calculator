import type { APIRoute } from 'astro';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const prerender = false;

const SEO_SETTINGS_PATH = join(process.cwd(), 'src', 'config', 'seo-settings.json');

export const GET: APIRoute = ({ params }) => {
    const requestedKey = params.key;

    if (!requestedKey) {
        return new Response('Not found', { status: 404 });
    }

    // Read the IndexNow key from seo-settings.json
    let storedKey = '';
    try {
        if (existsSync(SEO_SETTINGS_PATH)) {
            const settings = JSON.parse(readFileSync(SEO_SETTINGS_PATH, 'utf-8'));
            storedKey = settings?.indexNow?.apiKey || '';
        }
    } catch {
        // ignore
    }

    // Only serve the file if the requested key matches the stored key
    if (!storedKey || requestedKey !== storedKey) {
        return new Response('Not found', { status: 404 });
    }

    return new Response(storedKey, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
