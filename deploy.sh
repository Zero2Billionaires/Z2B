#!/bin/bash

###############################################################################
# Z2B Production Deployment Script
# Deploys the entire Z2B platform to production
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${DEPLOY_ENV:-production}
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."

    command -v docker >/dev/null 2>&1 || {
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    }

    command -v docker-compose >/dev/null 2>&1 || {
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }

    if [ ! -f ".env" ]; then
        log_error ".env file not found. Please create it from .env.example"
        exit 1
    fi

    log_success "All requirements met"
}

backup_database() {
    log_info "Creating database backup..."

    mkdir -p "$BACKUP_DIR"

    # Backup MongoDB
    log_info "Backing up MongoDB..."
    docker-compose exec -T mongodb mongodump --out=/tmp/backup
    docker cp z2b-mongodb:/tmp/backup "$BACKUP_DIR/mongodb"

    # Backup MySQL
    log_info "Backing up MySQL..."
    docker-compose exec -T mysql mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" z2b_marketplace > "$BACKUP_DIR/mysql_backup.sql"

    log_success "Database backup created at $BACKUP_DIR"
}

build_application() {
    log_info "Building application..."

    # Install dependencies
    log_info "Installing server dependencies..."
    cd server && npm install && cd ..

    log_info "Installing client dependencies..."
    cd client && npm install && cd ..

    # Build client
    log_info "Building client..."
    cd client && npm run build && cd ..

    # Build Docker images
    log_info "Building Docker images..."
    docker-compose build --no-cache

    log_success "Application built successfully"
}

deploy_containers() {
    log_info "Deploying containers..."

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down

    # Start new containers
    log_info "Starting new containers..."
    docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10

    docker-compose ps

    log_success "Containers deployed successfully"
}

run_database_migrations() {
    log_info "Running database migrations..."

    # Import MySQL schema if needed
    if [ -f "Z2B-v21/sql/z2b_complete_schema.sql" ]; then
        log_info "Importing MySQL schema..."
        docker-compose exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" z2b_marketplace < Z2B-v21/sql/z2b_complete_schema.sql
    fi

    log_success "Database migrations completed"
}

health_check() {
    log_info "Running health checks..."

    # Check API health
    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
            log_success "API is healthy"
            return 0
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        log_info "Waiting for API... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done

    log_error "API health check failed"
    return 1
}

show_deployment_info() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║         Z2B Platform - Deployment Complete                ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    log_success "Application URL: http://localhost"
    log_success "API URL: http://localhost:5000/api"
    log_success "Health Check: http://localhost:5000/api/health"
    echo ""
    log_info "View logs: docker-compose logs -f"
    log_info "Stop services: docker-compose down"
    log_info "Restart services: docker-compose restart"
    echo ""
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║         Z2B Platform - Production Deployment              ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""

    log_info "Starting deployment to $DEPLOY_ENV environment..."
    echo ""

    # Step 1: Check requirements
    check_requirements

    # Step 2: Backup databases (if in production)
    if [ "$DEPLOY_ENV" = "production" ]; then
        read -p "Create database backup? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            backup_database
        fi
    fi

    # Step 3: Build application
    build_application

    # Step 4: Deploy containers
    deploy_containers

    # Step 5: Run migrations
    run_database_migrations

    # Step 6: Health check
    if health_check; then
        show_deployment_info
        log_success "Deployment completed successfully! 🚀"
        exit 0
    else
        log_error "Deployment failed health check"
        log_info "Rolling back..."
        docker-compose down
        exit 1
    fi
}

# Run main deployment
main "$@"
