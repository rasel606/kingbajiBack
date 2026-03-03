# 🚀 Complete Deployment Guide - Vercel & Netlify

This guide covers deploying all 7 MegaBaji applications to both Vercel and Netlify with automated CI/CD.

---

## 📦 Applications Overview

| # | Application | Type | Framework | Port (Local) |
|---|------------|------|-----------|--------------|
| 1 | **Backend** | API Server | Node.js/Express | 5000 |
| 2 | **my-app** | Affiliate Portal | React (CRA) | 3000 |
| 3 | **png71-front** | Player Frontend | React (CRA) | 3001 |
| 4 | **coreui-free-react-admin-template-main** | Main Admin | React (Vite) | 5173 |
| 5 | **agentPng71** | Agent Panel | React (Vite) | Auto |
| 6 | **SubAdminPng71** | Sub-Admin Panel | React (Vite) | Auto |
| 7 | **subAgentPng71** | Sub-Agent Panel | React (Vite) | Auto |

---

## 🎯 Quick Start - Automated Deployment

### Option 1: Deploy All Applications

#### Vercel:
```bash
# Double-click or run:
deploy-vercel-all.bat
```

#### Netlify:
```bash
# Double-click or run:
deploy-netlify-all.bat
```

### Option 2: Deploy Single Application

#### Vercel:
```bash
# Double-click or run:
deploy-vercel-single.bat
```

#### Netlify:
```bash
# Double-click or run:
deploy-netlify-single.bat
```

---

## 📋 Prerequisites

### 1. Install CLI Tools

#### Vercel CLI:
```bash
npm install -g vercel
```

#### Netlify CLI:
```bash
npm install -g netlify-cli
```

### 2. Login to Services

#### Vercel:
```bash
vercel login
```

#### Netlify:
```bash
netlify login
```

