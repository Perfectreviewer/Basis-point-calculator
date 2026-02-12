// Content Pages API — Save/update a page
import type { APIRoute } from 'astro';
import { writePageFile, ensureDataDir } from '@admin/utils/storage';
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

    ensureDataDir();
    const body = await request.json();
    const {
        slug, title, content, template, status, visibility,
        parentPage, menuOrder, metaTitle, metaDescription, metaKeywords,
        featuredImage, customCss, customJs, date,
    } = body;

    if (!slug || !title) {
        return new Response(JSON.stringify({ error: 'Slug and title are required' }), { status: 400 });
    }

    const safeSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    const pageData = {
        slug: safeSlug,
        title,
        content: content || '',
        template: template || 'default',
        status: status || 'published',
        visibility: visibility || 'public',
        parentPage: parentPage || '',
        menuOrder: parseInt(menuOrder) || 0,
        metaTitle: metaTitle || '',
        metaDescription: metaDescription || '',
        metaKeywords: metaKeywords || '',
        featuredImage: featuredImage || '',
        customCss: customCss || '',
        customJs: customJs || '',
        date: date || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
    };

    const filename = `${safeSlug}.json`;
    writePageFile(filename, pageData);

    return new Response(JSON.stringify({ success: true, filename, slug: safeSlug }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
