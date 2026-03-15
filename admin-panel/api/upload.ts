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
            if (!result.success || !result.url) {
                return new Response(JSON.stringify({ error: result.error || 'Failed to upload to GitHub' }), { status: 500 });
            }
            // Use the raw GitHub content URL so images display instantly without waiting for a redeploy
            url = result.url;
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

    let files: any[] = [];

    try {
        if (IS_VERCEL) {
            // Define a local helper to get GitHub config cleanly
            const getGitHubConfigLocal = () => {
                let repo = process.env.GITHUB_REPO || 'Perfectreviewer/Basis-point-calculator';
                if (repo && !repo.includes('/')) repo = 'Perfectreviewer/Basis-point-calculator';
                return {
                    token: process.env.GITHUB_TOKEN || '',
                    repo: repo,
                    branch: process.env.GITHUB_BRANCH || 'main',
                };
            };

            const { token, repo, branch } = getGitHubConfigLocal();
            if (token && repo) {
                const apiBase = `https://api.github.com/repos/${repo}/contents/public/uploads?ref=${branch}`;
                const getRes = await fetch(apiBase, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                    }
                });

                if (getRes.ok) {
                    const data = await getRes.json();
                    if (Array.isArray(data)) {
                        files = data
                            .filter((item: any) => item.type === 'file' && !item.name.startsWith('.'))
                            .map((item: any) => ({
                                filename: item.name,
                                url: `https://raw.githubusercontent.com/${repo}/${branch}/public/uploads/${item.name}`,
                                size: item.size,
                                // GitHub Contents API doesn't return modified date natively, 
                                // but we use the filename timestamp as a fallback sort
                                modified: new Date().toISOString(), 
                            }))
                            .sort((a: any, b: any) => b.filename.localeCompare(a.filename)); // Sort by filename (which includes timestamp)
                    }
                } else {
                    console.error("Failed to fetch uploads from GitHub:", await getRes.text());
                }
            }
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
    const { filename } = body;
    if (!filename) return new Response(JSON.stringify({ error: 'No filename' }), { status: 400 });

    const uploadDir = getUploadDir();
    const filepath = join(uploadDir, filename);

    // Security: prevent path traversal locally
    if (!filepath.startsWith(uploadDir)) {
        return new Response(JSON.stringify({ error: 'Invalid filename' }), { status: 400 });
    }

    try {
        if (IS_VERCEL) {
            // Delete from GitHub
            const getGitHubConfigLocal = () => {
                let repo = process.env.GITHUB_REPO || 'Perfectreviewer/Basis-point-calculator';
                if (repo && !repo.includes('/')) repo = 'Perfectreviewer/Basis-point-calculator';
                return {
                    token: process.env.GITHUB_TOKEN || '',
                    repo: repo,
                    branch: process.env.GITHUB_BRANCH || 'main',
                };
            };

            const { token, repo, branch } = getGitHubConfigLocal();
            if (token && repo) {
                const apiBase = `https://api.github.com/repos/${repo}/contents/public/uploads/${filename}`;
                
                // 1. Get the file's SHA (required to delete via GitHub API)
                const getRes = await fetch(`${apiBase}?ref=${branch}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                    }
                });

                if (getRes.ok) {
                    const fileData = await getRes.json();
                    const sha = fileData.sha;

                    // 2. Delete the file
                    const deleteRes = await fetch(apiBase, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/vnd.github+json',
                            'X-GitHub-Api-Version': '2022-11-28',
                        },
                        body: JSON.stringify({
                            message: `chore: delete image ${filename}`,
                            sha: sha,
                            branch: branch
                        })
                    });

                    if (!deleteRes.ok) {
                        return new Response(JSON.stringify({ error: 'Failed to delete from GitHub' }), { status: 500 });
                    }
                } else if (getRes.status === 404) {
                    return new Response(JSON.stringify({ error: 'File not found on GitHub' }), { status: 404 });
                } else {
                     return new Response(JSON.stringify({ error: 'Failed to fetch file SHA from GitHub' }), { status: 500 });
                }
            } else {
                 return new Response(JSON.stringify({ error: 'Server misconfiguration: GitHub token missing' }), { status: 500 });
            }

        } else {
            // Local delete
            if (existsSync(filepath)) {
                unlinkSync(filepath);
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Delete failed' }), { status: 500 });
    }
};
