# 🚀 AUTOMATED DEPLOYMENT GUIDE - VERCEL & NETLIFY

**Status:** Ready to Deploy ✅  
**User:** rasel606  
**Date:** March 4, 2026

---

## 📋 QUICK START - DEPLOY IN 3 MINUTES

### **Option A: Deploy to Vercel (Recommended - Already Logged In)**

All 7 applications will be deployed to production automatically.

#### **Step 1: Go to Vercel Dashboard**
Open: https://vercel.com/dashboard

---

#### **Step 2: Add Each Project**

For each application below, click "Add New" → "Import Git Repository":

##### **1. Backend (Priority: FIRST)**
- **GitHub Repo:** rasel606/kingbajiBack
- **Root Directory:** `backend`
- **Framework:** Other
- **Build Command:** (skip)
- **Output Directory:** `.`
- **After Deploy:** 
  - Add Environment Variables (Settings → Environment Variables):
    ```
    MONGODB_URI = your-mongodb-connection
    JWT_SECRET = your-jwt-secret-key
    API_KEY = your-api-key
    NODE_ENV = production
    ```
  - **COPY THE DEPLOYMENT URL** → `https://megabaji-backend.vercel.app`

---

##### **2. my-app (Affiliate Portal)**
- **GitHub Repo:** rasel606/png71-front (or your repo with my-app)
- **Root Directory:** `my-app`
- **Framework:** Create React App
- **Build Command:** `CI=false npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  ```
  REACT_APP_API_URL = https://megabaji-backend.vercel.app
  ```

---

##### **3. png71-front (Player Frontend)**
- **GitHub Repo:** rasel606/png71-front
- **Root Directory:** `.` (root - since this is the main repo)
- **Framework:** Create React App
- **Build Command:** `CI=false npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  ```
  REACT_APP_API_URL = https://megabaji-backend.vercel.app
  ```

---

##### **4. CoreUI (Main Admin Panel)**
- **GitHub Repo:** rasel606/kingbajiBack
- **Root Directory:** `coreui-free-react-admin-template-main`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://megabaji-backend.vercel.app
  ```

---

##### **5. agentPng71 (Agent Admin Panel)**
- **GitHub Repo:** rasel606/kingbajiBack
- **Root Directory:** `agentPng71`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://megabaji-backend.vercel.app
  ```

---

##### **6. SubAdminPng71 (Sub-Admin Panel)**
- **GitHub Repo:** rasel606/kingbajiBack
- **Root Directory:** `SubAdminPng71`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://megabaji-backend.vercel.app
  ```

---

##### **7. subAgentPng71 (Sub-Agent Panel)**
- **GitHub Repo:** rasel606/kingbajiBack
- **Root Directory:** `subAgentPng71`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://megabaji-backend.vercel.app
  ```

---

## 🎯 DEPLOYMENT SUMMARY

### **Expected URLs After Deployment:**

```
BACKEND:
✅ https://megabaji-backend.vercel.app

FRONTENDS:
✅ https://megabaji-affiliate.vercel.app (my-app)
✅ https://megabaji-player.vercel.app (png71-front)
✅ https://megabaji-admin.vercel.app (CoreUI)
✅ https://megabaji-agent.vercel.app (agentPng71)
✅ https://megabaji-subadmin.vercel.app (SubAdminPng71)
✅ https://megabaji-subagent.vercel.app (subAgentPng71)
```

---

## 🌐 NETLIFY ALTERNATIVE

Instead of Vercel, you can also deploy to Netlify:

1. Go to: https://app.netlify.com/
2. Click "Add new site"
3. Choose "Import an existing project"
4. Select GitHub
5. Choose repository: rasel606/kingbajiBack or rasel606/png71-front
6. Configure Base directory: (same as Vercel root directory above)
7. Deploy!

**Expected Netlify URLs:**
```
✅ https://megabaji-backend.netlify.app
✅ https://megabaji-affiliate.netlify.app
✅ https://megabaji-player.netlify.app
✅ https://megabaji-admin.netlify.app
✅ https://megabaji-agent.netlify.app
✅ https://megabaji-subadmin.netlify.app
✅ https://megabaji-subagent.netlify.app
```

---

## ⚡ IMPORTANT NOTES

1. **Deploy Backend First!** → All frontends depend on it
2. **Copy Backend URL** → Use for frontend env variables
3. **Set Environment Variables** → Before each frontend deploy
4. **MongoDB Atlas** → Whitelist IP: 0.0.0.0/0 for Vercel
5. **Test After Deploy** → Visit each URL and verify

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Go to Vercel dashboard: https://vercel.com/dashboard
- [ ] Deploy Backend first
- [ ] Copy backend deployment URL
- [ ] Add environment variables for backend
- [ ] Deploy all 6 frontends
- [ ] Add environment variables for each frontend
- [ ] Test all applications
- [ ] Set up custom domains (optional)
- [ ] Monitor error logs

---

## 🎬 GET STARTED NOW!

👉 **Open:** https://vercel.com/dashboard

**Then:**
1. Click "Add New" → "Project"
2. Import git repository
3. Follow the step-by-step instructions above

---

*Ready to go live in minutes!* 🚀
