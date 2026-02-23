// Users API — Delete a user
import type { APIRoute } from 'astro';
import { readJSON, writeJSON, ensureDataDir, getDataDir } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const sessionUser = await validateSessionToken(session);
    if (!sessionUser || !hasPermission(sessionUser.role as Role, 'users:delete')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    ensureDataDir();
    const body = await request.json();
    const { id } = body;

    if (!id) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    if (id === sessionUser.userId) {
        return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), { status: 400 });
    }

    const usersFile = join(getDataDir(), 'users.json');
    const users = readJSON<any[]>(usersFile);

    const filtered = users.filter((u: any) => u.id !== id);
    if (filtered.length === users.length) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const remainingAdmins = filtered.filter((u: any) => u.role === 'admin');
    if (remainingAdmins.length === 0) {
        return new Response(JSON.stringify({ error: 'Cannot delete the last admin' }), { status: 400 });
    }

    writeJSON(usersFile, filtered);

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
