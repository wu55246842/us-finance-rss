
const url = 'https://www.marketwatch.com/rss/economy-politics';

async function testFetch(name: string, headers: Record<string, string>) {
    console.log(`--- Testing: ${name} ---`);
    try {
        const response = await fetch(url, { headers });
        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            console.log('SUCCESS!');
        } else {
            console.log('FAILED');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    console.log('\n');
}

async function run() {
    // 1. No User-Agent (Node default)
    await testFetch('No User-Agent', {});

    // 2. Standard Chrome
    await testFetch('Chrome Windows', {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    });

    // 3. Postman
    await testFetch('Postman', {
        'User-Agent': 'PostmanRuntime/7.37.0',
        'Accept': '*/*'
    });

    // 4. Curl
    await testFetch('Curl', {
        'User-Agent': 'curl/7.64.1',
        'Accept': '*/*'
    });

    // 5. Chrome with Referer
    await testFetch('Chrome + Referer', {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
    });

    // 6. Googlebot
    await testFetch('Googlebot', {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    });
}

run();
