# Vercel Deployment & CI/CD Guide

This guide walks you through deploying your Megabaji application to Vercel with automated CI/CD.

## Project Structure
- **Backend**: Node.js/Express API (serverless functions)
- **My-App**: React frontend (static site)
- **CoreUI**: React admin dashboard (static site)

## Prerequisites

1. **Vercel Account**: [Sign up at vercel.com](https://vercel.com/signup)
2. **GitHub Account**: Repository must be on GitHub for CI/CD
3. **Vercel CLI**: `npm install -g vercel`

## Step 1: Install Vercel CLI Locally

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

This will open a browser to authenticate your Vercel account.

## Step 3: Deploy Manually (Optional)

### Deploy Backend

```bash
cd backend
vercel deploy --prod
```

First deployment will prompt for:
- Project name: `megabaji-backend`
- Framework: `Other` (Node.js)
- Build command: `npm run build` (or skip)
- Output directory: `.` (root)

### Deploy My-App Frontend

```bash
cd my-app
vercel deploy --prod
```

First deployment will prompt for:
- Project name: `megabaji-myapp`
- Framework: `Create React App`
- Build command: `npm run build`
- Output directory: `build`

### Deploy CoreUI Admin

```bash
cd coreui-free-react-admin-template-main
vercel deploy --prod
```

First deployment will prompt for:
- Project name: `megabaji-admin`
- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `build`

## Step 4: Set Up GitHub Integration for CI/CD

### 4a. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Select **Import Git Repository**
4. Search for your repository: `kingbajiBack` (or your repo name)
5. Click **Import**

### 4b. Configure Each Project

For each project (Backend, My-App, CoreUI):

1. **Project Settings**:
   - Framework: Select appropriate framework
   - Build Command: See below
   - Output Directory: See below

2. **Backend**:
   - Framework: `Other`
   - Build Command: (skip - no build needed)
   - Output Directory: `.`
   - Root Directory: `./backend`

3. **My-App**:
   - Framework: `Create React App`
   - Build Command: `CI=false npm run build`
   - Output Directory: `build`
   - Root Directory: `./my-app`

4. **CoreUI**:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Root Directory: `./coreui-free-react-admin-template-main`

## Step 5: Add Environment Variables

### For Backend

In Vercel Dashboard → Project Settings → Environment Variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
NODE_ENV=production
```

### For My-App

```
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

### For CoreUI

```
VITE_API_URL=https://your-backend-url.vercel.app
```

## Step 6: GitHub Actions CI/CD Setup

#### 6a. Get Vercel Tokens

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token: **Create** → Copy token value
3. Note your Organization ID: Vercel Dashboard → Settings → General

#### 6b. Add GitHub Secrets

1. Go to GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret Name | Value |
|---|---|
| `VERCEL_TOKEN` | (Your Vercel token from step 6a) |
| `VERCEL_ORG_ID` | (Your Vercel Org ID from step 6a) |
| `VERCEL_PROJECT_ID_BACKEND` | (From Vercel project settings) |
| `VERCEL_PROJECT_ID_MYAPP` | (From Vercel project settings) |
| `VERCEL_PROJECT_ID_COREUI` | (From Vercel project settings) |

#### 6c. Get Project IDs

For each project in Vercel:
1. Open project settings
2. Look for **Project ID** in the top right
3. Copy the ID value

## Step 7: Automatic Deployments

Once GitHub Actions workflow is set up (`.github/workflows/deploy.yml`):

- **Push to `main` branch** → Auto deploys to production
- **Push to `develop` branch** → Auto deploys to staging
- **Create Pull Request** → Runs preview deployment

## Verify Deployment

### Check Status in Vercel Dashboard
- [Backend](https://vercel.com/dashboard)
- [My-App](https://vercel.com/dashboard)
- [CoreUI](https://vercel.com/dashboard)

### Test Endpoints

```bash
# Backend API
curl https://megabaji-backend.vercel.app/api/health

# My-App
https://megabaji-myapp.vercel.app

# CoreUI Admin
https://megabaji-admin.vercel.app
```

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Verify `vercel.json` configuration
3. Ensure all dependencies are in `package.json`
4. Check environment variables are set

### API Connection Issues

1. Update frontend `REACT_APP_API_URL` or `VITE_API_URL` to backend URL
2. Add CORS headers in backend
3. Check MongoDB connection string

### CI/CD Not Triggering

1. Verify workflow file is in `.github/workflows/deploy.yml`
2. Check GitHub Actions secrets are set correctly
3. Review Actions logs for errors

## Environment Variable Examples

### MongoDB Connection String
```
mongodb+srv://username:password@cluster.mongodb.net/megabaji?retryWrites=true&w=majority
```

### JWT Secret
Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js on Vercel](https://vercel.com/docs/concepts/runtimes/nodejs)

## Next Steps After Deployment

1. **Domain Setup**: Add custom domain in Vercel settings
2. **SSL Certificate**: Automatic with all Vercel deployments
3. **Monitoring**: Enable analytics in Vercel dashboard
4. **Logs**: Check real-time logs in Vercel dashboard
5. **Rollback**: Easy version rollback from dashboard
