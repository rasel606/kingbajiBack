# 🌐 Netlify Deployment Setup Guide

**Status:** Ready to Deploy ✅  
**Date:** March 4, 2026

---

## 🎯 Quick Start - Deploy to Netlify

### **Choice 1: Manual Deployment (5 minutes)**

1. Go to: https://app.netlify.com/
2. Click: "Add new site"
3. Choose: "Deploy manually"
4. Drag & drop your `build` folder
5. Done! ✅

---

### **Choice 2: GitHub Integration (Recommended)**

1. Go to: https://app.netlify.com/
2. Click: "Add new site"
3. Choose: "Import an existing project"
4. Select: "GitHub"
5. Choose repository & branch
6. Configure & Deploy

---

## 📋 Step-by-Step Setup

### **Step 1: Go to Netlify Dashboard**

Open: https://app.netlify.com/

---

### **Step 2: Create Site for Backend**

1. Click: **"Add new site"**
2. Choose: **"Import an existing project"**
3. Select: **"GitHub"**
4. Choose: **rasel606/kingbajiBack**
5. Configure:
   - **Base directory:** `backend`
   - **Build command:** (leave empty)
   - **Publish directory:** `.`
6. Add Environment Variables:
   ```
   MONGODB_URI = your-connection-string
   JWT_SECRET = your-jwt-secret
   API_KEY = your-api-key
   NODE_ENV = production
   ```
7. Click: **"Deploy site"**
8. **Copy the Netlify URL** → Save it (you'll need it for frontends)

---

### **Step 3: Create Sites for Frontends**

Repeat the process for each frontend app:

#### **my-app:**
- **Base directory:** `my-app`
- **Build command:** `CI=false npm run build`
- **Publish directory:** `build`
- **Environment Variables:**
  ```
  REACT_APP_API_URL = https://your-backend-site.netlify.app
  ```

#### **png71-front:**
- **Base directory:** `png71-front`
- **Build command:** `CI=false npm run build`
- **Publish directory:** `build`
- **Environment Variables:**
  ```
  REACT_APP_API_URL = https://your-backend-site.netlify.app
  ```

#### **coreui-free-react-admin-template-main:**
- **Base directory:** `coreui-free-react-admin-template-main`
- **Build command:** `npm run build`
- **Publish directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://your-backend-site.netlify.app
  ```

#### **agentPng71:**
- **Base directory:** `agentPng71`
- **Build command:** `npm run build`
- **Publish directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://your-backend-site.netlify.app
  ```

#### **SubAdminPng71:**
- **Base directory:** `SubAdminPng71`
- **Build command:** `npm run build`
- **Publish directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://your-backend-site.netlify.app
  ```

#### **subAgentPng71:**
- **Base directory:** `subAgentPng71`
- **Build command:** `npm run build`
- **Publish directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://your-backend-site.netlify.app
  ```

---

## 🔧 Netlify Configuration Files

All apps already have `netlify.toml` files configured with:

- ✅ Build commands
- ✅ Output directories
- ✅ Redirect rules for SPA
- ✅ Cache headers
- ✅ Security headers

No changes needed! Just deploy!

---

## 🌍 Expected URLs After Deployment

```
Backend:        https://megabaji-backend.netlify.app
Affiliate:      https://megabaji-affiliate.netlify.app
Player:         https://megabaji-player.netlify.app
Main Admin:     https://megabaji-admin.netlify.app
Agent Panel:    https://megabaji-agent.netlify.app
Sub-Admin:      https://megabaji-subadmin.netlify.app
Sub-Agent:      https://megabaji-subagent.netlify.app
```

---

## ✅ Netlify Features

### **Free Tier Includes:**

- ✅ Continuous deployment
- ✅ Preview deployments for PRs
- ✅ Automatic HTTPS/SSL
- ✅ 300 build minutes/month
- ✅ Automatic rollbacks
- ✅ Netlify Functions (serverless)
- ✅ Analytics

---

## 🔐 Environment Variables

### **Set in Netlify Dashboard:**

1. Go to site
2. Click: **Site settings**
3. Go to: **Build & deploy → Environment**
4. Click: **Edit variables**
5. Add your variables

---

## 📱 Preview Deployments

### **Automatic Preview URLs:**

- Create PR on GitHub
- Netlify auto-creates preview deployment
- Every commit gets unique preview URL
- Share URL with team for testing
- No production impact!

---

## 🛠️ Netlify Build Logs

### **View Build Logs:**

1. Go to site
2. Click: **Deploys** tab
3. Click on a deployment
4. Scroll down to see logs
5. Check for build errors

---

## 🔄 How to Redeploy

### **From Netlify Dashboard:**

1. Go to site
2. Click: **Deploys**
3. Click: **Trigger Deploy** (or specific deployment)
4. Choose: **Clear cache and redeploy**

### **From GitHub:**

1. Push to `main` branch
2. Automatic redeploy happens
3. Check status in GitHub Actions

---

## 🎯 Next Steps

### **Setup GitHub CI/CD (Optional but Recommended):**

See: [GITHUB_CICD_SETUP_GUIDE.md](./GITHUB_CICD_SETUP_GUIDE.md)

After setup, every push automatically deploys! 🚀

---

## 📊 Monitoring Deployments

### **Netlify Dashboard Stats:**

- Build time
- Deployment status
- Error logs
- Performance metrics
- Analytics

### **Real-time Status:**

- Netlify Status: https://www.netlifystatus.com/
- Your site status on dashboard

---

## 🆘 Troubleshooting

### ❌ Build Failed

1. Check build logs in Netlify
2. Verify dependencies installed
3. Check environment variables
4. Try manual redeploy

### ❌ Can't Connect to Database

1. Check MONGODB_URI is correct
2. Verify IP whitelist in MongoDB Atlas
3. Allow Netlify IPs (0.0.0.0/0)

### ❌ Frontend Can't Reach Backend

1. Copy exact backend Netlify URL
2. Update REACT_APP_API_URL or VITE_API_URL
3. Redeploy frontend

---

## 📋 Deployment Checklist

- [ ] Sign up for Netlify: https://app.netlify.com/
- [ ] Create backend site
- [ ] Add environment variables for backend
- [ ] Create 6 frontend sites
- [ ] Add API URL for each frontend
- [ ] Test all applications
- [ ] Set up custom domains (optional)
- [ ] Enable auto-deployments from GitHub (optional)

---

## 🎉 You're Ready!

All 7 applications are now ready to deploy to Netlify!

### **Next Action:**
👉 Go to: https://app.netlify.com/ and start deploying!

---

*Deployment guide ready: March 4, 2026*
