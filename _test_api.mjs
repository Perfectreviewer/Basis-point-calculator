// Test the save API endpoint
setTimeout(async () => {
    try {
        const r = await fetch('https://www.basispointcalculator.com/api/admin/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ header: [{ name: 'Home', url: '/' }], footer: [{ name: 'Home', url: '/' }] })
        });
        const t = await r.text();
        console.log(`Status: ${r.status}`);
        console.log(`Response: ${t}`);
    } catch (e) {
        console.log('ERR:', e.message);
    }
}, 60000); // wait 60s for redeploy

console.log('Waiting 60s for Vercel redeploy...');
