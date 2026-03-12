# HidenCloud Backend Deployment - Quick Start

## Prerequisites

1. **HidenCloud Account**: Sign up at https://hidencloud.com
2. **Git Repository**: Your backend pushed to GitHub (rasel606/kingbajiBack)
3. **Environment Variables**: Prepared and ready

## Method 1: Deploy via HidenCloud Dashboard (Recommended)

### Step 1: Connect GitHub
1. Log in to https://dashboard.hidencloud.com
2. Click "New Project" → "Connect Repository"
3. Select GitHub and authorize HidenCloud
4. Choose repository: `rasel606/kingbajiBack`
5. Select branch: `main`

### Step 2: Configure Deployment
1. **Root Directory**: Set to `/backend` 
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Port**: `5000`
5. **Node Version**: `18.x`

### Step 3: Add Environment Variables
In HidenCloud Dashboard → Settings → Environment Variables, add:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=Kingbaji
JWT_REFRESH_SECRET=KingbajiRefresh
API_OPERATOR_CODE=rbdb
API_SECRET_KEY=9332fd9144a3a1a8bd3ab7afac3100b0
API_BASE_URL=http://fetch.336699bet.com
CORS_ORIGIN=https://jackpotbd-8de5d.firebaseapp.com,https://jackpotbd-8de5d.web.app,http://localhost:3000
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=
REDIS_DB=0
CACHE_TTL=300
REFERRED_USERS_TTL=1800
```

### Step 4: Deploy
Click "Deploy" button and wait for deployment to complete.

---

## Method 2: Manual Deployment via Git Push

HidenCloud supports automatic deployment with Git push:

```bash
# Add HidenCloud as remote
git remote add hidencloud https://dashboard.hidencloud.com/git/your-project-id

# Deploy by pushing to HidenCloud
git push hidencloud main
```

---

## Method 3: Direct Upload via Dashboard

1. Go to HidenCloud Dashboard
2. Select your project
3. Click "Upload Code"
4. Upload the backend folder zip file
5. Configure build and deployment settings
6. Click "Deploy"

---

## Verify Deployment

Once deployed, verify the backend is running:

```bash
# Check health endpoint
curl https://your-project.hidencloud.com/api/health

# Check server info
curl https://your-project.hidencloud.com/api/info
```

---

## Post-Deployment Steps

### 1. Update Frontend CORS
In your frontend `.env`:
```
REACT_APP_API_URL=https://your-project.hidencloud.com/api
```

### 2. Update Database IP Whitelist
If using MongoDB Atlas:
1. Go to MongoDB Atlas Console
2. Network Access → Add IP Address
3. Add HidenCloud's IP address (available in deployment info)

### 3. Configure Custom Domain (Optional)
```bash
# In HidenCloud Dashboard:
1. Settings → Domains
2. Add Custom Domain
3. Update DNS records with provided CNAME
```

### 4. Set Up Monitoring
- Enable email alerts in HidenCloud Dashboard
- Monitor logs: Dashboard → Logs & Activity
- Check metrics: Dashboard → Analytics

---

## Troubleshooting

### Build Fails
- Check `package.json` exists and is valid
- Verify Node version is 18.x
- Run `npm install && npm start` locally to test

### Deployment Won't Start
- Check `index.js` exists and is executable
- Verify all environment variables are set
- Check logs for startup errors

### Application Crashes
- Review logs in Dashboard → Activity
- Verify MongoDB connection string
- Check Redis connection if using caching
- Ensure all required ports are accessible

### Cold Start Issues
- Increase memory allocation in settings
- Optimize startup code
- Use connection pooling for databases

---

## Environment Variables

### Required
- `NODE_ENV`: Set to `production`
- `PORT`: Set to `5000`
- `MONGODB_URI`: Full MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing

### Optional but Recommended
- `REDIS_URL`: Redis connection for caching
- `CORS_ORIGIN`: Frontend URL(s)
- `API_BASE_URL`: External API base URL

---

## Performance Tips

1. **Memory**: Start with 512MB, scale up as needed
2. **CPU**: Use auto-scaling if available
3. **Database Indexes**: Ensure MongoDB indexes are created
4. **Caching**: Use Redis for frequently accessed data
5. **Compression**: Enable gzip compression in Express

---

## Support

- **HidenCloud Docs**: https://docs.hidencloud.com
- **Status Page**: https://status.hidencloud.com
- **Support Email**: support@hidencloud.com

---

## Deployment Configuration Files

Three configuration files have been created:

1. **hidencloud.yaml** - Full deployment configuration
2. **deploy-hidencloud.sh** - Linux/Mac deployment script
3. **deploy-hidencloud.bat** - Windows batch deployment script

Use these files for reference when setting up HidenCloud deployment.

---

**Last Updated**: March 5, 2026  
**Project**: BajiCrick Backend  
**Version**: 1.0.0
