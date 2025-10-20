@echo off
echo ========================================
echo Testing Z2B Platform - All Features
echo ========================================
echo.

echo Starting Z2B Server...
start /b cmd /c "cd server && node server.js"

timeout /t 5 /nobreak > nul

echo.
echo Opening applications in browser...
echo.

echo 1. Coach ManLaw (AI Coaching)
start http://localhost:5000/app/coach-manlaw.html
timeout /t 2 /nobreak > nul

echo 2. Glowie (AI App Builder - powered by Claude)
start http://localhost:5000/app/glowie.html
timeout /t 2 /nobreak > nul

echo 3. VIDZIE (AI Video Generator - powered by D-ID)
start http://localhost:5000/app/vidzie.html
timeout /t 2 /nobreak > nul

echo 4. Dashboard
start http://localhost:5000/app/dashboard.html
timeout /t 2 /nobreak > nul

echo 5. Admin Dashboard
start http://localhost:5000/admin/vidzie-dashboard.html

echo.
echo ========================================
echo All applications are now opening!
echo Server is running on http://localhost:5000
echo.
echo Press any key to stop the server...
pause > nul

echo Stopping server...
taskkill /F /IM node.exe > nul 2>&1
echo Server stopped.
