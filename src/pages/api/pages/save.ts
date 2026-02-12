// Pages SEO API — Save page SEO settings
import type { APIRoute } from 'astro';
import { readJSON, writeJSON, ensureDataDir, getSeoConfigPath } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const user = await validateSessionToken(session);
    if (!user || !hasPermission(user.role as Role, 'pages:write')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    ensureDataDir();
    const body = await request.json();
    const { path, title, description, keywords, schema } = body;

    if (!path) {
        return new Response(JSON.stringify({ error: 'Page path is required' }), { status: 400 });
    }

    const seoFile = getSeoConfigPath();
    const seoData = readJSON<Record<string, any>>(seoFile);

    seoData[path] = {
        title: title || '',
        description: description || '',
        keywords: keywords || '',
        schema: schema || null,
        updatedAt: new Date().toISOString(),
    };

    writeJSON(seoFile, seoData);

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
