# 🔍 GitHub Secrets Complete Reference

**All Secrets Needed for GitHub CI/CD + Netlify Deployment**

---

## 📋 Complete Secrets List

Copy & paste this information into GitHub Secrets:
https://github.com/rasel606/kingbajiBack/settings/secrets/actions

### **Step 1: Click "New repository secret"**
### **Step 2: Copy each line below**
### **Step 3: Paste Name = Value**

---

## 🔐 13 Required Secrets

### **1️⃣ NETLIFY_AUTH_TOKEN**
```
Name: NETLIFY_AUTH_TOKEN
Value: <your-netlify-personal-access-token>

How to get:
1. Go to: https://app.netlify.com/account/applications
2. Click "Personal access tokens"
3. Click "New access token"
4. Copy the entire token
```

---

### **2️⃣ NETLIFY_BACKEND_SITE_ID**
```
Name: NETLIFY_BACKEND_SITE_ID
Value: <your-backend-netlify-site-id>

How to get:
1. Go to your Backend site on Netlify
2. Click: Site settings
3. Look for: Site ID (under Site details)
4. Copy the ID (example: abc123def456xyz)
```

---

### **3️⃣ NETLIFY_MYAPP_SITE_ID**
```
Name: NETLIFY_MYAPP_SITE_ID
Value: <your-myapp-netlify-site-id>

How to get:
1. Go to your my-app site on Netlify
2. Click: Site settings
3. Copy the Site ID
```

---

### **4️⃣ NETLIFY_PNG71_SITE_ID**
```
Name: NETLIFY_PNG71_SITE_ID
Value: <your-png71front-netlify-site-id>

How to get:
1. Go to your png71-front site on Netlify
2. Click: Site settings
3. Copy the Site ID
```

---

### **5️⃣ NETLIFY_COREUI_SITE_ID**
```
Name: NETLIFY_COREUI_SITE_ID
Value: <your-coreui-netlify-site-id>

How to get:
1. Go to your CoreUI site on Netlify
2. Click: Site settings
3. Copy the Site ID
```

---

### **6️⃣ NETLIFY_AGENT_SITE_ID**
```
Name: NETLIFY_AGENT_SITE_ID
Value: <your-agent-netlify-site-id>

How to get:
1. Go to your agentPng71 site on Netlify
2. Click: Site settings
3. Copy the Site ID
```

---

### **7️⃣ NETLIFY_SUBADMIN_SITE_ID**
```
Name: NETLIFY_SUBADMIN_SITE_ID
Value: <your-subadmin-netlify-site-id>

How to get:
1. Go to your SubAdminPng71 site on Netlify
2. Click: Site settings
3. Copy the Site ID
```

---

### **8️⃣ NETLIFY_SUBAGENT_SITE_ID**
```
Name: NETLIFY_SUBAGENT_SITE_ID
Value: <your-subagent-netlify-site-id>

How to get:
1. Go to your subAgentPng71 site on Netlify
2. Click: Site settings
3. Copy the Site ID
```

---

### **9️⃣ REACT_APP_API_URL**
```
Name: REACT_APP_API_URL
Value: https://your-backend-netlify-url.netlify.app

Example: https://megabaji-backend.netlify.app

This is used by React CRA apps:
- my-app
- png71-front

⚠️ Replace with your actual backend Netlify URL!
```

---

### **🔟 VITE_API_URL**
```
Name: VITE_API_URL
Value: https://your-backend-netlify-url.netlify.app

Example: https://megabaji-backend.netlify.app

This is used by Vite apps:
- CoreUI
- agentPng71
- SubAdminPng71
- subAgentPng71

⚠️ Same as REACT_APP_API_URL!
```

---

### **1️⃣1️⃣ MONGODB_URI**
```
Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/database

Example:
mongodb+srv://admin:pass123@megabaji-cluster.mongodb.net/megabaji

Get this from:
1. Go to: https://cloud.mongodb.com/
2. Go to "Connect" in your cluster
3. Copy connection string
4. Replace <username>, <password>, <database>

⚠️ This is for Backend only!
```

---

