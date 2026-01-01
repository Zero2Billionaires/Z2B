#!/usr/bin/env node
/**
 * Quick PHP-compatible server for Z2B
 * Runs API endpoints via PHP CLI
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');

const PORT = 8000;
const ROOT_DIR = __dirname;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let filePath = path.join(ROOT_DIR, parsedUrl.pathname);

    // Handle PHP files
    if (filePath.endsWith('.php')) {
        handlePHP(req, res, filePath);
        return;
    }

    // Serve static files
    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            // Try index.html
            if (stat && stat.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            } else {
                res.writeHead(404);
                res.end('404 Not Found');
                return;
            }
        }

        const ext = path.extname(filePath);
        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }

            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        });
    });
});

function handlePHP(req, res, filePath) {
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('PHP file not found');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        // Try to find PHP
        const phpPaths = [
            'C:\\xampp\\php\\php.exe',
            'C:\\php\\php.exe',
            'C:\\wamp64\\bin\\php\\php8.2.0\\php.exe',
            'php' // Try PATH
        ];

        let phpCmd = 'php';
        for (const phpPath of phpPaths) {
            if (fs.existsSync(phpPath)) {
                phpCmd = `"${phpPath}"`;
                break;
            }
        }

        // Set environment variables for PHP
        const env = {
            ...process.env,
            REQUEST_METHOD: req.method,
            CONTENT_TYPE: req.headers['content-type'] || '',
            CONTENT_LENGTH: Buffer.byteLength(body),
            QUERY_STRING: url.parse(req.url).query || '',
            REQUEST_URI: req.url,
            SERVER_NAME: 'localhost',
            SERVER_PORT: PORT.toString(),
            HTTP_HOST: req.headers.host || 'localhost'
        };

        const phpProcess = exec(`${phpCmd} "${filePath}"`, { env }, (error, stdout, stderr) => {
            if (error) {
                console.error('PHP Error:', stderr);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'PHP execution failed',
                    message: 'PHP is not installed or not in PATH. Please install XAMPP or PHP.',
                    details: stderr
                }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(stdout);
        });

        // Send POST data to PHP
        if (body) {
            phpProcess.stdin.write(body);
        }
        phpProcess.stdin.end();
    });
}

server.listen(PORT, () => {
    console.log('========================================');
    console.log('   Z2B LEGACY BUILDERS - Quick Server');
    console.log('========================================');
    console.log('');
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log('');
    console.log('📍 Access Points:');
    console.log(`   Landing Page: http://localhost:${PORT}/app/landing-page.html`);
    console.log(`   Coach Manlaw: http://localhost:${PORT}/app/coach-manlaw.html`);
    console.log('');
    console.log('⚠️  Note: PHP endpoints require PHP to be installed');
    console.log('   Install XAMPP for full functionality');
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('========================================');
});
