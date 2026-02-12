
import { hashPassword } from './admin-panel/utils/auth';

async function main() {
    const hash = await hashPassword('admin123');
    console.log('HASH:' + hash);
}

main();
