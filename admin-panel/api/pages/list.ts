// Pages SEO API — List page SEO settings
import type { APIRoute } from 'astro';
import { readJSON, ensureDataDir, getSeoConfigPath } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const user = await validateSessionToken(session);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    ensureDataDir();
    const seoFile = getSeoConfigPath();
    const seoData = readJSON(seoFile);

    return new Response(JSON.stringify(seoData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
