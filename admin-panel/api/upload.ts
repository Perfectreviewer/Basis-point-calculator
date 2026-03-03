// Image Upload API — handles file uploads and saves to public/uploads/
import type { APIRoute } from 'astro';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';
import { uploadFileToGitHub } from '@admin/utils/github-commit';

// Safe environment check for Vercel
const IS_VERCEL = !!(
    (typeof process !== 'undefined' && process.env?.VERCEL) ||
    (import.meta && import.meta.env && import.meta.env.VERCEL)
);
export const prerender = false;

// Upload directory
function getUploadDir() {
    const dir = join(process.cwd(), 'public', 'uploads');
    if (!IS_VERCEL && !existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    return dir;
}

// POST — upload a file
export const POST: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const user = await validateSessionToken(session);
    if (!user || !hasPermission(user.role as Role, 'blog:write')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
        }

        // Validate file type
        const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
        const ext = extname(file.name).toLowerCase();
        if (!allowed.includes(ext)) {
            return new Response(JSON.stringify({ error: `File type ${ext} not allowed. Use: ${allowed.join(', ')}` }), { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return new Response(JSON.stringify({ error: 'File too large. Max 5MB.' }), { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const safeName = file.name
            .toLowerCase()
            .replace(/[^a-z0-9.\-_]/g, '-')
            .replace(/-+/g, '-');
        const filename = `${timestamp}-${safeName}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        let url = `/uploads/${filename}`;

        if (IS_VERCEL) {
            // Vercel is read-only, we must commit to GitHub
            const base64 = buffer.toString('base64');
            const result = await uploadFileToGitHub(`public/uploads/${filename}`, base64);
            if (!result.success) {
                return new Response(JSON.stringify({ error: result.error || 'Failed to upload to GitHub' }), { status: 500 });
            }
            // Always use the relative url so it writes correctly to the markdown frontmatter
        } else {
            // Local dev - save directly to disk
            const uploadDir = getUploadDir();
            const filepath = join(uploadDir, filename);
            writeFileSync(filepath, new Uint8Array(buffer));
        }

        return new Response(JSON.stringify({
            success: true,
            url,
            filename,
            size: file.size,
            type: file.type,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), { status: 500 });
    }
};

// GET — list uploaded files
export const GET: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const user = await validateSessionToken(session);
    if (!user) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

    const uploadDir = getUploadDir();
    let files: any[] = [];

    try {
        if (existsSync(uploadDir)) {
            files = readdirSync(uploadDir)
                .filter(f => !f.startsWith('.'))
                .map(f => {
                    const stat = statSync(join(uploadDir, f));
                    return {
                        filename: f,
                        url: `/uploads/${f}`,
                        size: stat.size,
                        modified: stat.mtime.toISOString(),
                    };
                })
                .sort((a, b) => b.modified.localeCompare(a.modified));
        }
    } catch (e) {
        console.warn('Could not read upload directory', e);
    }

    return new Response(JSON.stringify({ files }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

// DELETE — remove uploaded file
export const DELETE: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const user = await validateSessionToken(session);
    if (!user || !hasPermission(user.role as Role, 'blog:write')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const body = await request.json();
    const { filename } = body;
    if (!filename) return new Response(JSON.stringify({ error: 'No filename' }), { status: 400 });

    const uploadDir = getUploadDir();
    const filepath = join(uploadDir, filename);

    // Security: prevent path traversal
    if (!filepath.startsWith(uploadDir)) {
        return new Response(JSON.stringify({ error: 'Invalid filename' }), { status: 400 });
    }

    if (existsSync(filepath)) {
        unlinkSync(filepath);
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
