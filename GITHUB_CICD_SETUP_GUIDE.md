# 🚀 GitHub CI/CD Auto-Deployment Setup Guide

**Status:** Ready to Configure ✅  
**Platform:** Netlify  
**Date:** March 4, 2026

---

## 📋 Overview

This guide walks you through setting up **automatic deployment** to **Netlify** whenever you push code to GitHub.

### **What Happens:**
- ✅ Push code to GitHub `main` branch
- ✅ GitHub Actions automatically builds your app
- ✅ Automatic deployment to Netlify
- ✅ Your app is LIVE in minutes!

---

## 🎯 6 GitHub Actions Workflows Created

All workflows are ready in `.github/workflows/`:

1. ✅ `deploy-backend-netlify.yml` - Backend API
2. ✅ `deploy-myapp-netlify.yml` - Affiliate Portal
3. ✅ `deploy-png71-netlify.yml` - Player Frontend
4. ✅ `deploy-coreui-netlify.yml` - Main Admin
5. ✅ `deploy-agent-netlify.yml` - Agent Panel
6. ✅ `deploy-subadmin-netlify.yml` - Sub-Admin
7. ✅ `deploy-subagent-netlify.yml` - Sub-Agent

---

## 📋 Step 1: Create Netlify Personal Access Token

### **Go to Netlify:**
1. Open: https://app.netlify.com/
2. Click your profile → **"User settings"**
3. Go to: **"Applications" → "Personal access tokens"**
4. Click: **"New access token"**
5. Name it: `github-deployment` (or any name)
6. Copy the token → **Save it somewhere safe!**

---

## 📋 Step 2: Create Netlify Sites (One for Each App)

For each application, you need a Netlify site:

### **Backend:**
1. Create new site on Netlify
2. Manual deploy → choose `backend` folder
3. Go to: **Site settings → Domain management**
4. Copy **Site ID** → Save as `NETLIFY_BACKEND_SITE_ID`

### **my-app (Affiliate Portal):**
1. Create new site
2. Manual deploy → choose `my-app/build` folder
3. Copy **Site ID** → Save as `NETLIFY_MYAPP_SITE_ID`

### **png71-front (Player Frontend):**
1. Create new site
2. Manual deploy → choose `png71-front/build` folder
3. Copy **Site ID** → Save as `NETLIFY_PNG71_SITE_ID`

### **CoreUI (Main Admin):**
1. Create new site
2. Manual deploy → choose `coreui-free-react-admin-template-main/build` folder
3. Copy **Site ID** → Save as `NETLIFY_COREUI_SITE_ID`

### **agentPng71 (Agent Panel):**
1. Create new site
2. Manual deploy → choose `agentPng71/build` folder
3. Copy **Site ID** → Save as `NETLIFY_AGENT_SITE_ID`

### **SubAdminPng71 (Sub-Admin):**
1. Create new site
2. Manual deploy → choose `SubAdminPng71/build` folder
3. Copy **Site ID** → Save as `NETLIFY_SUBADMIN_SITE_ID`

### **subAgentPng71 (Sub-Agent):**
1. Create new site
2. Manual deploy → choose `subAgentPng71/build` folder
3. Copy **Site ID** → Save as `NETLIFY_SUBAGENT_SITE_ID`

---

## 📋 Step 3: Add GitHub Secrets

### **Go to GitHub:**
1. Open: https://github.com/rasel606/kingbajiBack (your repo)
2. Click: **Settings → Secrets and variables → Actions**
3. Click: **"New repository secret"**

### **Add These Secrets:**

```
NETLIFY_AUTH_TOKEN = <your-netlify-token-from-step-1>

NETLIFY_BACKEND_SITE_ID = <your-backend-site-id>
NETLIFY_MYAPP_SITE_ID = <your-myapp-site-id>
NETLIFY_PNG71_SITE_ID = <your-png71-site-id>
NETLIFY_COREUI_SITE_ID = <your-coreui-site-id>
NETLIFY_AGENT_SITE_ID = <your-agent-site-id>
NETLIFY_SUBADMIN_SITE_ID = <your-subadmin-site-id>
NETLIFY_SUBAGENT_SITE_ID = <your-subagent-site-id>

REACT_APP_API_URL = https://your-backend-netlify-url.netlify.app
VITE_API_URL = https://your-backend-netlify-url.netlify.app

MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET = your-jwt-secret-key
API_KEY = your-api-key
```

---

## 🔐 How to Find Netlify Site IDs

For each Netlify site:

1. Go to site on Netlify
2. Click: **Site settings**
3. Look for: **Site details**
4. Copy value under: **Site ID** (usually alphanumeric like `abc123def456`)
5. Save each one with the corresponding environment variable name

---

## ✅ Step 4: Commit and Push Workflows

### **First time setup:**

