#!/bin/bash

echo "========================================"
echo "Z2B Legacy Builders - Setup Script"
echo "========================================"
echo ""

echo "[1/4] Installing root dependencies..."
npm install
echo ""

echo "[2/4] Installing client dependencies..."
cd client
npm install
cd ..
echo ""

echo "[3/4] Installing server dependencies..."
cd server
npm install
cd ..
echo ""

echo "[4/4] Setup complete!"
echo ""
echo "========================================"
echo "Ready to start development!"
echo "========================================"
echo ""
echo "To run the application:"
echo "  npm run dev"
echo ""
echo "Frontend will run on: http://localhost:3000"
echo "Backend will run on:  http://localhost:5000"
echo ""
echo "Make sure MongoDB is running before starting the server!"
echo ""
