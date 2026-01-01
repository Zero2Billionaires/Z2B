# 🎯 Z2B Production - Quick Reference Card

## 📍 Your Production Details

**Domain**: z2blegacybuilders.co.za
**Hosting**: domains.co.za
**Repository**: https://github.com/Zero2Billionaires/Z2B.git

---

## ✅ What's READY

### APIs Configured:
- ✅ **MongoDB Atlas**: Connected & Working
- ✅ **Anthropic AI**: $10 plan active (sk-ant-api03-9GIL...)
- ✅ **D-ID Video**: 14-day trial active (emVybz...)

### Production Files Created:
- ✅ `server/.env.production` - Production environment variables
- ✅ `DEPLOY_TO_DOMAINS_COZA.md` - Complete deployment guide
- ✅ `DEPLOYMENT_READY.md` - Platform overview

---

## 🚀 Quick Deployment Steps

### If domains.co.za has SSH/VPS access:

```bash
# 1. SSH into your server
ssh username@z2blegacybuilders.co.za

# 2. Clone repository
git clone https://github.com/Zero2Billionaires/Z2B.git
cd Z2B

# 3. Install dependencies
cd server
npm install

# 4. Configure environment
cp .env.production .env

# 5. Install PM2
sudo npm install -g pm2

# 6. Start server
pm2 start server.js --name z2b-api
pm2 save

# 7. Configure auto-restart
pm2 startup

# Done! Your API is running on port 5000
```

### If domains.co.za is shared hosting:

Use **Heroku** for backend (free):
```bash
heroku create z2b-api
git push heroku master
```

Then upload frontend files (Z2B-v21 folder) to domains.co.za via FTP.

---

## 🔑 Your API Keys

### Anthropic (Claude AI) - $10 Plan
```
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
```

### D-ID Video - 14-Day Trial
```
emVybzJiaWxsaW9uYWlyZXNAZ21haWwuY29t:8TOyy1tqztAY0ByKQQgWq
```

### MongoDB Connection
```
mongodb+srv://zero2billionaires_db_user:G4SJb9EVuiVhMBJg@z2b-cluster.on33mke.mongodb.net/z2b?retryWrites=true&w=majority&appName=z2b-cluster
```

---

## 🌐 Access URLs (After Deployment)

| Service | URL |
|---------|-----|
| **Main Site** | https://z2blegacybuilders.co.za |
| **Dashboard** | https://z2blegacybuilders.co.za/app/dashboard.html |
| **Admin Panel** | https://z2blegacybuilders.co.za/admin/index.html |
| **Coach ManLaw** | https://z2blegacybuilders.co.za/app/coach-manlaw.html |
| **Marketplace** | https://z2blegacybuilders.co.za/app/marketplace.html |
| **API Health** | https://z2blegacybuilders.co.za/api/health |

---

## 🔧 Essential Commands

### Start/Stop Server:
```bash
pm2 start z2b-api      # Start
pm2 stop z2b-api       # Stop
pm2 restart z2b-api    # Restart
pm2 logs z2b-api       # View logs
pm2 status             # Check status
```

### Update Code:
```bash
cd /path/to/Z2B
git pull origin master
cd server
npm install
pm2 restart z2b-api
```

### Check Logs:
```bash
pm2 logs z2b-api --lines 100
```

---

## ⚠️ Before Going Live

Security Checklist:
- [ ] Change `JWT_SECRET` in .env (currently: Z2B_Legacy_Builders_2025...)
- [ ] Change `ADMIN_PASSWORD` in .env (currently: Z2BLegacy2025!ChangeThis)
- [ ] Install SSL certificate (HTTPS)
- [ ] Configure firewall
- [ ] Test all features

---

## 💳 Cost Breakdown

| Service | Cost | Status |
|---------|------|--------|
| **Domain** | Paid | ✅ Active |
| **Hosting** | Paid | ✅ Active |
| **MongoDB** | Free (512MB) | ✅ Active |
| **Anthropic AI** | $10/month | ✅ Active |
| **D-ID Video** | $0 (trial) → ~$30/month | ⏰ 14 days left |

**Total Monthly**: ~$40-50 USD when D-ID trial ends

---

## 🆘 Quick Troubleshooting

**Server won't start:**
```bash
# Check if port 5000 is in use
sudo lsof -i :5000
# Kill if needed
sudo kill -9 [PID]
```

**MongoDB connection error:**
```bash
# Test connection
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(err => console.error(err));"
```

**API not responding:**
```bash
# Check PM2 status
pm2 status
# Restart
pm2 restart z2b-api
# Check logs
pm2 logs z2b-api
```

---

## 📞 Support Contacts

- **domains.co.za Support**: https://www.domains.co.za/support
- **MongoDB Support**: https://cloud.mongodb.com/support
- **Anthropic Support**: https://support.anthropic.com
- **D-ID Support**: https://docs.d-id.com

---

## 🎯 Next Steps

1. ✅ Domain purchased
2. ✅ Hosting purchased
3. ✅ API keys configured
4. ✅ Code on GitHub
5. ⏳ Deploy to server
6. ⏳ Point domain DNS
7. ⏳ Install SSL
8. ⏳ Test everything
9. ⏳ LAUNCH! 🚀

---

## 💎 You're Almost There!

Everything is configured and ready. Just need to:
1. Upload code to server
2. Start Node.js app
3. Point domain
4. Go live!

**Detailed instructions**: See `DEPLOY_TO_DOMAINS_COZA.md`

**Transform Employees to Entrepreneurs** 🚀

