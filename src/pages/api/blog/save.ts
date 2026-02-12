// Blog API — Save/update a post (WordPress-like fields)
import type { APIRoute } from 'astro';
import { writeBlogFile, ensureDataDir } from '@admin/utils/storage';
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
    if (!user || !hasPermission(user.role as Role, 'blog:write')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    ensureDataDir();
    const body = await request.json();
    const {
        slug, title, description, date, author, category, image,
        status, visibility, tags, excerpt, content
    } = body;

    if (!slug || !title) {
        return new Response(JSON.stringify({ error: 'Slug and title are required' }), { status: 400 });
    }

    const safeSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // Build frontmatter with all WordPress-like fields
    const fmLines = [
        '---',
        `title: "${title.replace(/"/g, '\\"')}"`,
        `description: "${(description || '').replace(/"/g, '\\"')}"`,
        `date: ${date || new Date().toISOString().split('T')[0]}`,
        `author: "${(author || 'Admin').replace(/"/g, '\\"')}"`,
        `category: "${(category || 'General').replace(/"/g, '\\"')}"`,
    ];

    // Optional fields — only include when set
    if (image) fmLines.push(`image: "${image.replace(/"/g, '\\"')}"`);
    if (status) fmLines.push(`status: "${status}"`);
    if (visibility) fmLines.push(`visibility: "${visibility}"`);
    if (tags) fmLines.push(`tags: "${tags.replace(/"/g, '\\"')}"`);
    if (excerpt) fmLines.push(`excerpt: "${excerpt.replace(/"/g, '\\"')}"`);

    fmLines.push('---', '');

    const frontmatter = fmLines.join('\n');
    const fullContent = frontmatter + (content || '');
    const filename = `${safeSlug}.md`;

    writeBlogFile(filename, fullContent);

    return new Response(JSON.stringify({ success: true, filename, slug: safeSlug }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
