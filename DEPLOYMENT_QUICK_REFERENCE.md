# 🚀 Quick Deployment Commands

## 📦 Installation

```bash
# Install CLIs
npm install -g vercel netlify-cli

# Login
vercel login
netlify login
```

---

## ⚡ Quick Deploy - All Apps

### Vercel
```bash
deploy-vercel-all.bat          # Windows
```

### Netlify
```bash
deploy-netlify-all.bat         # Windows
```

---

## 🎯 Quick Deploy - Single App

### Vercel
```bash
deploy-vercel-single.bat       # Windows - Menu-driven
```

### Netlify
```bash
deploy-netlify-single.bat      # Windows - Menu-driven
```

---

## 📋 Manual Commands

### Backend
```bash
# Vercel
cd backend && vercel --prod

# Netlify
cd backend && netlify deploy --prod
```

### my-app (Affiliate Portal)
```bash
# Vercel
cd my-app && vercel --prod

# Netlify
cd my-app && netlify deploy --prod
```

### png71-front (Player Frontend)
```bash
# Vercel
cd png71-front && vercel --prod

# Netlify
cd png71-front && netlify deploy --prod
```

### CoreUI (Main Admin)
```bash
# Vercel
cd coreui-free-react-admin-template-main && vercel --prod

# Netlify
cd coreui-free-react-admin-template-main && netlify deploy --prod
```

### agentPng71 (Agent Panel)
```bash
# Vercel
cd agentPng71 && vercel --prod

# Netlify
cd agentPng71 && netlify deploy --prod
```

### SubAdminPng71 (Sub-Admin)
```bash
# Vercel
cd SubAdminPng71 && vercel --prod

# Netlify
cd SubAdminPng71 && netlify deploy --prod
```

### subAgentPng71 (Sub-Agent)
```bash
# Vercel
cd subAgentPng71 && vercel --prod

# Netlify
cd subAgentPng71 && netlify deploy --prod
```

---

## 🔧 Environment Variables

### Backend
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
API_KEY=your-key
NODE_ENV=production
```

### React CRA Apps (my-app, png71-front)
```env
REACT_APP_API_URL=https://your-backend.vercel.app
```

### Vite Apps (CoreUI, agentPng71, SubAdminPng71, subAgentPng71)
```env
VITE_API_URL=https://your-backend.vercel.app
```

---

## 📊 Dashboard URLs

- **Vercel:** https://vercel.com/dashboard
- **Netlify:** https://app.netlify.com/

---

## 🔄 GitHub CI/CD

### Auto-deploy on push to main:
1. Connect repo in Vercel/Netlify dashboard
2. Select project root directory
3. Set environment variables
4. Push to main → Auto deploy ✅

---

## 🐛 Quick Fixes

### Build Failed
```bash
# Test build locally first
npm run build

# Check logs in dashboard
# Verify environment variables set
```

### API Not Connecting
```bash
# Check CORS in backend
# Verify API_URL in frontend env
# Redeploy after env changes
```

### MongoDB Error
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string
# Check database user permissions
```

---

## 📁 Configuration Files

All apps have these files ready:
- ✅ `vercel.json` - Vercel config
- ✅ `netlify.toml` - Netlify config

---

## 🎯 Deployment Order

1. **Backend first** (required by all frontends)
2. Copy backend URL
3. **Update frontend env variables** with backend URL
4. **Deploy all frontends**

---

*Quick Reference - See [COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md) for details*
