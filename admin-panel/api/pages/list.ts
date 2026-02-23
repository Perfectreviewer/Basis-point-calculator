// Pages SEO API — List page SEO settings (auto-discovers new pages)
import type { APIRoute } from 'astro';
import { readJSON, writeJSON, ensureDataDir, getSeoConfigPath, listSitePages } from '@admin/utils/storage';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const prerender = false;

/** Convert an astro file path to a URL path */
function astroPathToUrl(relativePath: string): string {
    let url = '/' + relativePath
        .replace(/\.astro$/, '')
        .replace(/\/index$/, '')
        .replace(/\\/g, '/');
    if (!url.endsWith('/')) url += '/';
    if (url === '//') url = '/';
    return url;
}

/** Generate a placeholder title from a URL path */
function generateTitle(urlPath: string): string {
    if (urlPath === '/') return 'Home';
    const parts = urlPath.replace(/^\/|\/$/g, '').split('/');
    return parts[parts.length - 1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

/** Discover all site pages and merge with existing SEO config */
function discoverAndMergePages(seoData: Record<string, any>): Record<string, any> {
    let hasNew = false;

    // 1. Discover pages from src/pages/[...lang]/
    try {
        const sitePages = listSitePages();
        for (const page of sitePages) {
            const url = astroPathToUrl(page.relativePath);
            if (!seoData[url]) {
                seoData[url] = {
                    title: generateTitle(url) + ' | BasisPoint Calculator',
                    description: '',
                    keywords: '',
                };
                hasNew = true;
            }
        }
    } catch (e) {
        console.error('Error discovering site pages:', e);
    }

    // 2. Discover top-level pages (not in [...lang])
    try {
        const topPagesDir = join(process.cwd(), 'src', 'pages');
        if (existsSync(topPagesDir)) {
            const entries = readdirSync(topPagesDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith('.astro') && !entry.name.startsWith('404')) {
                    const url = '/' + entry.name.replace(/\.astro$/, '') + '/';
                    if (!seoData[url]) {
                        seoData[url] = {
                            title: generateTitle(url) + ' | BasisPoint Calculator',
                            description: '',
                            keywords: '',
                        };
                        hasNew = true;
                    }
                }
            }
        }
    } catch (e) {
        console.error('Error discovering top-level pages:', e);
    }

    // 3. Discover blog posts from src/blog/ or src/content/blog/
    try {
        const blogDirs = [
            join(process.cwd(), 'src', 'blog'),
            join(process.cwd(), 'src', 'content', 'blog'),
        ];
        for (const blogDir of blogDirs) {
            if (existsSync(blogDir)) {
                const files = readdirSync(blogDir);
                for (const file of files) {
                    if (file.endsWith('.md') || file.endsWith('.mdx')) {
                        const slug = file.replace(/\.(md|mdx)$/, '');
                        const url = `/blog/${slug}/`;
                        if (!seoData[url]) {
                            seoData[url] = {
                                title: generateTitle(url) + ' | BasisPoint Blog',
                                description: '',
                                keywords: '',
                            };
                            hasNew = true;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error('Error discovering blog posts:', e);
    }

    // Save if new pages were found
    if (hasNew) {
        // Sort keys for readability
        const sorted: Record<string, any> = {};
        for (const key of Object.keys(seoData).sort()) {
            sorted[key] = seoData[key];
        }
        try {
            const seoFile = getSeoConfigPath();
            writeJSON(seoFile, sorted);
        } catch (e) {
            console.error('Error saving updated SEO config:', e);
        }
        return sorted;
    }

    return seoData;
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
    const seoFile = getSeoConfigPath();
    const seoData = readJSON<Record<string, any>>(seoFile);

    // Auto-discover and merge new pages
    const mergedData = discoverAndMergePages(seoData);

    return new Response(JSON.stringify(mergedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
