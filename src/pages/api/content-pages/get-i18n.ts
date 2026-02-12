// i18n Read API — Get translation data for the content editor
import type { APIRoute } from 'astro';
import { readI18nFile } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie') || '');
    if (!session || !validateSessionToken(session.token)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    if (!hasPermission(session.role as Role, 'pages')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const url = new URL(request.url);
    const file = url.searchParams.get('file');

    const allowedFiles = ['index.json', 'faqs.json'];
    if (!file || !allowedFiles.includes(file)) {
        return new Response(JSON.stringify({ error: 'Invalid file parameter' }), { status: 400 });
    }

    try {
        const data = readI18nFile(file);
        if (!data) {
            return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
        }
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to read' }), { status: 500 });
    }
};
