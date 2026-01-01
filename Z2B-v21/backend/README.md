# Z2B Legacy Builders - Admin Panel Backend

## Complete Admin Control System

This is a comprehensive admin panel backend that allows you to manage every aspect of your Z2B Legacy Builders platform without touching code or redeploying files.

## Features

### 1. **Tier & Pricing Management**
- Update tier prices in real-time
- Modify PV points for each tier
- Change ISP commission percentages
- All changes reflect immediately on the frontend

### 2. **User Management**
- View all users with filtering and search
- Register users for free (admin registration)
- Grant free access to any app for any user
- Add fuel credits to user accounts
- Change user tiers
- Suspend or block accounts

### 3. **Content Management**
- Update 90-day lessons without redeploying
- Edit lesson content, videos, audio files
- Publish/unpublish lessons
- Manage all content pages

### 4. **Branding Control**
- Change colors (primary, secondary, accent, gold, orange)
- Update fonts
- Modify logo and favicon
- Update company name and tagline

### 5. **Compensation Plan Settings**
- Modify Beta tester limit (first 100)
- Change commission percentages (ISP, TSC, TPB, TLI, QPB, CEO, MKT)
- Update fuel credit expiry days
- Configure rollover settings

### 6. **Payment Gateway Configuration**
- Configure Yoco payment settings
- Add Stripe credentials
- Setup PayPal
- Configure bank transfer details
- Switch between payment gateways with one click

### 7. **Statistics Management**
- View real-time platform statistics
- Reset statistics with one button
- Track user growth
- Monitor revenue and commissions

## Installation Instructions

### Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)

### Step 1: Install MongoDB

#### For Windows:
1. Download MongoDB Community Server from the link above
2. Run the installer and follow the wizard
3. Select "Complete" installation
4. Check "Install MongoDB as a Service"
5. Keep the default data and log directory paths
6. MongoDB will start automatically

#### For Linux:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 2: Install Backend Dependencies

Open a terminal in the `backend` folder and run:

```bash
cd C:\Users\Manana\Z2B\Z2B-v21\backend
npm install
```

This will install all required packages:
- express (web server)
- mongoose (MongoDB driver)
- cors (cross-origin requests)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- dotenv (environment variables)

### Step 3: Configure Environment Variables

The `.env` file has been pre-configured with:
- MongoDB connection string
- Admin credentials (default: admin/Admin@Z2B2024!)
- JWT secret key
- API keys (already set from previous configuration)

**IMPORTANT SECURITY:**
1. Change `ADMIN_PASSWORD` to a strong password
2. Keep the `.env` file secure - NEVER commit to Git
3. Update `JWT_SECRET` to a random string in production

### Step 4: Start the Backend Server

```bash
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Z2B Admin Backend Server running on port 5000
📍 Environment: production
```

### Step 5: Access the Admin Panel

1. Open your browser
2. Go to the dashboard: `http://z2blegacybuilders.co.za/dashboard.html`
3. **Secret Admin Access:** Click on "Z2B Legacy Builders" in the footer **5 times** (within 3 seconds)
4. You'll be redirected to the admin panel
5. Login with:
   - Username: `admin`
   - Password: `Admin@Z2B2024!` (or whatever you set in .env)

## Deployment to Production

### Option 1: Same Server (z2blegacybuilders.co.za)

#### Check if your hosting supports Node.js:
1. Login to cPanel
2. Look for "Node.js Selector" or "Setup Node.js App"
3. If available, proceed with these steps:

```bash
# 1. Upload the backend folder to your server
# 2. SSH into your server
# 3. Navigate to backend folder
cd /home/zerobill/backend

# 4. Install dependencies
npm install --production

# 5. Install PM2 (process manager)
npm install -g pm2

# 6. Start the server with PM2
pm2 start server.js --name "z2b-admin"
pm2 save
pm2 startup
```

#### Configure CORS:
Update `.env` file:
```
FRONTEND_URL=https://z2blegacybuilders.co.za
```

Update `admin.html` line 735:
```javascript
const API_URL = 'https://z2blegacybuilders.co.za:5000/api';
```

### Option 2: Separate Backend Server (Recommended)

Deploy the backend to a separate service like:
- **Heroku** (free tier available)
- **Railway** (free tier available)
- **DigitalOcean** ($5/month)
- **AWS EC2** (free tier for 1 year)

#### Heroku Deployment:

