@echo off
echo ========================================
echo    Z2B System Check
echo ========================================
echo.
echo Checking your system for required software...
echo.

REM Check for XAMPP
echo [1/5] Checking for XAMPP...
if exist "C:\xampp\xampp-control.exe" (
    echo    ✅ XAMPP found at C:\xampp\
) else (
    echo    ❌ XAMPP NOT found
)
echo.

REM Check for MySQL
echo [2/5] Checking for MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %errorlevel%==0 (
    echo    ✅ MySQL is running
) else (
    echo    ❌ MySQL is NOT running
)
echo.

REM Check for Apache
echo [3/5] Checking for Apache...
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if %errorlevel%==0 (
    echo    ✅ Apache is running
) else (
    echo    ❌ Apache is NOT running
)
echo.

REM Check for PHP
echo [4/5] Checking for PHP...
where php >nul 2>&1
if %errorlevel%==0 (
    echo    ✅ PHP found in system PATH
    php -v 2>nul | findstr "PHP"
) else (
    if exist "C:\xampp\php\php.exe" (
        echo    ✅ PHP found at C:\xampp\php\php.exe
        C:\xampp\php\php.exe -v 2>nul | findstr "PHP"
    ) else (
        echo    ❌ PHP NOT found
    )
)
echo.

REM Check for Python
echo [5/5] Checking for Python...
where python >nul 2>&1
if %errorlevel%==0 (
    echo    ✅ Python found
    python --version
) else (
    echo    ❌ Python NOT found
)
echo.

echo ========================================
echo    PORT STATUS
echo ========================================
echo.
echo Checking common ports...
echo.

netstat -ano | findstr ":80 " >nul 2>&1
if %errorlevel%==0 (
    echo Port 80:    ⚠️  IN USE (Web server)
) else (
    echo Port 80:    ✅ FREE
)

netstat -ano | findstr ":3306 " >nul 2>&1
if %errorlevel%==0 (
    echo Port 3306:  ⚠️  IN USE (MySQL)
) else (
    echo Port 3306:  ✅ FREE
)

netstat -ano | findstr ":8000 " >nul 2>&1
if %errorlevel%==0 (
    echo Port 8000:  ⚠️  IN USE (Python server)
) else (
    echo Port 8000:  ✅ FREE
)

netstat -ano | findstr ":3001 " >nul 2>&1
if %errorlevel%==0 (
    echo Port 3001:  ⚠️  IN USE (Node.js proxy)
) else (
    echo Port 3001:  ✅ FREE
)

echo.
echo ========================================
echo    RECOMMENDATION
echo ========================================
echo.

if exist "C:\xampp\xampp-control.exe" (
    echo ✅ You have XAMPP installed!
    echo.
    echo Next steps:
    echo 1. Open XAMPP Control Panel
    echo 2. Start Apache and MySQL
    echo 3. Open http://localhost/phpmyadmin
    echo 4. Create database: z2b_legacy
    echo 5. Run the migration
    echo.
    echo Would you like to open XAMPP Control Panel now?
    set /p choice="Press Y to open XAMPP, N to skip: "
    if /i "%choice%"=="Y" (
        start "" "C:\xampp\xampp-control.exe"
    )
) else (
    echo ❌ XAMPP is not installed
    echo.
    echo You need to install XAMPP to run this application.
    echo.
    echo Please follow the guide:
    echo    LOCALHOST_SETUP_GUIDE.md
    echo.
    echo Download XAMPP from:
    echo    https://www.apachefriends.org/download.html
    echo.
    echo Would you like to open the download page?
    set /p choice="Press Y to open download page, N to skip: "
    if /i "%choice%"=="Y" (
        start https://www.apachefriends.org/download.html
    )
)

echo.
pause
