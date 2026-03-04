# 🆓 KOYEB DEPLOYMENT - 100% FREE, NO CARD REQUIRED

## Why Koyeb?
- ✅ **100% FREE** - No credit card required!
- ✅ **WebSocket support** - Full Socket.IO compatibility
- ✅ **No timeout limits** - Run as long as needed
- ✅ **Auto-scaling** - Scales to zero when not used
- ✅ **Global CDN** - Fast worldwide access
- ✅ **Instant deploys** - From GitHub in seconds

---

## 🚀 Deploy to Koyeb in 2 Minutes

### Step 1: Create Koyeb Account
1. Go to: https://app.koyeb.com/auth/signup
2. Sign up with GitHub (recommended) or email
3. **No credit card required!**

### Step 2: Deploy from GitHub

1. Click **"Create App"**
2. Choose **"GitHub"** as source
3. Select repository: **rasel606/kingbajiBack**
4. Configure:
   ```
   Branch: main
   Build method: Dockerfile
   Port: 8000
   Health check path: /api/health
   Instance type: Free (Nano)
   ```

### Step 3: Add Environment Variables

Click **"Environment variables"** and add:

```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=Kingbaji
JWT_REFRESH_SECRET=KingbajiRefresh
API_OPERATOR_CODE=rbdb
API_SECRET_KEY=9332fd9144a3a1a8bd3ab7afac3100b0
API_BASE_URL=http://fetch.336699bet.com
REDIS_URL=redis://127.0.0.1:6379
CORS_ORIGINS=https://my-app-lac-six-54.vercel.app,https://png71-front.vercel.app
```

### Step 4: Deploy!

Click **"Deploy"** - That's it!

Your app will be live at: `https://kingbaji-backend-<your-username>.koyeb.app`

---

## 📊 Free Tier Limits

- **1 Nano instance** (256MB RAM)
- **100GB bandwidth/month**
- **Unlimited requests**
- **Auto-sleep after 5 min inactivity**
- **Instant wake-up on request**

---

## 🔄 Auto-Deploy

Koyeb automatically redeploys when you push to GitHub!

---

## ✅ What Works on Free Tier

- ✅ Socket.IO / WebSockets
- ✅ Long-running connections
- ✅ Cron jobs (runs in background)
- ✅ File uploads
- ✅ Database connections
- ✅ Redis connections

---

## 🎯 Quick Commands

```bash
# Check logs
# Go to: https://app.koyeb.com/apps/kingbaji-backend/logs

# Redeploy
# Push to GitHub or click "Redeploy" in dashboard

# Update env vars
# Dashboard → App → Settings → Environment Variables
```

---

## 🌐 Your URLs

After deployment:
- API: `https://kingbaji-backend-<username>.koyeb.app`
- Health: `https://kingbaji-backend-<username>.koyeb.app/api/health`
- Any endpoint: `https://kingbaji-backend-<username>.koyeb.app/api/...`

---

## 💡 Pro Tips

1. **Custom Domain**: Add your own domain for free in Settings
2. **Monitoring**: Built-in metrics dashboard
3. **Scaling**: Upgrade to paid plan ($7/mo) for always-on
4. **Regions**: Free tier uses Europe (France) - upgrade for US regions

---

## 🆚 Why Koyeb > Others?

| Feature | Koyeb | Render | Fly.io |
|---------|-------|--------|--------|
| No Card Required | ✅ Yes | ✅ Yes | ❌ No |
| WebSockets | ✅ Yes | ✅ Yes | ✅ Yes |
| Auto Sleep | ⚠️ 5 min | ⚠️ 15 min | ❌ No |
| Wake Time | ⏱️ <1s | ⏱️ ~30s | - |
| Free RAM | 256MB | 512MB | 256MB |
| Best For | Quick start | Long tasks | Production |

---

## 🚀 DEPLOY NOW

**Direct Link:** https://app.koyeb.com/apps/new/github

1. Connect GitHub
2. Select `rasel606/kingbajiBack`
3. Add environment variables
4. Click Deploy

**Done!** 🎉

Your backend will be live in ~2 minutes with:
- ✅ Full WebSocket support
- ✅ No timeout limits
- ✅ Auto-deploy on git push
- ✅ Free SSL certificate
- ✅ Global CDN
