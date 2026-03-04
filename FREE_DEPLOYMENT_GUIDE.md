# 🆓 FREE PLATFORM DEPLOYMENT GUIDE

Your backend is configured for **3 FREE platforms** that support WebSockets, Cron jobs, and have no timeout limits!

---

## ✅ Platform Comparison

| Platform | WebSocket | Cron Jobs | Timeout | Free Tier | Best For |
|----------|-----------|-----------|---------|-----------|----------|
| **Fly.io** | ✅ Yes | ✅ Yes | ✅ None | 3 VMs (256MB) | Production-ready |
| **Render** | ✅ Yes | ✅ Yes | ✅ None | 750 hrs/month | Simple setup |
| **Railway** | ✅ Yes | ✅ Yes | ✅ None | $5 credit (requires card) | Best DX |

---

## 🪂 Option 1: Fly.io (RECOMMENDED - Most Generous Free Tier)

**Free Tier:**
- 3 shared VMs (256MB RAM each)
- 3GB storage
- 160GB bandwidth/month
- Full WebSocket support
- **No credit card required for basic tier**

### Deploy to Fly.io:

```bash
# Windows PowerShell
.\deploy-fly.ps1

# Linux/Mac
./deploy-fly.sh
```

**Manual steps:**
```bash
# 1. Install Fly CLI
# Windows: iwr https://fly.io/install.ps1 -useb | iex
# Mac: brew install flyctl
# Linux: curl -L https://fly.io/install.sh | sh

# 2. Login
flyctl auth login

# 3. Launch app
flyctl launch --name kingbaji-backend --region iad

# 4. Set environment variables
flyctl secrets set MONGODB_URI="your-mongodb-uri" JWT_SECRET="your-secret"

# 5. Deploy
flyctl deploy
```

**Your app will be at:** `https://kingbaji-backend.fly.dev`

---

## 🎨 Option 2: Render (EASIEST - Already Set Up!)

**Free Tier:**
- 750 hours/month
- Sleeps after 15 min inactivity
- Spins up on request (cold start ~30s)
- WebSocket support

### Fix Your Current Render Deployment:

1. **Go to:** https://dashboard.render.com
2. **Find your service:** kingbaji-backend
3. **Check:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: Should be empty (or `backend` if deploying from root)
4. **Add all environment variables** from your `.env` file
5. **Redeploy** from dashboard

**Your app is at:** `https://kingbaji-backend.onrender.com`

---

## 🚂 Option 3: Railway (Best Developer Experience)

**Free Tier:**
- $5 monthly credit (requires credit card, but won't charge)
- ~100 hours runtime on free tier
- Instant deploys
- Best CI/CD

### Deploy to Railway:

```bash
# Already configured! Just run:
railway login
railway init
railway up
```

---

## 🎯 RECOMMENDED DEPLOYMENT ORDER

### Step 1: Deploy to Fly.io (Primary - Most Reliable)
```bash
.\deploy-fly.ps1
```

### Step 2: Keep Render as Backup
Fix current deployment via dashboard

### Step 3: Optional - Add Railway for CI/CD
Only if you add a credit card

---

## 📦 Files Created for You:

- ✅ `Dockerfile` - Container config for all platforms
- ✅ `fly.toml` - Fly.io configuration
- ✅ `render.yaml` - Render configuration
- ✅ `railway.json` - Railway configuration
- ✅ `deploy-fly.ps1` - Fly.io deployment script (Windows)
- ✅ `deploy-fly.sh` - Fly.io deployment script (Linux/Mac)

---

## 🚀 Quick Start - Deploy Now!

**For Fly.io (Recommended):**
```powershell
# Install Fly CLI
iwr https://fly.io/install.ps1 -useb | iex

# Deploy
cd e:\megabaji-2\backend
flyctl auth login
flyctl launch --name kingbaji-backend
flyctl deploy
```

**After deployment, your backend will have:**
- ✅ Full WebSocket/Socket.IO support
- ✅ Cron jobs running automatically
- ✅ No timeout limits
- ✅ Auto-scaling
- ✅ Free SSL certificate
- ✅ Global CDN

---

## 🔧 Post-Deployment

Update your frontend environment variables:

```env
# Replace Vercel backend URL with your new URL:
REACT_APP_API_URL=https://kingbaji-backend.fly.dev
# or
REACT_APP_API_URL=https://kingbaji-backend.onrender.com
```

---

## 📞 Need Help?

**Fly.io Docs:** https://fly.io/docs/
**Render Docs:** https://render.com/docs
**Railway Docs:** https://docs.railway.app/

Choose Fly.io for the best free tier! 🎉
