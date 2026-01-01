@echo off
echo ========================================
echo    Z2B LEGACY BUILDERS PLATFORM
echo    Full Stack Startup
echo ========================================
echo.
echo Starting servers...
echo.
echo 1. Python Web Server (port 8000)
echo 2. Node.js API Proxy (port 3001)
echo.
echo ========================================
echo.

REM Start Node.js API proxy in background
start "Z2B API Proxy" cmd /k "node api/claude-proxy.js"

REM Wait a moment for the proxy to start
timeout /t 2 /nobreak >nul

REM Start Python web server
echo.
echo Starting web server...
echo.
echo Open your browser to: http://localhost:8000/app/coach-manlaw.html
echo.
echo Press Ctrl+C to stop the web server
echo (Close the API Proxy window separately)
echo.
python run_server.py

pause