### 3. Accounts Required
- ✅ Vercel Account ([Sign up](https://vercel.com/signup))
- ✅ Netlify Account ([Sign up](https://app.netlify.com/signup))
- ✅ GitHub Account (for CI/CD)
- ✅ MongoDB Atlas (for database)

---

## 🔧 Manual Deployment Steps

### Vercel Deployment

#### 1. Backend Server
```bash
cd backend
vercel --prod
```

**First-time setup:**
- Project name: `megabaji-backend`
- Framework: Other (Node.js)
- Root directory: `./`
- Build command: (skip)
- Output directory: `./`

**Environment Variables:**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
API_KEY=your-api-key
NODE_ENV=production
```

---

#### 2. Affiliate Portal (my-app)
```bash
cd my-app
vercel --prod
```

**First-time setup:**
- Project name: `megabaji-affiliate`
- Framework: Create React App
- Build command: `CI=false npm run build`
- Output directory: `build`

**Environment Variables:**
```env
REACT_APP_API_URL=https://megabaji-backend.vercel.app
```

---

#### 3. Player Frontend (png71-front)
```bash
cd png71-front
vercel --prod
```

**First-time setup:**
- Project name: `megabaji-player`
- Framework: Create React App
- Build command: `CI=false npm run build`
- Output directory: `build`

**Environment Variables:**
```env
REACT_APP_API_URL=https://megabaji-backend.vercel.app
```

---

#### 4. Main Admin Panel (CoreUI)
```bash
cd coreui-free-react-admin-template-main
vercel --prod
```

**First-time setup:**
- Project name: `megabaji-admin`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `build`

**Environment Variables:**
```env
VITE_API_URL=https://megabaji-backend.vercel.app
```

---

#### 5. Agent Admin Panel (agentPng71)
```bash
cd agentPng71
vercel --prod
```

**First-time setup:**
- Project name: `megabaji-agent`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `build`

**Environment Variables:**
```env
VITE_API_URL=https://megabaji-backend.vercel.app
```

---

#### 6. Sub-Admin Panel (SubAdminPng71)
```bash
cd SubAdminPng71
vercel --prod
```

**First-time setup:**
- Project name: `megabaji-subadmin`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `build`

**Environment Variables:**
```env
VITE_API_URL=https://megabaji-backend.vercel.app
```

---

#### 7. Sub-Agent Panel (subAgentPng71)
```bash
cd subAgentPng71
vercel --prod
```

**First-time setup:**
- Project name: `megabaji-subagent`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `build`

**Environment Variables:**
```env
VITE_API_URL=https://megabaji-backend.vercel.app
```

---

### Netlify Deployment

#### 1. Backend Server
```bash
cd backend
netlify deploy --prod
```

**First-time setup:**
- Site name: `megabaji-backend`
- Publish directory: `.`
- Build command: `npm run build` (or skip)

**Environment Variables:**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
API_KEY=your-api-key
NODE_ENV=production
NODE_VERSION=18
```

---

#### 2-7. Frontend Applications
```bash
cd [app-directory]
netlify deploy --prod
```

**Common setup for all frontends:**
- Build command: See `netlify.toml` in each directory
- Publish directory: `build`
- Environment variables: See each app's `.env.example`

---

## 🤖 CI/CD Setup with GitHub

### Vercel GitHub Integration

#### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Select **Import Git Repository**
4. Choose your repository: `rasel606/kingbajiBack` or `rasel606/png71-front`
5. Click **Import**

#### Step 2: Configure Projects
For each application:

1. **Framework Preset:**
   - Backend: Other
   - React apps (CRA): Create React App
   - React apps (Vite): Vite

2. **Root Directory:**
   - Backend: `./backend`
   - my-app: `./my-app`
   - png71-front: `./png71-front`
   - CoreUI: `./coreui-free-react-admin-template-main`
   - agentPng71: `./agentPng71`
   - SubAdminPng71: `./SubAdminPng71`
   - subAgentPng71: `./subAgentPng71`

3. **Build Settings:**
   - See individual instructions above

4. **Environment Variables:**
   - Add all required env vars from `.env.example`

#### Step 3: Auto Deploy Settings
- **Production Branch:** `main`
- **Deploy on Push:** ✅ Enabled
- **Deploy Previews:** ✅ Enabled for all branches

---

### Netlify GitHub Integration

#### Step 1: Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Select **GitHub**
4. Choose your repository
5. Authorize Netlify

#### Step 2: Configure Build Settings
For each application:

1. **Base Directory:**
   - Specify the app folder (e.g., `backend`, `my-app`, etc.)

2. **Build Command:**
   - Reads from `netlify.toml` (already configured)

3. **Publish Directory:**
   - Reads from `netlify.toml` (already configured)

4. **Environment Variables:**
   - Add from `.env.example` for each app

#### Step 3: Deploy Settings
- **Production Branch:** `main`
- **Branch Deploys:** All branches
- **Deploy Previews:** Pull requests

---

## 🔐 Environment Variables Setup

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-key

# API Keys
API_KEY=your-api-key-here

# Environment
NODE_ENV=production
PORT=5000

# CORS
CORS_ORIGIN=https://your-frontend-url.vercel.app,https://your-admin-url.vercel.app
```

### Frontend Apps (.env)

#### my-app & png71-front (React CRA)
```env
REACT_APP_API_URL=https://megabaji-backend.vercel.app
REACT_APP_ENV=production
```

#### CoreUI, agentPng71, SubAdminPng71, subAgentPng71 (Vite)
```env
VITE_API_URL=https://megabaji-backend.vercel.app
VITE_ENV=production
```

---

## 📊 Deployment URLs (Example)

After deployment, your applications will be available at:

### Vercel:
```
Backend:        https://megabaji-backend.vercel.app
Affiliate:      https://megabaji-affiliate.vercel.app
Player:         https://megabaji-player.vercel.app
Admin:          https://megabaji-admin.vercel.app
Agent:          https://megabaji-agent.vercel.app
Sub-Admin:      https://megabaji-subadmin.vercel.app
Sub-Agent:      https://megabaji-subagent.vercel.app
```

### Netlify:
```
Backend:        https://megabaji-backend.netlify.app
Affiliate:      https://megabaji-affiliate.netlify.app
Player:         https://megabaji-player.netlify.app
Admin:          https://megabaji-admin.netlify.app
Agent:          https://megabaji-agent.netlify.app
Sub-Admin:      https://megabaji-subadmin.netlify.app
Sub-Agent:      https://megabaji-subagent.netlify.app
```

---

## 🔄 Workflow After Setup

### Automatic Deployments

Once GitHub integration is set up:

1. **Push to main branch** → Automatic production deployment
2. **Push to other branches** → Preview deployment
3. **Create Pull Request** → Preview deployment with URL

### Manual Deployments

```bash
# Production
vercel --prod
netlify deploy --prod

# Preview/Draft
vercel
netlify deploy
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Fails
**Problem:** Build fails during deployment

**Solutions:**
- Check build logs in dashboard
- Verify all dependencies in `package.json`
- Ensure environment variables are set
- Try building locally first: `npm run build`

#### 2. Environment Variables Not Working
**Problem:** App can't connect to backend

**Solutions:**
- Verify variable names match (REACT_APP_ or VITE_)
- Check values are correct (no trailing spaces)
- Redeploy after adding variables
- For Vercel: Project Settings → Environment Variables
- For Netlify: Site Settings → Environment Variables

#### 3. API Connection Failed
**Problem:** Frontend can't connect to backend

**Solutions:**
- Check CORS settings in backend
- Verify API URL in frontend env variables
- Check backend deployment is successful
- Test backend URL directly in browser

#### 4. MongoDB Connection Error
**Problem:** Backend can't connect to database

**Solutions:**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
- Ensure database user has correct permissions
- Test connection string locally first

#### 5. Deployment Limit Reached
**Problem:** Too many deployments

**Solutions:**
- **Vercel Free Plan:** 100 deployments/day
- **Netlify Free Plan:** 300 build minutes/month
- Upgrade to Pro plan if needed
- Use preview deployments wisely

---

## 📈 Monitoring Deployments

### Vercel Dashboard
1. View deployments: https://vercel.com/dashboard
2. Check build logs
3. View analytics
4. Monitor errors

### Netlify Dashboard
1. View sites: https://app.netlify.com/
2. Check deploy logs
3. View analytics
4. Monitor functions

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use different secrets for production
- ✅ Rotate secrets regularly
- ✅ Use strong JWT secrets (32+ characters)

### 2. API Security
- ✅ Enable CORS with specific origins
- ✅ Use HTTPS only in production
- ✅ Implement rate limiting
- ✅ Validate all inputs

### 3. Database Security
- ✅ Use MongoDB Atlas IP whitelist
- ✅ Strong database passwords
- ✅ Read-only users where appropriate
- ✅ Regular backups

---

## 📝 Deployment Checklist

### Before First Deployment:

- [ ] Install Vercel CLI (`npm install -g vercel`)
- [ ] Install Netlify CLI (`npm install -g netlify-cli`)
- [ ] Login to Vercel (`vercel login`)
- [ ] Login to Netlify (`netlify login`)
- [ ] Set up MongoDB Atlas database
- [ ] Create `.env` files for all apps
- [ ] Test all apps locally
- [ ] Commit all code to GitHub

### Backend Deployment:

- [ ] Set MONGODB_URI environment variable
- [ ] Set JWT_SECRET environment variable
- [ ] Set all API keys
- [ ] Configure CORS_ORIGIN with frontend URLs
- [ ] Test API endpoints after deployment

### Frontend Deployments:

- [ ] Set API_URL to backend deployment URL
- [ ] Update all frontend env variables
- [ ] Test builds locally (`npm run build`)
- [ ] Deploy and test each app
- [ ] Verify API connections work

### Post-Deployment:

- [ ] Test all application features
- [ ] Verify user authentication works
- [ ] Check database connections
- [ ] Test admin panels
- [ ] Monitor error logs
- [ ] Set up custom domains (optional)

---

## 🌐 Custom Domain Setup

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown
4. Wait for SSL certificate (automatic)

### Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records
4. SSL certificate auto-configured

---

## 📚 Additional Resources

### Documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

### Support:
- [Vercel Support](https://vercel.com/support)
- [Netlify Support](https://www.netlify.com/support/)

### Deployment Files:
- ✅ `vercel.json` - Vercel configuration (all apps)
- ✅ `netlify.toml` - Netlify configuration (all apps)
- ✅ `deploy-vercel-all.bat` - Deploy all apps to Vercel
- ✅ `deploy-netlify-all.bat` - Deploy all apps to Netlify
- ✅ `deploy-vercel-single.bat` - Deploy single app to Vercel
- ✅ `deploy-netlify-single.bat` - Deploy single app to Netlify

---

## 🎯 Next Steps

1. **Choose your platform:** Vercel or Netlify (or both!)
2. **Deploy backend first:** Required for all frontends
3. **Deploy frontends:** Update API URLs after backend deployment
4. **Set up CI/CD:** Connect GitHub for automatic deployments
5. **Monitor:** Check logs and analytics regularly
6. **Scale:** Upgrade plans as needed

---

## 💡 Tips for Success

### Performance:
- ✅ Use CDN for static assets
- ✅ Enable caching headers
- ✅ Optimize images before deployment
- ✅ Use lazy loading for components

### Cost Optimization:
- ✅ Use preview deployments sparingly
- ✅ Clean up old deployments
- ✅ Monitor usage dashboards
- ✅ Consider monorepo for multiple apps

### Debugging:
- ✅ Check deployment logs first
- ✅ Test builds locally before deploying
- ✅ Use environment-specific logging
- ✅ Monitor error tracking services

---

*Last Updated: March 4, 2026*
*All 7 applications configured for Vercel & Netlify deployment!* 🚀
