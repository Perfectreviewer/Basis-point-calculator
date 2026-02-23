// Logout API endpoint
import type { APIRoute } from 'astro';
import { getSessionCookieName } from '@admin/utils/auth';

export const prerender = false;

export const POST: APIRoute = async () => {
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `${getSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        },
    });
};
