
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

const CWD_PAGES_DIR = join(process.cwd(), 'src', 'pages', '[...lang]');
console.log('CWD_PAGES_DIR:', CWD_PAGES_DIR);

if (existsSync(CWD_PAGES_DIR)) {
    console.log('CWD Directory exists.');
} else {
    console.log('CWD Directory does NOT exist.');
}
