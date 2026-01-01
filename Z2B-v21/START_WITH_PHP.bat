@echo off
echo ========================================
echo    Z2B LEGACY BUILDERS PLATFORM
echo    With PHP Backend Support
echo ========================================
echo.
echo Starting PHP server on port 8000...
echo.
echo Available at: http://localhost:8000
echo Main Page: http://localhost:8000/index.php
echo Dashboard: http://localhost:8000/app/index.html
echo Coach Manlaw: http://localhost:8000/app/coach-manlaw.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start PHP built-in server
php -S localhost:8000

pause