```bash
# 1. Install Heroku CLI
# Download from: https://devcli.heroku.com/install

# 2. Login to Heroku
heroku login

# 3. Create new app
cd backend
heroku create z2b-admin-backend

# 4. Add MongoDB Atlas (free tier)
heroku addons:create mongolab:sandbox

# 5. Set environment variables
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=YourStrongPassword
heroku config:set JWT_SECRET=your-random-jwt-secret
heroku config:set FRONTEND_URL=https://z2blegacybuilders.co.za

# 6. Deploy
git init
git add .
git commit -m "Initial admin backend"
git push heroku master

# 7. Your backend URL will be: https://z2b-admin-backend.herokuapp.com
```

Then update `admin.html`:
```javascript
const API_URL = 'https://z2b-admin-backend.herokuapp.com/api';
```

## Using the Admin Panel

### Dashboard Overview
- View real-time statistics
- Total users, beta testers, active users
- Total revenue and PV generated
- Quick actions for common tasks

### Tier Management
1. Go to "Tiers & Pricing" section
2. Update any tier's price, PV points, or ISP commission
3. Click "Save Changes"
4. Changes reflect immediately on all pages

### User Management
1. Go to "User Management"
2. Search/filter users
3. Actions available:
   - **Create User:** Register someone for free
   - **Edit User:** Change tier, add notes
   - **Grant Free Access:** Give free access to any app
   - **Add Fuel Credits:** Gift fuel credits
   - **Change Tier:** Upgrade/downgrade user tier
   - **Suspend/Block:** Disable account access

### Content Management
1. Go to "Content Management"
2. Select lesson day (1-90)
3. Edit title, description, content
4. Add video/audio URLs
5. Set required tier
6. Publish/unpublish
7. Save changes

### Payment Gateway Setup
1. Go to "Payment Gateway Configuration"
2. Select gateway (Yoco, Stripe, PayPal, Bank Transfer)
3. Enter API keys/credentials
4. Set as active gateway
5. Save

### Statistics Reset
1. Go to "Statistics"
2. Click "Reset Statistics"
3. Confirm action
4. All stats reset to zero (history preserved)

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/tiers` - Update tier settings
- `PUT /api/settings/branding` - Update branding
- `PUT /api/settings/compensation` - Update compensation plan
- `PUT /api/settings/general` - Update general settings

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/grant-access` - Grant free app access
- `POST /api/users/:id/add-fuel` - Add fuel credits
- `POST /api/users/:id/change-tier` - Change user tier
- `DELETE /api/users/:id` - Delete user

### Content
- `GET /api/content/lessons` - Get all lessons
- `GET /api/content/lessons/:day` - Get specific lesson
- `POST /api/content/lessons` - Create/update lesson
- `DELETE /api/content/lessons/:day` - Delete lesson

### Statistics
- `GET /api/stats` - Get current stats
- `POST /api/stats/recalculate` - Recalculate stats
- `POST /api/stats/reset` - Reset all stats

### Payment
- `GET /api/payment` - Get payment gateway settings
- `PUT /api/payment/yoco` - Update Yoco settings
- `PUT /api/payment/active` - Set active gateway

## Security Best Practices

1. **Change Default Password:** Update `ADMIN_PASSWORD` in `.env`
2. **Secure JWT Secret:** Generate a random 64-character string
3. **Enable HTTPS:** Always use SSL in production
4. **Backup Database:** Regular MongoDB backups
5. **Monitor Access:** Check admin panel access logs
6. **Firewall Rules:** Restrict API access to your domain only

## Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check Node version
node --version  # Should be v16+

# Check port 5000 is available
netstat -an | grep 5000
```

### Can't connect to database
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- Ensure MongoDB service is started

### API requests failing
- Check CORS settings in `.env`
- Verify `FRONTEND_URL` matches your domain
- Check browser console for errors
- Ensure backend server is running

### Login not working
- Verify credentials in `.env`
- Check JWT_SECRET is set
- Clear browser cache and cookies

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend server logs
3. Check MongoDB connection
4. Verify environment variables

## Security Notes

⚠️ **CRITICAL:**
- Keep `.env` file secure
- Never commit credentials to Git
- Use strong passwords
- Enable 2FA if possible
- Regular security audits

## Next Steps

1. ✅ Backend installed and running
2. ✅ MongoDB connected
3. ✅ Admin panel accessible
4. 🔄 Configure your preferences
5. 🔄 Add initial content
6. 🔄 Set up payment gateway
7. 🔄 Invite beta testers

You now have complete control over your Z2B platform! 🎉
