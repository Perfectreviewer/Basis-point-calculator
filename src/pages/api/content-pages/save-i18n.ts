// i18n Save API — Edit translation strings and FAQs
import type { APIRoute } from 'astro';
import { readI18nFile, writeI18nFile } from '@admin/utils/storage';
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
    const { file, locale, data } = body;

    // Validate inputs
    if (!file || !locale || !data) {
        return new Response(JSON.stringify({ error: 'file, locale, and data are required' }), { status: 400 });
    }

    // Only allow editing known i18n files
    const allowedFiles = ['index.json', 'faqs.json'];
    if (!allowedFiles.includes(file)) {
        return new Response(JSON.stringify({ error: 'Invalid file name' }), { status: 400 });
    }

    try {
        const existing = readI18nFile(file);
        if (!existing) {
            return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
        }

        if (file === 'faqs.json') {
            // For FAQs: data should be an array of { question, answer }
            if (!existing[locale]) {
                existing[locale] = { faqs: [] };
            }
            existing[locale].faqs = data;
        } else {
            // For index.json: data should be an object of key-value pairs
            if (!existing[locale]) {
                existing[locale] = {};
            }
            // Merge the updated fields into existing locale
            Object.assign(existing[locale], data);
        }

        writeI18nFile(file, existing);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to save' }), { status: 500 });
    }
};