### **1️⃣2️⃣ JWT_SECRET**
```
Name: JWT_SECRET
Value: your-secret-jwt-key

Example: sk_prod_abcdef123456789xyz_ghi

Generate one:
npm run generate-secret
or use a strong random string

⚠️ Keep this SECRET! Don't share it!
⚠️ This is for Backend only!
```

---

### **1️⃣3️⃣ API_KEY**
```
Name: API_KEY
Value: your-api-key

Example: pk_live_abcdef12345xyz

Generate or get from:
- Your API provider dashboard
- Your .env file locally

⚠️ Keep this SECRET!
⚠️ This is for Backend only!
```

---

## ✅ Verification Checklist

After adding all 13 secrets:

```bash
# From terminal, run:
git add .github/workflows/
git commit -m "Add CI/CD workflows"
git push origin main

# Then check:
1. Go to: https://github.com/rasel606/kingbajiBack/actions
2. Should see workflows running
3. Check Netlify dashboard for deployments
```

---

## 🎯 Quick Copy-Paste Template

```
SECRET 1:  NETLIFY_AUTH_TOKEN = ______________________
SECRET 2:  NETLIFY_BACKEND_SITE_ID = ________________
SECRET 3:  NETLIFY_MYAPP_SITE_ID = __________________
SECRET 4:  NETLIFY_PNG71_SITE_ID = __________________
SECRET 5:  NETLIFY_COREUI_SITE_ID = _________________
SECRET 6:  NETLIFY_AGENT_SITE_ID = __________________
SECRET 7:  NETLIFY_SUBADMIN_SITE_ID = _______________
SECRET 8:  NETLIFY_SUBAGENT_SITE_ID = _______________
SECRET 9:  REACT_APP_API_URL = ______________________
SECRET 10: VITE_API_URL = ___________________________
SECRET 11: MONGODB_URI = ____________________________
SECRET 12: JWT_SECRET = _____________________________
SECRET 13: API_KEY = _______________________________
```

---

## 🔗 Where to Add Secrets

**GitHub Secrets Dashboard:**
https://github.com/rasel606/kingbajiBack/settings/secrets/actions

**Steps:**
1. Click: **"New repository secret"**
2. Enter: **Name** (from list above)
3. Enter: **Value** (your actual value)
4. Click: **"Add secret"**
5. Repeat for all 13 secrets

---

## 🧪 Test with These Commands

After adding secrets:

```bash
# cd to project
cd E:\megabaji-2

# Make small change
echo "# Test deployment" >> README.md

# Push to GitHub
git add .
git commit -m "Test CI/CD setup"
git push origin main

# Watch it deploy!
# Go to: https://github.com/rasel606/kingbajiBack/actions
```

---

## 🆘 If Deployment Fails

1. Check GitHub Actions logs:
   https://github.com/rasel606/kingbajiBack/actions

2. Common errors:
   - ❌ `auth/unauthorized` → NETLIFY_AUTH_TOKEN is wrong
   - ❌ `Site not found` → NETLIFY_*_SITE_ID is wrong
   - ❌ `Build failed` → REACT_APP_API_URL or VITE_API_URL wrong

3. Fix by:
   - Update the secret in GitHub
   - Re-run the workflow

---

## 📱 Environment Variables by App

### **Backend** (backend/)
Uses: `MONGODB_URI`, `JWT_SECRET`, `API_KEY`, `NODE_ENV`

### **React CRA Apps** (my-app, png71-front)
Uses: `REACT_APP_API_URL`

### **Vite Apps** (CoreUI, agentPng71, SubAdminPng71, subAgentPng71)
Uses: `VITE_API_URL`

---

## 💡 Pro Tips

- ✅ Secrets are encrypted on GitHub - safe!
- ✅ Only visible to GitHub Actions
- ✅ Rotate tokens every 90 days
- ✅ Use strong random strings for passwords
- ✅ Copy exact URLs - no trailing slashes!

---

## 🎯 After All Secrets Added

Your CI/CD is ready to go!

Every time you push to `main`:
1. ✅ GitHub Actions runs
2. ✅ App builds
3. ✅ Deploys to Netlify
4. ✅ App is LIVE!

No manual work needed! 🚀

---

*Secrets reference: March 4, 2026*
