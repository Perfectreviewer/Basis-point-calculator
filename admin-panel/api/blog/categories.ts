// Blog Categories API — CRUD for blog categories
import type { APIRoute } from 'astro';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const configPath = path.join(process.cwd(), 'src', 'config', 'blog-categories.json');

function readCategories() {
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {
        return [];
    }
}

function writeCategories(categories: any[]) {
    fs.writeFileSync(configPath, JSON.stringify(categories, null, 2), 'utf-8');
}

// GET — list all categories
export const GET: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const user = await validateSessionToken(session);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const categories = readCategories();
    return new Response(JSON.stringify({ categories }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

// POST — create or update a category
export const POST: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const user = await validateSessionToken(session);
    if (!user || !hasPermission(user.role as Role, 'blog:write')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await request.json();
    const { id, name, slug, description } = body;

    if (!name) {
        return new Response(JSON.stringify({ error: 'Category name is required' }), { status: 400 });
    }

    const categories = readCategories();
    const safeSlug = (slug || name)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    if (id) {
        // Update existing
        const idx = categories.findIndex((c: any) => c.id === id);
        if (idx === -1) {
            return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
        }
        categories[idx] = { ...categories[idx], name, slug: safeSlug, description: description || '' };
    } else {
        // Create new
        const newId = safeSlug + '-' + Date.now().toString(36);
        categories.push({ id: newId, name, slug: safeSlug, description: description || '' });
    }

    writeCategories(categories);
    return new Response(JSON.stringify({ success: true, categories }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

// DELETE — delete a category
export const DELETE: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const user = await validateSessionToken(session);
    if (!user || !hasPermission(user.role as Role, 'blog:write')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
        return new Response(JSON.stringify({ error: 'Category ID is required' }), { status: 400 });
    }

    let categories = readCategories();
    categories = categories.filter((c: any) => c.id !== id);
    writeCategories(categories);

    return new Response(JSON.stringify({ success: true, categories }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
