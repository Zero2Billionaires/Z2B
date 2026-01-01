@echo off
echo ========================================
echo Z2B Legacy Builders - Development Mode
echo ========================================
echo.
echo Starting Backend API Server on port 8000...
echo Starting Frontend Dev Server on port 5173...
echo.
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

start "Z2B Backend API" cmd /k "cd backend && php -S localhost:8000"
timeout /t 2 /nobreak > nul
start "Z2B Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
