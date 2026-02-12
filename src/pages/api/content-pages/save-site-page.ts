// Site Page Save API — Edit existing .astro page content
import type { APIRoute } from 'astro';
import { writeSitePageContent } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const user = await validateSessionToken(session);
    if (!user || !hasPermission(user.role as Role, 'pages:write')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await request.json();
    const { relativePath, content } = body;

    if (!relativePath || typeof content !== 'string') {
        return new Response(JSON.stringify({ error: 'relativePath and content are required' }), { status: 400 });
    }

    // Security: prevent path traversal
    if (relativePath.includes('..') || relativePath.startsWith('/')) {
        return new Response(JSON.stringify({ error: 'Invalid file path' }), { status: 400 });
    }

    try {
        writeSitePageContent(relativePath, content);
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to save' }), { status: 500 });
    }
};
