# 🎯 Step-by-Step Deployment Guide - Vercel

**User:** rasel606
**Date:** March 4, 2026
**Status:** Ready to Deploy ✅

---

## ✅ Pre-Deployment Status

- ✅ Vercel CLI installed (v33.5.3)
- ✅ Logged in as: rasel606
- ✅ All config files created
- ✅ Backend running locally (Port 5000)
- ✅ Frontend apps running locally

---

## 📋 Step 1: Deploy Backend (REQUIRED FIRST)

### Important Environment Variables Needed:

Before deploying backend, you need to set these in Vercel dashboard:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key
API_KEY=your-api-key
NODE_ENV=production
```

### Deploy Command:

```bash
cd backend
vercel --prod
```

**What will happen:**
1. First time: Vercel will ask to link/create project
2. Choose: Create new project
3. Project name: `megabaji-backend` (or your choice)
4. After deployment, **COPY THE URL** → Example: `https://megabaji-backend.vercel.app`

---

## 📋 Step 2: Set Environment Variables in Vercel

### Go to Vercel Dashboard:
1. Open: https://vercel.com/rasel606
2. Find your backend project
3. Go to: Settings → Environment Variables
4. Add the required variables above
5. Redeploy if needed

---

## 📋 Step 3: Deploy Frontend Applications

**IMPORTANT:** Update API URL in each frontend's environment variables first!

### For each frontend app:

1. Go to Vercel Dashboard
2. Create/link project for the frontend
3. Add environment variable:
   - **React CRA apps** (my-app, png71-front):
     ```
     REACT_APP_API_URL=https://megabaji-backend.vercel.app
     ```
   - **Vite apps** (CoreUI, agentPng71, SubAdminPng71, subAgentPng71):
     ```
     VITE_API_URL=https://megabaji-backend.vercel.app
     ```

### Deploy Commands:

```bash
# Affiliate Portal
cd my-app
vercel --prod

# Player Frontend
cd png71-front
vercel --prod

# Main Admin
cd coreui-free-react-admin-template-main
vercel --prod

# Agent Panel
cd agentPng71
vercel --prod

# Sub-Admin
cd SubAdminPng71
vercel --prod

# Sub-Agent
cd subAgentPng71
vercel --prod
```

---

## 🚀 Automated Deployment Option

Instead of manual commands, use the automation script:

### Deploy All (after backend is live):
```bash
deploy-vercel-all.bat
```

### Deploy Single App:
```bash
deploy-vercel-single.bat
```

---

## 📊 Expected Results

After deployment, you'll have:

```
✅ Backend:        https://megabaji-backend.vercel.app
✅ Affiliate:      https://megabaji-affiliate.vercel.app  
✅ Player:         https://megabaji-player.vercel.app
✅ Main Admin:     https://megabaji-admin.vercel.app
✅ Agent Panel:    https://megabaji-agent.vercel.app
✅ Sub-Admin:      https://megabaji-subadmin.vercel.app
✅ Sub-Agent:      https://megabaji-subagent.vercel.app
```

---

## ⚠️ Important Notes

1. **Deploy Backend First** - All frontends depend on it
2. **Copy Backend URL** - You'll need it for frontend env vars
3. **Set Env Variables** - Before deploying each app
4. **Test After Each Deployment** - Visit the URL and verify it works
5. **MongoDB Atlas** - Make sure IP whitelist allows 0.0.0.0/0 for Vercel

---

## 🔐 MongoDB Atlas Setup

If you haven't set up MongoDB Atlas:

1. Go to: https://cloud.mongodb.com/
2. Create/Select your cluster
3. Database Access → Create database user
4. Network Access → Add IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string → Use in `MONGODB_URI`

---

## 🛠️ Troubleshooting

### Build Failed?
- Check environment variables are set correctly
- Verify MongoDB connection string
- Review build logs in Vercel dashboard

### Can't Connect to Backend?
- Make sure backend deployed successfully
- Check CORS settings in backend
- Verify API URL in frontend env variables

---

## ✅ Deployment Checklist

### Before Starting:
- [ ] MongoDB Atlas database created
- [ ] Database connection string ready
- [ ] JWT secret generated (32+ characters)
- [ ] API keys ready

### Backend Deployment:
- [ ] Deploy backend: `cd backend && vercel --prod`
- [ ] Copy deployment URL
- [ ] Add environment variables in Vercel dashboard
- [ ] Test backend: Visit URL + /api/health (if available)

### Frontend Deployments:
- [ ] Update REACT_APP_API_URL or VITE_API_URL
- [ ] Deploy my-app
- [ ] Deploy png71-front
- [ ] Deploy CoreUI
- [ ] Deploy agentPng71
- [ ] Deploy SubAdminPng71
- [ ] Deploy subAgentPng71

### Post-Deployment:
- [ ] Test all applications
- [ ] Verify login works
- [ ] Check database connections
- [ ] Monitor error logs
- [ ] Set up custom domains (optional)

---

## 📞 Next Steps

1. **Now:** Deploy backend first
2. **Then:** Set environment variables in Vercel
3. **Finally:** Deploy all frontends

---

**Ready to start?** Run:
```bash
cd backend
vercel --prod
```

Then follow the prompts!

---

*Guide created: March 4, 2026*
*User: rasel606*
