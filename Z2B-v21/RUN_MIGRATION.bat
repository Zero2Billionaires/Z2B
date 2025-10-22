@echo off
echo ========================================
echo    Z2B Database Migration Runner
echo ========================================
echo.
echo This will create the Coach Activity Responses table
echo.
pause
echo.
echo Running migration...
echo.

REM Try to find PHP
set PHP_PATH=
if exist "C:\xampp\php\php.exe" set PHP_PATH=C:\xampp\php\php.exe
if exist "C:\wamp64\bin\php\php8.2.0\php.exe" set PHP_PATH=C:\wamp64\bin\php\php8.2.0\php.exe
if exist "C:\laragon\bin\php\php-8.2\php.exe" set PHP_PATH=C:\laragon\bin\php\php-8.2\php.exe

REM If PHP not found in common locations, try system PATH
if "%PHP_PATH%"=="" (
    where php >nul 2>&1
    if %errorlevel%==0 (
        set PHP_PATH=php
    )
)

if "%PHP_PATH%"=="" (
    echo ========================================
    echo   PHP NOT FOUND!
    echo ========================================
    echo.
    echo ALTERNATIVE METHOD:
    echo.
    echo 1. Make sure your server is running (START_FULL.bat)
    echo 2. Open your web browser
    echo 3. Go to: http://localhost:8000/database/migrate.php
    echo 4. Click on "create_coach_activity_responses.sql"
    echo 5. Click "Execute Selected Migration"
    echo.
    echo ========================================
    pause
    exit /b 1
)

echo Found PHP at: %PHP_PATH%
echo.

"%PHP_PATH%" database\run-migration.php create_coach_activity_responses.sql

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo   SUCCESS!
    echo ========================================
    echo.
    echo The database table has been created.
    echo You can now test activity submissions!
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR!
    echo ========================================
    echo.
    echo Try the web method instead:
    echo 1. Open browser
    echo 2. Go to: http://localhost:8000/database/migrate.php
    echo 3. Click the migration and execute
    echo.
)

pause
