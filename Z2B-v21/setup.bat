@echo off
echo ========================================
echo Z2B Legacy Builders Platform Setup
echo ========================================
echo.

REM Check if PHP is installed
php -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PHP is not installed or not in PATH
    echo Please install PHP 7.4+ first
    echo Download from: https://windows.php.net/download/
    pause
    exit /b 1
)

echo PHP is installed
php -v
echo.

REM Start PHP built-in server
echo Starting Z2B Legacy Builders Platform...
echo.
echo ========================================
echo Platform will be available at:
echo http://localhost:8000
echo.
echo To stop the server, press Ctrl+C
echo ========================================
echo.

REM Start the server
php -S localhost:8000 -t .

pause