// Save text content edits for .astro site pages
import type { APIRoute } from 'astro';
import { readSitePageContent, writeSitePageContent } from '@admin/utils/storage';
import { updateTextContent } from '@admin/utils/text-extractor';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie') || '');
    if (!session || !validateSessionToken(session.token)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    if (!hasPermission(session.role as Role, 'pages')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await request.json();
    const { relativePath, updates } = body;

    if (!relativePath || !updates) {
        return new Response(JSON.stringify({ error: 'relativePath and updates are required' }), { status: 400 });
    }

    // Security: prevent path traversal
    if (relativePath.includes('..') || relativePath.includes('\\')) {
        return new Response(JSON.stringify({ error: 'Invalid path' }), { status: 400 });
    }

    try {
        const content = readSitePageContent(relativePath);
        if (!content) {
            return new Response(JSON.stringify({ error: 'Page not found' }), { status: 404 });
        }

        const updated = updateTextContent(content, updates);
        writeSitePageContent(relativePath, updated);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to save' }), { status: 500 });
    }
};
