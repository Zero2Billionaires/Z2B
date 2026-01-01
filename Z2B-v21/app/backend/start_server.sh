#!/bin/bash
# ZYNTH Voice Cloning Backend Startup Script (Mac/Linux)
# Run: ./start_server.sh

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║        🎤 ZYNTH Voice Cloning Backend Server 🎤         ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found!"
    echo ""
    echo "Please install Python 3.9+ from:"
    echo "https://www.python.org/downloads/"
    echo ""
    exit 1
fi

echo "✅ Python found: $(python3 --version)"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python3 -c "import TTS" &> /dev/null; then
    echo "📦 Installing dependencies..."
    echo "This may take 5-10 minutes on first run..."
    echo ""
    pip install -r requirements.txt
    echo ""
    echo "✅ Dependencies installed"
    echo ""
fi

# Start the server
echo "🚀 Starting ZYNTH backend server..."
echo ""
echo "⚠️  Keep this terminal open while using ZYNTH!"
echo ""
echo "Backend will be available at: http://localhost:5000"
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

python3 server.py
