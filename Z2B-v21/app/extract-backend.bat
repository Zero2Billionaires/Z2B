@echo off
echo ================================================
echo Z2B Backend Files Extraction Script
echo ================================================
echo.
echo This script will extract backend files from git
echo and create a complete admin-backend directory.
echo.
pause

cd ..
echo Creating admin-backend directory...
mkdir admin-backend 2>nul
cd admin-backend

echo.
echo Extracting server files...
git show 6cb7e44:Z2B-v21/backend/server.js > server.js
git show 6cb7e44:Z2B-v21/backend/package.json > package.json

echo Creating models directory...
mkdir models 2>nul
git show 6cb7e44:Z2B-v21/backend/models/Settings.js > models/Settings.js
git show 6cb7e44:Z2B-v21/backend/models/User.js > models/User.js
git show 6cb7e44:Z2B-v21/backend/models/Content.js > models/Content.js
git show 6cb7e44:Z2B-v21/backend/models/PaymentGateway.js > models/PaymentGateway.js
git show 6cb7e44:Z2B-v21/backend/models/Statistics.js > models/Statistics.js

echo Creating routes directory...
mkdir routes 2>nul
git show 6cb7e44:Z2B-v21/backend/routes/auth.js > routes/auth.js
git show 6cb7e44:Z2B-v21/backend/routes/settings.js > routes/settings.js
git show 6cb7e44:Z2B-v21/backend/routes/users.js > routes/users.js
git show 6cb7e44:Z2B-v21/backend/routes/content.js > routes/content.js
git show 6cb7e44:Z2B-v21/backend/routes/stats.js > routes/stats.js
git show 6cb7e44:Z2B-v21/backend/routes/payment.js > routes/payment.js

echo Creating middleware directory...
mkdir middleware 2>nul
git show 6cb7e44:Z2B-v21/backend/middleware/auth.js > middleware/auth.js

echo Creating .env template...
echo NODE_ENV=production > .env.example
echo PORT=5000 >> .env.example
echo MONGODB_URI=your-mongodb-connection-string-here >> .env.example
echo JWT_SECRET=your-super-secret-jwt-key-change-this >> .env.example
echo FRONTEND_URL=https://z2blegacybuilders.co.za >> .env.example

echo.
echo ================================================
echo SUCCESS! Backend files extracted to:
echo C:\Users\Manana\Z2B\Z2B-v21\admin-backend
echo ================================================
echo.
echo Next steps:
echo 1. Read BACKEND_DEPLOYMENT_GUIDE.md in app folder
echo 2. Setup MongoDB Atlas (free)
echo 3. Deploy to Railway or Render (free)
echo 4. Update admin.html with production API URL
echo.
pause
