import type { APIRoute } from 'astro';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Safe environment check for Vercel
const IS_VERCEL = !!(
    (typeof process !== 'undefined' && process.env?.VERCEL) ||
    (import.meta && import.meta.env && import.meta.env.VERCEL)
);

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    const file = params.file;
    if (!file) {
        return new Response('Not found', { status: 404 });
    }

    if (IS_VERCEL) {
        // We are on Vercel.
        // If the request reached here, it means the static file doesn't exist YET
        // (because Vercel hasn't finished building from GitHub).
        // Let's proxy it from the GitHub API directly using the RAW accept header!

        let repo = process.env.GITHUB_REPO || 'Perfectreviewer/Basis-point-calculator';
        if (repo && !repo.includes('/')) repo = 'Perfectreviewer/Basis-point-calculator';
        
        const token = process.env.GITHUB_TOKEN;
        const branch = process.env.GITHUB_BRANCH || 'main';

        if (!token) {
            return new Response('Server configuration missing: GITHUB_TOKEN', { status: 500 });
        }

        try {
            const apiBase = `https://api.github.com/repos/${repo}/contents/public/uploads/${file}?ref=${branch}`;
            const getRes = await fetch(apiBase, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3.raw',
                    'User-Agent': 'Astro-Proxy'
                }
            });

            if (getRes.ok) {
                // Return the raw image blob
                const buffer = await getRes.arrayBuffer();
                let contentType = 'image/jpeg';
                const lowerFileName = file.toLowerCase();
                if (lowerFileName.endsWith('.png')) contentType = 'image/png';
                if (lowerFileName.endsWith('.webp')) contentType = 'image/webp';
                if (lowerFileName.endsWith('.gif')) contentType = 'image/gif';
                if (lowerFileName.endsWith('.svg')) contentType = 'image/svg+xml';
                if (lowerFileName.endsWith('.avif')) contentType = 'image/avif';

                return new Response(buffer, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        // Cache briefly on the CDN; we only expect this route to be hit
                        // for the 1-2 minutes immediately after upload before Vercel finishes the build.
                        'Cache-Control': 'public, max-age=60, s-maxage=60', 
                    }
                });
            } else {
                return new Response('Image not found on GitHub API', { status: 404 });
            }
        } catch (e) {
            console.error('GitHub proxy error:', e);
            return new Response('Error proxying image', { status: 500 });
        }
    } else {
        // Local dev fallback. Usually locally Vite serves public/uploads directly.
        // But if it reaches here, we try to read from disk as a fallback.
        const cwd = process.cwd();
        const path = join(cwd, 'public', 'uploads', file);
        if (existsSync(path)) {
            const { readFileSync } = await import('node:fs');
            const data = readFileSync(path);
            let contentType = 'image/jpeg';
            const lowerFileName = file.toLowerCase();
            if (lowerFileName.endsWith('.png')) contentType = 'image/png';
            if (lowerFileName.endsWith('.webp')) contentType = 'image/webp';
            if (lowerFileName.endsWith('.gif')) contentType = 'image/gif';
            if (lowerFileName.endsWith('.svg')) contentType = 'image/svg+xml';
            return new Response(data, {
                status: 200,
                headers: { 'Content-Type': contentType }
            });
        }
        return new Response('Not found locally', { status: 404 });
    }
};
