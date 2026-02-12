// Login API endpoint
import type { APIRoute } from 'astro';
import { readJSON, ensureDataDir, writeJSON, getDataDir } from '@admin/utils/storage';
import { hashPassword, verifyPassword, createSessionToken, getSessionCookieName, getSessionMaxAge } from '@admin/utils/auth';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    ensureDataDir();

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Username and password are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const usersFile = join(getDataDir(), 'users.json');
    const users = readJSON<any[]>(usersFile);

    const user = users.find((u: any) => u.username === username);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // If no password hash set (first run), set it now with default "admin123"
    if (!user.passwordHash) {
        if (password === 'admin123') {
            user.passwordHash = await hashPassword(password);
            writeJSON(usersFile, users);
        } else {
            return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } else {
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    const token = await createSessionToken(user.id, user.username, user.role);

    return new Response(JSON.stringify({ success: true, user: { id: user.id, username: user.username, role: user.role } }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `${getSessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${getSessionMaxAge()}`,
        },
    });
};