```bash
# Make sure you're in the project root
cd E:\megabaji-2

# Add the workflows to git
git add .github/workflows/

# Commit
git commit -m "Add GitHub Actions CI/CD workflows for Netlify deployment"

# Push to GitHub
git push origin main
```

**Result:** Your workflows are now in GitHub! 🎉

---

## 🚀 Step 5: Test the Automation

### **Make a Small Change to Trigger Deployment:**

```bash
# Edit any file (example: backend package.json or any file)
# Or just add a comment to README

# Push to GitHub
git add .
git commit -m "Test CI/CD deployment"
git push origin main
```

### **Watch it Deploy:**

1. Go to GitHub: https://github.com/rasel606/kingbajiBack
2. Click: **Actions** tab
3. Watch the workflow run!
4. Check Netlify dashboard: https://app.netlify.com/

---

## 📊 Workflow Behavior

### **What Each Workflow Does:**

#### **On Push to `main`:**
- ✅ Runs tests (if configured)
- ✅ Builds the application
- ✅ Deploys to **production** on Netlify (`--prod`)

#### **On Pull Request:**
- ✅ Builds the application
- ✅ Creates **preview deployment** on Netlify
- ✅ Adds deployment URL to PR comments

#### **Conditional Deployment:**
- Only deploys if files in that app's folder changed
- Saves CI/CD minutes!

---

## 🎯 Expected Workflow Runs

After pushing code:

1. **Backend:** Deploys when `backend/**` changes
2. **my-app:** Deploys when `my-app/**` changes
3. **png71-front:** Deploys when `png71-front/**` changes
4. **CoreUI:** Deploys when `coreui-free-react-admin-template-main/**` changes
5. **Agent:** Deploys when `agentPng71/**` changes
6. **Sub-Admin:** Deploys when `SubAdminPng71/**` changes
7. **Sub-Agent:** Deploys when `subAgentPng71/**` changes

---

## 📱 Monitor Deployments

### **GitHub:**
- Open: https://github.com/rasel606/kingbajiBack/actions
- Click workflow to see logs
- See deployment status in real-time

### **Netlify:**
- Open: https://app.netlify.com/
- Click each site
- See deployment history
- View build logs

---

## 🔐 Security Best Practices

✅ **Secrets are hidden** - Never shown in logs  
✅ **Token rotation** - Regenerate tokens periodically  
✅ **Branch protection** - Only main branch deploys to production  
✅ **Preview deploys** - PRs get preview URLs for testing  

---

## 🛠️ Troubleshooting

### ❌ Workflow Failed?

1. Check GitHub Actions logs
2. Usually missing environment variables
3. Verify all secrets are added correctly
4. Check Site IDs match actual Netlify sites

### ❌ Deployment Didn't Happen?

1. Make sure change is in watched path
2. Check workflow triggers in `.yml` file
3. Ensure branch is `main`
4. Verify secrets are set

### ❌ Can't Find Netlify Site ID?

1. Go to site on Netlify
2. Site settings → General
3. Look for "Site details" section
4. Copy the "Site ID" value

---

## 📋 Complete Checklist

- [ ] Create Netlify Personal Access Token
- [ ] Create 7 Netlify sites (one for each app)
- [ ] Record all Site IDs
- [ ] Add all GitHub Secrets (14 total)
- [ ] Commit workflows to GitHub
- [ ] Push to main branch
- [ ] Check GitHub Actions tab
- [ ] Verify deployment on Netlify
- [ ] Test each app URL

---

## 🎉 After Setup Complete

### **From Now On:**
1. Work on your code
2. Push to GitHub
3. GitHub Actions automatically:
   - ✅ Builds your app
   - ✅ Runs tests
   - ✅ Deploys to Netlify
4. Your app is LIVE!

**No manual deployments needed!** 🚀

---

## 📚 Reference

### **Files Created:**
- `.github/workflows/deploy-backend-netlify.yml`
- `.github/workflows/deploy-myapp-netlify.yml`
- `.github/workflows/deploy-png71-netlify.yml`
- `.github/workflows/deploy-coreui-netlify.yml`
- `.github/workflows/deploy-agent-netlify.yml`
- `.github/workflows/deploy-subadmin-netlify.yml`
- `.github/workflows/deploy-subagent-netlify.yml`

### **Dashboard Links:**
- GitHub: https://github.com/rasel606/kingbajiBack/actions
- Netlify: https://app.netlify.com/
- GitHub Secrets: https://github.com/rasel606/kingbajiBack/settings/secrets/actions

---

## ❓ Need Help?

- Review workflow syntax: https://docs.github.com/en/actions
- Netlify docs: https://docs.netlify.com/
- Check logs in GitHub Actions for detailed error messages

---

*Setup completed: March 4, 2026*
*All workflows ready for auto-deployment!* ✅
