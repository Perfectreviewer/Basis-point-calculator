// Users API — Create or update a user
import type { APIRoute } from 'astro';
import { readJSON, writeJSON, ensureDataDir, getDataDir } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken, hashPassword } from '@admin/utils/auth';
import { hasPermission, ALL_ROLES } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const sessionUser = await validateSessionToken(session);
    if (!sessionUser || !hasPermission(sessionUser.role as Role, 'users:write')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    ensureDataDir();
    const body = await request.json();
    const { id, username, email, password, role } = body;

    if (!username || !role) {
        return new Response(JSON.stringify({ error: 'Username and role are required' }), { status: 400 });
    }

    if (!ALL_ROLES.includes(role)) {
        return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
    }

    const usersFile = join(getDataDir(), 'users.json');
    const users = readJSON<any[]>(usersFile);

    if (id) {
        const idx = users.findIndex((u: any) => u.id === id);
        if (idx === -1) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }
        users[idx].username = username;
        users[idx].email = email || users[idx].email;
        users[idx].role = role;
        if (password) {
            users[idx].passwordHash = await hashPassword(password);
        }
    } else {
        const exists = users.find((u: any) => u.username === username);
        if (exists) {
            return new Response(JSON.stringify({ error: 'Username already exists' }), { status: 409 });
        }
        if (!password) {
            return new Response(JSON.stringify({ error: 'Password is required for new users' }), { status: 400 });
        }
        const newUser = {
            id: String(Date.now()),
            username,
            email: email || '',
            passwordHash: await hashPassword(password),
            role,
            createdAt: new Date().toISOString(),
        };
        users.push(newUser);
    }

    writeJSON(usersFile, users);

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
