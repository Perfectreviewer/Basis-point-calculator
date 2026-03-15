// Image Upload API — handles file uploads via Vercel Blob (on Vercel) or local disk (dev)
import type { APIRoute } from 'astro';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { hasPermission } from '@admin/utils/roles';
import type { Role } from '@admin/utils/roles';
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';

// Safe environment check for Vercel
const IS_VERCEL = !!(
    (typeof process !== 'undefined' && process.env?.VERCEL) ||
    (import.meta && import.meta.env && import.meta.env.VERCEL)
);
export const prerender = false;

// Upload directory (local dev only)
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

        let url = `/uploads/${filename}`;

        if (IS_VERCEL) {
            // Check that Vercel Blob is configured
            const token = process.env.BLOB_READ_WRITE_TOKEN;
            if (!token) {
                console.error('BLOB_READ_WRITE_TOKEN is not set. Please create a Blob Store in the Vercel Dashboard.');
                return new Response(JSON.stringify({ 
                    error: 'Blob Storage not configured. Go to Vercel Dashboard → Storage → Create Blob Store.' 
                }), { status: 500 });
            }

            // Use Vercel Blob Storage — images are served instantly from CDN
            const { put } = await import('@vercel/blob');
            const blob = await put(`uploads/${filename}`, file, {
                access: 'public',
                addRandomSuffix: false,
                token,
            });
            url = blob.url;
        } else {
            // Local dev - save directly to disk
            const buffer = Buffer.from(await file.arrayBuffer());
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
        console.error('Upload error:', err);
        return new Response(JSON.stringify({ error: `Upload failed: ${err.message}` }), { status: 500 });
    }
};

// GET — list uploaded files
export const GET: APIRoute = async ({ request }) => {
    const session = getSessionFromCookies(request.headers.get('cookie'));
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const user = await validateSessionToken(session);
    if (!user) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

    let files: any[] = [];

    try {
        if (IS_VERCEL) {
            // List all blobs from Vercel Blob Storage
            const { list } = await import('@vercel/blob');
            const { blobs } = await list({ prefix: 'uploads/' });
            files = blobs.map((blob: any) => ({
                filename: blob.pathname.replace('uploads/', ''),
                url: blob.url,
                size: blob.size,
                modified: blob.uploadedAt,
            })).sort((a: any, b: any) => b.filename.localeCompare(a.filename));
        } else {
            // Local fallback
            const uploadDir = getUploadDir();
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
    const { filename, url: blobUrl } = body;
    if (!filename && !blobUrl) return new Response(JSON.stringify({ error: 'No filename or URL' }), { status: 400 });

    try {
        if (IS_VERCEL) {
            // Delete from Vercel Blob Storage
            const { del } = await import('@vercel/blob');
            if (blobUrl) {
                // Delete by direct blob URL
                await del(blobUrl);
            } else {
                // Find the blob URL by listing and matching filename
                const { list } = await import('@vercel/blob');
                const { blobs } = await list({ prefix: `uploads/${filename}` });
                if (blobs.length > 0) {
                    await del(blobs[0].url);
                } else {
                    return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
                }
            }
        } else {
            // Local delete
            const uploadDir = getUploadDir();
            const filepath = join(uploadDir, filename);

            // Security: prevent path traversal
            if (!filepath.startsWith(uploadDir)) {
                return new Response(JSON.stringify({ error: 'Invalid filename' }), { status: 400 });
            }

            if (existsSync(filepath)) {
                unlinkSync(filepath);
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('Delete error:', err);
        return new Response(JSON.stringify({ error: err.message || 'Delete failed' }), { status: 500 });
    }
};
