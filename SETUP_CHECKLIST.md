# ✅ GitHub CI/CD + Netlify Deployment Checklist

**Complete Setup in 15 Minutes** ⏱️

---

## 📋 Checklist Items

### **Phase 1: Netlify Setup (5 minutes)**

- [ ] **1.1** Create Netlify account: https://app.netlify.com/signup
- [ ] **1.2** Go to account settings → Applications
- [ ] **1.3** Create "Personal access token" named `github-deployment`
- [ ] **1.4** **SAVE THIS TOKEN** - you'll need it for GitHub secrets

### **Phase 2: Create Netlify Sites (8 minutes)**

For each app, you'll create a Netlify site one time:

- [ ] **2.1** Backend Site
  - [ ] Create on Netlify with manual deploy
  - [ ] Upload `backend` folder
  - [ ] **COPY & SAVE Site ID** as `NETLIFY_BACKEND_SITE_ID`

- [ ] **2.2** my-app Site
  - [ ] Create on Netlify with manual deploy
  - [ ] Upload `my-app/build` folder
  - [ ] **COPY & SAVE Site ID** as `NETLIFY_MYAPP_SITE_ID`

- [ ] **2.3** png71-front Site
  - [ ] Create on Netlify with manual deploy
  - [ ] Upload `png71-front/build` folder
  - [ ] **COPY & SAVE Site ID** as `NETLIFY_PNG71_SITE_ID`

- [ ] **2.4** CoreUI Site
  - [ ] Create on Netlify with manual deploy
  - [ ] Upload `coreui-free-react-admin-template-main/build` folder
  - [ ] **COPY & SAVE Site ID** as `NETLIFY_COREUI_SITE_ID`

- [ ] **2.5** agentPng71 Site
  - [ ] Create on Netlify with manual deploy
  - [ ] Upload `agentPng71/build` folder
  - [ ] **COPY & SAVE Site ID** as `NETLIFY_AGENT_SITE_ID`

- [ ] **2.6** SubAdminPng71 Site
  - [ ] Create on Netlify with manual deploy
  - [ ] Upload `SubAdminPng71/build` folder
  - [ ] **COPY & SAVE Site ID** as `NETLIFY_SUBADMIN_SITE_ID`

- [ ] **2.7** subAgentPng71 Site
  - [ ] Create on Netlify with manual deploy
  - [ ] Upload `subAgentPng71/build` folder
  - [ ] **COPY & SAVE Site ID** as `NETLIFY_SUBAGENT_SITE_ID`

### **Phase 3: GitHub Secrets Setup (2 minutes)**

Go to: https://github.com/rasel606/kingbajiBack/settings/secrets/actions

Add these secrets one by one:

**Netlify Authentication:**
- [ ] **3.1** Add Secret: `NETLIFY_AUTH_TOKEN` = (your Netlify token from 1.4)

**Netlify Site IDs:**
- [ ] **3.2** Add Secret: `NETLIFY_BACKEND_SITE_ID` = (from 2.1)
- [ ] **3.3** Add Secret: `NETLIFY_MYAPP_SITE_ID` = (from 2.2)
- [ ] **3.4** Add Secret: `NETLIFY_PNG71_SITE_ID` = (from 2.3)
- [ ] **3.5** Add Secret: `NETLIFY_COREUI_SITE_ID` = (from 2.4)
- [ ] **3.6** Add Secret: `NETLIFY_AGENT_SITE_ID` = (from 2.5)
- [ ] **3.7** Add Secret: `NETLIFY_SUBADMIN_SITE_ID` = (from 2.6)
- [ ] **3.8** Add Secret: `NETLIFY_SUBAGENT_SITE_ID` = (from 2.7)

**API URLs (for React/Vite to connect to backend):**
- [ ] **3.9** Add Secret: `REACT_APP_API_URL` = `https://your-backend-netlify-url.netlify.app`
- [ ] **3.10** Add Secret: `VITE_API_URL` = `https://your-backend-netlify-url.netlify.app`

**Backend Environment Variables:**
- [ ] **3.11** Add Secret: `MONGODB_URI` = (your MongoDB connection string)
- [ ] **3.12** Add Secret: `JWT_SECRET` = (your JWT secret key)
- [ ] **3.13** Add Secret: `API_KEY` = (your API key)

### **Phase 4: Activate Workflows (1 minute)**

- [ ] **4.1** Open terminal and go to project root:
  ```bash
  cd E:\megabaji-2
  ```

- [ ] **4.2** Stage the workflows:
  ```bash
  git add .github/workflows/
  ```

- [ ] **4.3** Commit:
  ```bash
  git commit -m "Add GitHub Actions CI/CD workflows"
  ```

