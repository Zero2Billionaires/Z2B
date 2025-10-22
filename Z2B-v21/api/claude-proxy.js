/**
 * Claude API Proxy Server (Node.js)
 * Alternative to PHP proxy - no PHP installation needed
 * Run with: node api/claude-proxy.js
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

// Handle CORS
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

// Proxy request to Claude API
function proxyToClaudeAPI(requestData, callback) {
    const postData = JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
            role: 'user',
            content: requestData.systemPrompt + '\n\nUser: ' + requestData.userMessage
        }]
    });

    const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': requestData.apiKey,
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
            callback(null, res.statusCode, data);
        });
    });

    req.on('error', (error) => {
        callback(error);
    });

    req.write(postData);
    req.end();
}

// Create server
const server = http.createServer((req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} request from ${req.headers.origin || 'unknown'}`);

    setCorsHeaders(res);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        console.log('  → Preflight request handled');
        res.writeHead(200);
        res.end();
        return;
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
        return;
    }

    // Parse request body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const requestData = JSON.parse(body);

            if (!requestData.apiKey || !requestData.userMessage) {
                console.log('  ❌ Missing required fields');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Missing required fields: apiKey and userMessage'
                }));
                return;
            }

            console.log('  → Forwarding to Claude API...');

            // Proxy to Claude API
            proxyToClaudeAPI(requestData, (error, statusCode, data) => {
                if (error) {
                    console.log('  ❌ Error:', error.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Connection error: ' + error.message
                    }));
                    return;
                }

                console.log('  ✅ Success! Status:', statusCode);
                res.writeHead(statusCode, { 'Content-Type': 'application/json' });
                res.end(data);
            });

        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON input' }));
        }
    });
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('  CLAUDE API PROXY SERVER (Node.js)');
    console.log('========================================');
    console.log(`\nServer running on: http://localhost:${PORT}`);
    console.log('\nThis proxy handles Coach Manlaw AI requests');
    console.log('and prevents CORS issues.\n');
    console.log('Press Ctrl+C to stop the server');
    console.log('========================================\n');
});
