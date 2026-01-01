#!/usr/bin/env python3
"""
Z2B Legacy Builders Platform - Local Server
This script runs a simple HTTP server for local development
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        super().end_headers()

print("=" * 50)
print("Z2B LEGACY BUILDERS PLATFORM - LOCAL SERVER")
print("=" * 50)
print()
print(f"Starting server on http://localhost:{PORT}")
print()
print("Available pages:")
print(f"1. Main Landing: http://localhost:{PORT}/app/index.html")
print(f"2. Main Site: http://localhost:{PORT}/index.php")
print()
print("Press Ctrl+C to stop the server")
print("=" * 50)

# Create the server
with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    # Try to open browser automatically
    try:
        webbrowser.open(f'http://localhost:{PORT}/app/index.html')
        print(f"\nBrowser opened automatically!")
    except:
        print(f"\nPlease open your browser and go to: http://localhost:{PORT}/app/index.html")

    print("\nServer is running...")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        pass