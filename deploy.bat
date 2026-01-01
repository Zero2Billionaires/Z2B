@echo off
REM ============================================================================
REM Z2B Production Deployment Script (Windows)
REM Deploys the entire Z2B platform to production
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set DEPLOY_ENV=production
set BACKUP_DIR=backups\%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

REM Colors (using echo with special characters)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "ERROR=[ERROR]"
set "WARNING=[WARNING]"

echo.
echo ===============================================================
echo          Z2B Platform - Production Deployment
echo ===============================================================
echo.

REM Check Docker
echo %INFO% Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker is not installed or not in PATH
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker Compose is not installed or not in PATH
    exit /b 1
)

echo %SUCCESS% Docker and Docker Compose found
echo.

REM Check .env file
if not exist ".env" (
    echo %ERROR% .env file not found
    echo Please create .env from .env.example
    exit /b 1
)

echo %SUCCESS% Configuration file found
echo.

REM Build application
echo %INFO% Building application...
echo.

echo %INFO% Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo %ERROR% Failed to install server dependencies
    exit /b 1
)
cd ..

echo %INFO% Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo %ERROR% Failed to install client dependencies
    exit /b 1
)

echo %INFO% Building client...
call npm run build
if errorlevel 1 (
    echo %ERROR% Failed to build client
    exit /b 1
)
cd ..

echo %SUCCESS% Application built successfully
echo.

REM Build Docker images
echo %INFO% Building Docker images...
docker-compose build --no-cache
if errorlevel 1 (
    echo %ERROR% Failed to build Docker images
    exit /b 1
)

echo %SUCCESS% Docker images built
echo.

REM Stop existing containers
echo %INFO% Stopping existing containers...
docker-compose down

REM Start new containers
echo %INFO% Starting containers...
docker-compose up -d
if errorlevel 1 (
    echo %ERROR% Failed to start containers
    exit /b 1
)

echo %SUCCESS% Containers started
echo.

REM Wait for services
echo %INFO% Waiting for services to initialize...
timeout /t 15 /nobreak >nul

REM Check service status
docker-compose ps

REM Health check
echo.
echo %INFO% Running health check...
timeout /t 5 /nobreak >nul

curl -f http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo %WARNING% API health check failed
    echo %INFO% Check logs: docker-compose logs -f app
) else (
    echo %SUCCESS% API is healthy
)

echo.
echo ===============================================================
echo          Deployment Complete!
echo ===============================================================
echo.
echo  Application URL:  http://localhost
echo  API URL:          http://localhost:5000/api
echo  Health Check:     http://localhost:5000/api/health
echo.
echo  Useful commands:
echo  - View logs:      docker-compose logs -f
echo  - Stop services:  docker-compose down
echo  - Restart:        docker-compose restart
echo.
echo ===============================================================
echo.

endlocal
pause