- [ ] **4.4** Push to GitHub:
  ```bash
  git push origin main
  ```

---

## 🧪 Test the Setup

### **Verify Workflows Exist:**

1. [ ] Go to: https://github.com/rasel606/kingbajiBack
2. [ ] Click: **Actions** tab
3. [ ] Should see 6 workflows listed

### **Trigger First Deployment:**

1. [ ] Make a small change (e.g., add comment to README)
2. [ ] Commit: `git add . && git commit -m "Test CI/CD"`
3. [ ] Push: `git push origin main`
4. [ ] Go to **Actions** tab and watch it run
5. [ ] Check Netlify dashboard for deployment

### **Verify All Deployments:**

- [ ] Backend deployed: https://app.netlify.com/
- [ ] my-app deployed: https://app.netlify.com/
- [ ] png71-front deployed: https://app.netlify.com/
- [ ] CoreUI deployed: https://app.netlify.com/
- [ ] agentPng71 deployed: https://app.netlify.com/
- [ ] SubAdminPng71 deployed: https://app.netlify.com/
- [ ] subAgentPng71 deployed: https://app.netlify.com/

---

## 📊 After Checklist Complete

### **Your Workflow Is Now:**

```
You push code → GitHub Actions runs → Deploys to Netlify → App is LIVE ✅
```

### **Key Dashboards:**

- **GitHub Actions:** https://github.com/rasel606/kingbajiBack/actions
- **Netlify Sites:** https://app.netlify.com/
- **GitHub Settings:** https://github.com/rasel606/kingbajiBack/settings

---

## 🚨 Troubleshooting Checklist

### ❌ Workflow Didn't Run?

- [ ] Check if secrets are added
- [ ] Check if commit was to `main` branch
- [ ] Check file paths (.yml files in `.github/workflows/`)
- [ ] Check GitHub Actions tab for error logs

### ❌ Deployment Failed?

- [ ] Check Netlify build logs
- [ ] Verify Site IDs are correct
- [ ] Verify NETLIFY_AUTH_TOKEN is correct
- [ ] Check if environment variables are set

### ❌ App Can't Connect to Backend?

- [ ] Verify REACT_APP_API_URL = backend Netlify URL
- [ ] Verify VITE_API_URL = backend Netlify URL
- [ ] Check backend is deployed first
- [ ] Check CORS enabled in backend

### ❌ Got "auth/unauthorized" Error?

- [ ] Regenerate Netlify token
- [ ] Update GitHub secret with new token
- [ ] Re-run workflow manually

---

## 📚 Documentation Files

All guides are in your project root:

1. **[GITHUB_CICD_SETUP_GUIDE.md](./GITHUB_CICD_SETUP_GUIDE.md)** - Detailed setup instructions
2. **[NETLIFY_SETUP_COMPLETE.md](./NETLIFY_SETUP_COMPLETE.md)** - Netlify deployment details
3. **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** - Quick reference
4. **[COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)** - Full deployment guide

---

## 🎯 Success Indicators

✅ **Setup Complete When:**

- [ ] All 13 GitHub secrets are added
- [ ] All 7 Netlify sites are created
- [ ] Workflows are pushed to GitHub
- [ ] Actions tab shows workflow runs
- [ ] Deployments appear in Netlify dashboard
- [ ] Apps load on their Netlify URLs
- [ ] Frontends can reach backend API

---

## 💡 Pro Tips

### **Faster Deployments:**

- Only changed files trigger their workflows
- Backend changes don't redeploy frontends
- Saves GitHub Actions minutes & time

### **Preview Deployments:**

- Create PR on GitHub
- Netlify auto-creates preview URL
- Share with team for testing
- No production impact

### **Rollback Quickly:**

- Netlify keeps deployment history
- Click "Rollback to previous" if needed
- GitHub has branch history too

---

## 📞 Quick Links

| Task | Link |
|------|------|
| Netlify Dashboard | https://app.netlify.com/ |
| GitHub Actions | https://github.com/rasel606/kingbajiBack/actions |
| GitHub Secrets | https://github.com/rasel606/kingbajiBack/settings/secrets/actions |
| Netlify Docs | https://docs.netlify.com/ |
| GitHub Actions Docs | https://docs.github.com/en/actions |

---

## ⏱️ Estimated Timeline

```
Phase 1 (Netlify Setup):        5 minutes
Phase 2 (Create Sites):         8 minutes
Phase 3 (GitHub Secrets):       2 minutes
Phase 4 (Activate Workflows):   1 minute
Testing:                        3 minutes
                               ━━━━━━━━
Total:                         19 minutes ✅
```

**After this, deployments are automatic!** 🚀

---

*Checklist created: March 4, 2026*  
*Status: Ready to complete!* ✅
