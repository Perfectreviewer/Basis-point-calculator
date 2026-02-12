import type { APIRoute } from 'astro';
import { readJSON, writeJSON, ensureDataDir } from '@admin/utils/storage';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
// Initial Navigation JSON path - this is where the source of truth is
const NAV_CONFIG_PATH = join(__dirname, '../../../../src/config/navigation.json');

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const navData = readJSON(NAV_CONFIG_PATH);
        return new Response(JSON.stringify(navData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error reading navigation config:', error);
        return new Response(JSON.stringify({ error: 'Failed to load navigation data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.header || !Array.isArray(body.header) || !body.footer || !Array.isArray(body.footer)) {
            return new Response(JSON.stringify({ error: 'Invalid menu data structure' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Write directly to the config file
        // Note: In a real production environment with Vercel, writing to source files at runtime 
        // won't persist between deployments. But for this specific requirement (admin panel managing local file), 
        // or if using an external store (which we aren't yet), this is the way. 
        // Given the constraints and previous patterns, we are writing to the file system.
        // The storage utility 'writeJSON' writes to DATA_DIR (tmp on vercel), 
        // but here we likely want to update the actual config file that drives the site.
        // However, 'readJSON' in storage.ts checks DATA_DIR. 
        // Let's use standard fs promises to write to the specific path we want to update.

        // Wait, 'readJSON' from storage.ts uses DATA_DIR by default but allows absolute paths.
        // Let's stick to the pattern used in 'menu.ts' to ensure we update the correct file.
        // Actually, looking at 'storage.ts', 'writeJSON' handles absolute paths too.

        writeJSON(NAV_CONFIG_PATH, body);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error saving navigation config:', error);
        return new Response(JSON.stringify({ error: 'Failed to save navigation data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
