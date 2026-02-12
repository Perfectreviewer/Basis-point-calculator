// Blog API — Delete a post
import type { APIRoute } from 'astro';
import { deleteBlogFile, ensureDataDir } from '@admin/utils/storage';
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
    if (!user || !hasPermission(user.role as Role, 'blog:delete')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    ensureDataDir();
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
        return new Response(JSON.stringify({ error: 'Filename is required' }), { status: 400 });
    }

    const deleted = deleteBlogFile(filename);
    if (!deleted) {
        return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
