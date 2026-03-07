import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { key, urls, host } = body;

        if (!key || !urls || !Array.isArray(urls) || urls.length === 0) {
            return new Response(JSON.stringify({ error: 'API key and at least one URL are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // IndexNow supports batch submission up to 10,000 URLs
        const payload = {
            host: host || new URL(urls[0]).hostname,
            key,
            keyLocation: `https://${host || new URL(urls[0]).hostname}/${key}.txt`,
            urlList: urls.slice(0, 10000),
        };

        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
        });

        // IndexNow returns various status codes:
        // 200 = OK, 202 = Accepted (key valid, URLs accepted for processing)
        // 400 = Bad request, 403 = Forbidden (invalid key), 422 = Unprocessable, 429 = Too many requests
        const statusCode = response.status;
        let message = '';

        switch (statusCode) {
            case 200:
                message = `Success — ${urls.length} URL(s) submitted and accepted`;
                break;
            case 202:
                message = `Accepted — ${urls.length} URL(s) submitted, will be processed`;
                break;
            case 400:
                message = 'Bad request — check URL format';
                break;
            case 403:
                message = 'Forbidden — invalid API key';
                break;
            case 422:
                message = 'Unprocessable — URLs do not belong to the host';
                break;
            case 429:
                message = 'Too many requests — please wait before trying again';
                break;
            default:
                message = `Unexpected response (${statusCode})`;
        }

        return new Response(JSON.stringify({
            success: statusCode === 200 || statusCode === 202,
            statusCode,
            message,
            urlCount: urls.length,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('IndexNow API error:', error);
        return new Response(JSON.stringify({ error: 'Failed to submit to IndexNow' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
