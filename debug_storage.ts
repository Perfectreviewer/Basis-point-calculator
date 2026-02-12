
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simulate the logic in admin-panel/utils/storage.ts
// The script is in root, storage.ts is in admin-panel/utils/
// So relative to root, storage.ts path logic:
// const __dirname = .../admin-panel/utils
// join(__dirname, '..', '..', 'src', 'pages', '[...lang]')

// Here __dirname is root.
// So equivalent path from root is:
const STORAGE_DIR_SIMULATED = join(__dirname, 'admin-panel', 'utils');

const SITE_PAGES_DIR = join(STORAGE_DIR_SIMULATED, '..', '..', 'src', 'pages', '[...lang]');

console.log('Simulated SITE_PAGES_DIR:', SITE_PAGES_DIR);

if (existsSync(SITE_PAGES_DIR)) {
    console.log('Directory exists.');
    const entries = readdirSync(SITE_PAGES_DIR);
    console.log('Entries:', entries);
} else {
    console.log('Directory does NOT exist.');
}
