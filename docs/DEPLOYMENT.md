# Deployment Guide

This guide covers various deployment options for the Z2B platform.

## Prerequisites

- Domain name with DNS configured
- SSL/TLS certificate (Let's Encrypt recommended)
- Server access (VPS, cloud hosting, etc.)
- Git installed
- Node.js 18+, MongoDB, PHP 7.4+, MySQL installed

## Quick Deploy Options

### Option 1: Vercel (Frontend Only - Recommended for React App)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Build and deploy:
   ```bash
   cd client
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard

### Option 2: Heroku (Full Stack)

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Create Heroku apps:
   ```bash
   heroku create z2b-client
   heroku create z2b-server
   ```

3. Add MongoDB addon:
   ```bash
   heroku addons:create mongolab --app z2b-server
   ```

4. Deploy:
   ```bash
   git push heroku master
   ```

## VPS Deployment (Recommended)

### Server Requirements

- **OS**: Ubuntu 20.04 LTS or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 50GB SSD minimum
- **CPU**: 2 cores minimum

### Step-by-Step VPS Setup

#### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git curl wget build-essential
```

#### 2. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3. Install MongoDB

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 4. Install MySQL

```bash
# Install MySQL
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Create database
sudo mysql -e "CREATE DATABASE z2b_marketplace;"
sudo mysql -e "CREATE USER 'z2b_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON z2b_marketplace.* TO 'z2b_user'@'localhost';"
```

#### 5. Install PHP

```bash
# Install PHP and extensions
sudo apt install -y php php-fpm php-mysql php-curl php-json php-mbstring php-xml

# Verify installation
php --version
```

#### 6. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 7. Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Set PM2 to start on boot
pm2 startup
```

#### 8. Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /var/www/z2b
sudo chown -R $USER:$USER /var/www/z2b

# Clone repository
cd /var/www/z2b
git clone https://github.com/Zero2Billionaires/Z2B.git .
```

#### 9. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

#### 10. Configure Environment Variables

```bash
# Create server .env file
nano server/.env
```

Add:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/z2b
JWT_SECRET=your-super-secret-jwt-key-256-bit-minimum
NODE_ENV=production

FIREBASE_API_KEY=your-firebase-key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id

PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
```

#### 11. Import Database Schema

```bash
# Import MySQL schema
mysql -u z2b_user -p z2b_marketplace < Z2B-v21/sql/z2b_complete_schema.sql
```

#### 12. Build Frontend

```bash
cd client
npm run build
cd ..
```

#### 13. Configure Nginx

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/z2b
```

Add:
```nginx
# Frontend (React app)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/z2b/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # PHP app
    location /app/ {
        alias /var/www/z2b/Z2B-v21/app/;
        index index.php index.html;

        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
        }
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/z2b /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 14. Start Application with PM2

```bash
# Start server
cd /var/www/z2b/server
pm2 start server.js --name z2b-api

# Save PM2 configuration
pm2 save
```

#### 15. Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

#### 16. Configure Firewall

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

### Staging

```env
NODE_ENV=staging
DEBUG=false
LOG_LEVEL=info
```

### Production

```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error
RATE_LIMIT_ENABLED=true
```

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# View logs
pm2 logs z2b-api

# Monitor resources
pm2 monit

# Restart app
pm2 restart z2b-api

# View status
pm2 status
```

### Database Backups

```bash
# MongoDB backup
mongodump --out=/backup/mongodb/$(date +%Y%m%d)

# MySQL backup
mysqldump -u z2b_user -p z2b_marketplace > /backup/mysql/z2b_$(date +%Y%m%d).sql
```

### Log Rotation

Create `/etc/logrotate.d/z2b`:
```
/var/log/z2b/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs z2b-api --lines 100

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check system logs
sudo journalctl -xe
```

### Database connection issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MySQL status
sudo systemctl status mysql

# Test connection
mongo --eval "db.stats()"
mysql -u z2b_user -p -e "SHOW DATABASES;"
```

### SSL Certificate issues

```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

## Performance Optimization

### Enable Gzip Compression

In Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 10240;
gzip_proxied expired no-cache no-store private auth;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Enable Caching

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### MongoDB Optimization

```javascript
// Create indexes
db.members.createIndex({ "email": 1 }, { unique: true });
db.members.createIndex({ "sponsor_id": 1 });
db.commissions.createIndex({ "member_id": 1, "created_at": -1 });
```

## Scaling

### Horizontal Scaling

- Use load balancer (Nginx, HAProxy)
- Multiple application servers
- Shared MongoDB cluster
- Redis for session management

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching layer
- Use CDN for static assets

## Rollback Procedure

```bash
# List previous releases
git tag

# Rollback to previous version
git checkout v1.0.0
npm install
npm run build
pm2 restart all
```

## Support

For deployment assistance, contact: devops@z2b.com

---

**Deployment complete! Your Z2B platform is now live.**
