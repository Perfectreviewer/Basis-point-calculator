import type { APIRoute } from 'astro';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SEO_SETTINGS_PATH = join(process.cwd(), 'src', 'config', 'seo-settings.json');

function loadSeoSettings() {
    if (!existsSync(SEO_SETTINGS_PATH)) {
        return {
            robots: {
                userAgents: [{ name: '*', allow: ['/'], disallow: [] }],
                customDirectives: '',
                sitemapUrl: '/sitemap-index.xml',
            },
        };
    }
    return JSON.parse(readFileSync(SEO_SETTINGS_PATH, 'utf-8'));
}

const GET: APIRoute = ({ site }) => {
    const settings = loadSeoSettings();
    const robots = settings.robots || {};
    const userAgents = robots.userAgents || [{ name: '*', allow: ['/'], disallow: [] }];
    const sitemapPath = robots.sitemapUrl || '/sitemap-index.xml';
    const custom = robots.customDirectives || '';

    let output = '';

    for (const rule of userAgents) {
        output += `User-agent: ${rule.name || '*'}\n`;
        for (const a of (rule.allow || [])) {
            if (a) output += `Allow: ${a}\n`;
        }
        for (const d of (rule.disallow || [])) {
            if (d) output += `Disallow: ${d}\n`;
        }
        if (rule.crawlDelay) {
            output += `Crawl-delay: ${rule.crawlDelay}\n`;
        }
        output += '\n';
    }

    const sitemapURL = new URL(sitemapPath, site);
    output += `Sitemap: ${sitemapURL.href}\n`;

    if (custom.trim()) {
        output += '\n' + custom.trim() + '\n';
    }

    return new Response(output);
};

export default GET;