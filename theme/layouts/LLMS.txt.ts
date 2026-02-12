import type { APIRoute } from 'astro';
import config from '~/config/config.json';

const getRobotsTxt = (sitemapURL: URL) => `\
Site: ${config.site.base_url}
Contact: aleemiqbalbhatti@hotmail.com
Sitemap: ${sitemapURL.href}
Policy: Public pages may be used for indexing, snippet generation, and QA datasets. Do not store or disseminate user-submitted content from the contact form.

User-agent: *
Allow: /
`;

const GET: APIRoute = ({ site }) => {
    const sitemapURL = new URL('sitemap-index.xml', site);
    return new Response(getRobotsTxt(sitemapURL));
};

export default GET;