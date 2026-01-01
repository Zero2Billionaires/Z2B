@echo off
echo ========================================
echo    Z2B LEGACY BUILDERS PLATFORM
echo    Starting with XAMPP
echo ========================================
echo.

REM Check if XAMPP is installed
if not exist "C:\xampp\xampp-control.exe" (
    echo ❌ ERROR: XAMPP is not installed!
    echo.
    echo Please install XAMPP first:
    echo 1. Download from: https://www.apachefriends.org/download.html
    echo 2. Follow guide: LOCALHOST_SETUP_GUIDE.md
    echo.
    pause
    exit /b 1
)

echo ✅ XAMPP found
echo.
echo Starting services...
echo.

REM Check if Apache is already running
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if %errorlevel%==0 (
    echo ✅ Apache is already running
) else (
    echo 🔄 Starting Apache...
    "C:\xampp\apache_start.bat" 2>nul
    timeout /t 2 /nobreak >nul
    echo ✅ Apache started
)

echo.

REM Check if MySQL is already running
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %errorlevel%==0 (
    echo ✅ MySQL is already running
) else (
    echo 🔄 Starting MySQL...
    "C:\xampp\mysql_start.bat" 2>nul
    timeout /t 3 /nobreak >nul
    echo ✅ MySQL started
)

echo.
echo ========================================
echo    SERVICES READY!
echo ========================================
echo.
echo 📊 Access Points:
echo.
echo 🌐 Your Z2B Site:
echo    http://localhost/Z2B-v21/app/coach-manlaw.html
echo.
echo 🗄️  phpMyAdmin (Database):
echo    http://localhost/phpmyadmin
echo.
echo ⚙️  XAMPP Control Panel:
echo    C:\xampp\xampp-control.exe
echo.
echo ========================================
echo.

set /p open="Open Z2B in browser? (Y/N): "
if /i "%open%"=="Y" (
    start http://localhost/Z2B-v21/app/coach-manlaw.html
)

echo.
echo Keep this window open while using Z2B
echo Press any key to open XAMPP Control Panel...
pause >nul

start "" "C:\xampp\xampp-control.exe"
