// Storage utility — JSON file I/O helpers for the admin panel
// Works with both local filesystem and Vercel serverless

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IS_VERCEL = !!process.env.VERCEL;

// On Vercel, only /tmp is writable. Use it for all mutable data.
const BUNDLED_DATA_DIR = join(__dirname, '..', 'data');
const DATA_DIR = IS_VERCEL ? '/tmp/admin-data' : BUNDLED_DATA_DIR;
const BLOG_DIR = IS_VERCEL ? '/tmp/admin-blog' : join(__dirname, '..', '..', 'src', 'blog');
const PAGES_DIR = IS_VERCEL ? '/tmp/admin-data/pages' : join(BUNDLED_DATA_DIR, 'pages');
const SITE_PAGES_DIR = join(__dirname, '..', '..', 'src', 'pages', '[...lang]');
const SEO_CONFIG_PATH = join(__dirname, '..', '..', 'src', 'config', 'page-seo.json');
const I18N_DIR = join(__dirname, '..', '..', 'src', 'i18n');

export function ensureDir(dir: string) {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

export function ensureDataDir() {
    ensureDir(DATA_DIR);
    ensureDir(BLOG_DIR);
    ensureDir(PAGES_DIR);

    // Create default users.json if missing
    const usersFile = join(DATA_DIR, 'users.json');
    if (!existsSync(usersFile)) {
        // On Vercel, try to copy from bundled data first
        const bundledUsersFile = join(BUNDLED_DATA_DIR, 'users.json');
        if (IS_VERCEL && existsSync(bundledUsersFile)) {
            copyFileSync(bundledUsersFile, usersFile);
        } else {
            // Default admin: admin / admin123 (should be changed on first login)
            const defaultUsers = [
                {
                    id: '1',
                    username: 'admin',
                    email: 'admin@example.com',
                    // This is a placeholder — actual hash is set on first startup via initDefaultAdmin()
                    passwordHash: '',
                    role: 'admin' as const,
                    createdAt: new Date().toISOString(),
                },
            ];
            writeJSON(usersFile, defaultUsers);
        }
    }

    // Create default page-seo.json if missing
    const seoFile = join(DATA_DIR, 'page-seo.json');
    if (!existsSync(seoFile)) {
        // On Vercel, try to copy from bundled data first
        const bundledSeoFile = join(BUNDLED_DATA_DIR, 'page-seo.json');
        if (IS_VERCEL && existsSync(bundledSeoFile)) {
            copyFileSync(bundledSeoFile, seoFile);
        } else {
            writeJSON(seoFile, {});
        }
    }
}

export function readJSON<T = any>(filename: string): T {
    const filepath = filename.includes('/') || filename.includes('\\')
        ? filename
        : join(DATA_DIR, filename);

    if (!existsSync(filepath)) {
        return (Array.isArray(filename) ? [] : {}) as T;
    }

    const content = readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
}

export function writeJSON(filename: string, data: any): void {
    const filepath = filename.includes('/') || filename.includes('\\')
        ? filename
        : join(DATA_DIR, filename);

    ensureDir(dirname(filepath));
    writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// Blog-specific helpers
export function getBlogDir(): string {
    return BLOG_DIR;
}

export function getDataDir(): string {
    return DATA_DIR;
}

export function getSeoConfigPath(): string {
    return SEO_CONFIG_PATH;
}

export function listBlogFiles(): string[] {
    ensureDir(BLOG_DIR);
    const files: string[] = readdirSync(BLOG_DIR);
    return files.filter((f: string) => f.endsWith('.md') || f.endsWith('.mdx'));
}

export function readBlogFile(filename: string): string {
    const filepath = join(BLOG_DIR, filename);
    if (!existsSync(filepath)) return '';
    return readFileSync(filepath, 'utf-8');
}

export function writeBlogFile(filename: string, content: string): void {
    const filepath = join(BLOG_DIR, filename);
    ensureDir(dirname(filepath));
    writeFileSync(filepath, content, 'utf-8');
}

export function deleteBlogFile(filename: string): boolean {
    const filepath = join(BLOG_DIR, filename);
    if (!existsSync(filepath)) return false;
    unlinkSync(filepath);
    return true;
}

// Content Pages helpers
export function getPagesDir(): string {
    return PAGES_DIR;
}

export function listPageFiles(): string[] {
    ensureDir(PAGES_DIR);
    const files: string[] = readdirSync(PAGES_DIR);
    return files.filter((f: string) => f.endsWith('.json'));
}

export function readPageFile(filename: string): any {
    const filepath = join(PAGES_DIR, filename);
    if (!existsSync(filepath)) return null;
    return JSON.parse(readFileSync(filepath, 'utf-8'));
}

export function writePageFile(filename: string, data: any): void {
    const filepath = join(PAGES_DIR, filename);
    ensureDir(dirname(filepath));
    writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

export function deletePageFile(filename: string): boolean {
    const filepath = join(PAGES_DIR, filename);
    if (!existsSync(filepath)) return false;
    unlinkSync(filepath);
    return true;
}

// Site Pages helpers (existing .astro pages in src/pages/[...lang]/)
export function getSitePagesDir(): string {
    return SITE_PAGES_DIR;
}

export function listSitePages(dir?: string, prefix?: string): { relativePath: string; fullPath: string }[] {
    const baseDir = dir || SITE_PAGES_DIR;
    const currentPrefix = prefix || '';
    const results: { relativePath: string; fullPath: string }[] = [];

    if (!existsSync(baseDir)) return results;

    const entries = readdirSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(baseDir, entry.name);
        const relPath = currentPrefix ? `${currentPrefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            results.push(...listSitePages(fullPath, relPath));
        } else if (entry.name.endsWith('.astro')) {
            results.push({ relativePath: relPath, fullPath });
        }
    }
    return results;
}

export function readSitePageContent(relativePath: string): string {
    const filepath = join(SITE_PAGES_DIR, relativePath);
    if (!existsSync(filepath)) return '';
    return readFileSync(filepath, 'utf-8');
}

export function writeSitePageContent(relativePath: string, content: string): void {
    const filepath = join(SITE_PAGES_DIR, relativePath);
    ensureDir(dirname(filepath));
    writeFileSync(filepath, content, 'utf-8');
}

// ─── i18n helpers ───────────────────────────────────────
export function getI18nDir(): string {
    return I18N_DIR;
}

export function readI18nFile(filename: string): any {
    const filepath = join(I18N_DIR, filename);
    if (!existsSync(filepath)) return null;
    return JSON.parse(readFileSync(filepath, 'utf-8'));
}

export function writeI18nFile(filename: string, data: any): void {
    const filepath = join(I18N_DIR, filename);
    ensureDir(dirname(filepath));
    writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}
