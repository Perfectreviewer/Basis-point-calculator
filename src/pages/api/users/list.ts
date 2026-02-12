// Users API — List all users
import type { APIRoute } from 'astro';
import { readJSON, ensureDataDir, getDataDir } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';
import { join } from 'node:path';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const user = await validateSessionToken(session);
    if (!user || !hasPermission(user.role as Role, 'users:read')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    ensureDataDir();
    const usersFile = join(getDataDir(), 'users.json');
    const users = readJSON<any[]>(usersFile);

    const safeUsers = users.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
    }));

    return new Response(JSON.stringify(safeUsers), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
