@echo off
REM ZYNTH Voice Cloning Backend Startup Script
REM Double-click this file to start the server

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                       ║
echo ║     ║ 🎤 🎤   1
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found!
    echo.
    echo Please install Python 3.9+ from:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
    echo.
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import TTS" >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing dependencies...
    echo This may take 5-10 minutes on first run...
    echo.
    pip install -r requirements.txt
    echo.
    echo ✅ Dependencies installed
    echo.
)

REM Start the server
echo 🚀 Starting ZYNTH backend server...
echo.
echo ⚠️  DO NOT CLOSE THIS WINDOW while using ZYNTH!
echo.
echo Backend will be available at: http://localhost:5000
echo.
echo ─────────────────────────────────────────────────────────────
echo.

python server.py

REM Keep window open if there's an error
if %errorlevel% neq 0 (
    echo.
    echo ❌ Server stopped with error!
    echo.
    pause
)
