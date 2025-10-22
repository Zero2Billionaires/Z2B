/**
 * Test Claude API Key - Direct Command Line Test
 * Run with: node test-api-key.js
 */

const https = require('https');

// Your API key
const API_KEY = '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';

console.log('========================================');
console.log('  TESTING CLAUDE API KEY');
console.log('========================================\n');
console.log('API Key:', API_KEY.substring(0, 20) + '...');
console.log('Model: claude-sonnet-4-20250514');
console.log('\nSending test message to Claude...\n');

const postData = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{
        role: 'user',
        content: 'Say "Hello! Your API key is working perfectly!" in an enthusiastic way.'
    }]
});

const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('========================================\n');

        if (res.statusCode === 200) {
            try {
                const response = JSON.parse(data);
                console.log('✅ SUCCESS! Your API key is VALID!\n');
                console.log('Claude\'s Response:');
                console.log('-----------------------------------');
                console.log(response.content[0].text);
                console.log('-----------------------------------\n');
                console.log('✅ Your API key works perfectly!');
                console.log('✅ Coach Manlaw should work now!\n');
            } catch (e) {
                console.log('Response:', data);
            }
        } else {
            console.log('❌ ERROR! API key test failed.\n');
            console.log('Error Details:');
            console.log(data);
            console.log('\n💡 This means:');
            if (res.statusCode === 401) {
                console.log('- Your API key is INVALID or EXPIRED');
                console.log('- Get a new key from: https://console.anthropic.com/settings/keys');
            } else if (res.statusCode === 429) {
                console.log('- You\'ve hit rate limits');
                console.log('- Wait a moment and try again');
            } else {
                console.log('- Status code:', res.statusCode);
                console.log('- Check the error details above');
            }
        }
        console.log('\n========================================');
    });
});

req.on('error', (error) => {
    console.log('❌ CONNECTION ERROR!\n');
    console.log('Error:', error.message);
    console.log('\n💡 This could mean:');
    console.log('- No internet connection');
    console.log('- Firewall blocking the request');
    console.log('- Network issues');
    console.log('\n========================================');
});

req.write(postData);
req.end();
