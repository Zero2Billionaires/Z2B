@echo off
echo ========================================
echo Z2B LEGACY BUILDERS APP - Setup Script
echo Premium Gold & Black Edition
echo ========================================
echo.

echo [1/4] Installing root dependencies...
call npm install
echo.

echo [2/4] Installing client dependencies...
cd client
call npm install
cd ..
echo.

echo [3/4] Installing server dependencies...
cd server
call npm install
cd ..
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Ready to start development!
echo ========================================
echo.
echo To run the application:
echo   npm run dev
echo.
echo Frontend will run on: http://localhost:3000
echo Backend will run on:  http://localhost:5000
echo.
echo Make sure MongoDB is running before starting the server!
echo.
pause
