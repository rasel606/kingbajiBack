# HidenCloud Deployment Guide - Backend

This guide explains how to deploy the BajiCrick Backend to HidenCloud.com.

## Prerequisites

1. HidenCloud account (create at https://hidencloud.com)
2. HidenCloud CLI installed globally
3. Git repository pushed to GitHub/GitLab
4. Environment variables configured

## Step 1: Install HidenCloud CLI

```bash
npm install -g hidencloud-cli
# or
curl -fsSL https://cli.hidencloud.com/install.sh | bash
```

## Step 2: Login to HidenCloud

```bash
hidencloud auth login
# Follow the prompts to authenticate with your HidenCloud account
```

## Step 3: Configure Environment Variables

Before deployment, set up your environment variables in HidenCloud Dashboard:

**Required Variables:**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
API_OPERATOR_CODE=your_operator_code
API_SECRET_KEY=your_secret_key
API_BASE_URL=http://fetch.336699bet.com
CORS_ORIGIN=https://your-frontend.com,http://localhost:3000
REDIS_URL=redis://your-redis-url:6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
```

**Option 1: Via Dashboard**
1. Go to HidenCloud Dashboard
2. Create new project → Select "Backend"
3. Connect GitHub repository
4. Go to Settings → Environment Variables
5. Add all variables from above

**Option 2: Via CLI**
```bash
hidencloud env set MONGODB_URI "mongodb+srv://..."
hidencloud env set JWT_SECRET "your_secret"
# ... add all other variables
```

## Step 4: Deploy from GitHub (Recommended)

### Option A: Automatic Deployment from GitHub

1. Connect your GitHub repository:
```bash
hidencloud connect github
```

2. Select the repository: `rasel606/kingbajiBack`

3. Set deployment branch: `main`

4. Configure deployment settings:
   - Root directory: `/backend` (current folder)
   - Build command: `npm install`
   - Start command: `npm start`
   - Port: `5000`

5. Click "Deploy"

### Option B: Manual Deployment via CLI

```bash
# From the backend directory
cd /path/to/backend

# Create new HidenCloud project
hidencloud projects:create bajicrick-backend

# Set the project
hidencloud projects:select bajicrick-backend

# Deploy
hidencloud deploy

# View deployment logs
hidencloud logs --follow
```

## Step 5: Verify Deployment

After deployment, verify everything is working:

```bash
# Check deployment status
hidencloud status

# Check logs
hidencloud logs

# Test health endpoint
curl https://your-app.hidencloud.com/api/health

# Test a specific endpoint
curl https://your-app.hidencloud.com/api/users/profile
```

## Step 6: Configure Custom Domain (Optional)

```bash
# Add custom domain
hidencloud domains:add yourdomain.com

# Verify DNS records (HidenCloud will provide)
# Add CNAME or A record to your DNS provider
```

## Deployment Configuration Files

### hidencloud.yaml
Main configuration file for HidenCloud deployment. Located in backend root directory.

Key sections:
- `runtime`: Node.js version and engine
- `build`: Build process (npm install)
- `start`: Start command and port
- `environment`: Environment variables
- `healthcheck`: Health check endpoint configuration
- `resources`: Memory, CPU, disk allocation
- `regions`: Deployment regions

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `REDIS_URL` | Redis connection URL | `redis://host:6379` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://app.com,http://localhost:3000` |

## Troubleshooting

### Build Fails
```bash
# Check logs
hidencloud logs --source=build

# Verify package.json exists and dependencies are correct
npm install --dry-run
```

### App Won't Start
```bash
# Check startup logs
hidencloud logs --source=runtime

# Verify start command works locally
npm start
```

### Database Connection Issues
```bash
# Verify MongoDB connection string
# Ensure your IP is whitelisted in MongoDB Atlas
# Check firewall and security settings
```

### Redis Connection Issues
```bash
# Test Redis connection locally
redis-cli -u $REDIS_URL PING

# Verify Redis credentials and URL
```

## Useful HidenCloud CLI Commands

```bash
# Project Management
hidencloud projects:list              # List all projects
hidencloud projects:select            # Select active project
hidencloud projects:delete            # Delete a project

# Environment Management
hidencloud env:list                   # List environment variables
hidencloud env:set KEY VALUE          # Set variable
hidencloud env:unset KEY              # Remove variable

# Logs and Monitoring
hidencloud logs                       # View logs
hidencloud logs --follow              # Stream logs in real-time
hidencloud metrics                    # View performance metrics

# Deployment
hidencloud deploy                     # Deploy current directory
hidencloud rollback                   # Rollback to previous version
hidencloud status                     # Check deployment status

# Scaling
hidencloud scale --memory 1024MB      # Increase memory
hidencloud scale --cpu 2              # Increase CPU cores
```

## Auto-Deployment Setup

To enable automatic deployments when you push to GitHub:

1. Configure GitHub webhook in HidenCloud Dashboard
2. Set branch to deploy: `main`
3. Every push to main will trigger automatic deployment

## Monitoring

- **HidenCloud Dashboard**: Real-time metrics and logs
- **Health Checks**: Automated monitoring at `/api/health`
- **Email Alerts**: Configure in project settings
- **Slack Integration**: Connect for notifications

## Performance Tips

1. **Use Redis Caching**: Configured for session and data caching
2. **Database Indexing**: Ensure MongoDB indexes are set up
3. **Memory Limits**: Start with 512MB, scale as needed
4. **Region Selection**: Choose region close to users

## Next Steps

1. ✅ Configure environment variables
2. ✅ Connect GitHub repository
3. ✅ Deploy to HidenCloud
4. ✅ Test endpoints
5. ✅ Set up custom domain
6. ✅ Configure monitoring alerts
7. ✅ Set up auto-deployments

## Support

- HidenCloud Docs: https://docs.hidencloud.com
- Contact Support: support@hidencloud.com
- Status Page: https://status.hidencloud.com

---

**Last Updated**: March 5, 2026
**Backend Version**: 1.0.0
**Node Version**: 18.x
