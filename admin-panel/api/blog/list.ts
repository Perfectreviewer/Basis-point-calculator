// Blog API — List all posts
import type { APIRoute } from 'astro';
import { listBlogFiles, readBlogFile, ensureDataDir } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';

export const prerender = false;

function parseFrontmatter(content: string) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: content };

    const frontmatterStr = match[1];
    const body = match[2];
    const frontmatter: Record<string, string> = {};

    for (const line of frontmatterStr.split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
            const key = line.substring(0, colonIdx).trim();
            let value = line.substring(colonIdx + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            frontmatter[key] = value;
        }
    }

    return { frontmatter, body };
}

export const GET: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const user = await validateSessionToken(session);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    ensureDataDir();
    const files = listBlogFiles();

    const posts = files.map((filename) => {
        const content = readBlogFile(filename);
        const { frontmatter, body } = parseFrontmatter(content);
        return {
            filename,
            slug: filename.replace(/\.(md|mdx)$/, ''),
            title: frontmatter.title || 'Untitled',
            description: frontmatter.description || '',
            date: frontmatter.date || '',
            author: frontmatter.author || '',
            category: frontmatter.category || '',
            image: frontmatter.image || '',
            bodyLength: body.length,
        };
    });

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return new Response(JSON.stringify(posts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
