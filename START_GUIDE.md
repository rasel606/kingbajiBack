# BajiCrick Application Startup Guide

This guide explains how to run the complete BajiCrick application locally.

## Applications Overview

The project consists of 3 separate applications:

1. **Backend Server** - Node.js/Express API
   - Location: `backend/`
   - Port: `5000`
   - URL: http://localhost:5000

2. **CoreUI Admin Panel** - React Admin Dashboard (Vite)
   - Location: `coreui-free-react-admin-template-main/`
   - Port: `5173` (Vite default)
   - URL: http://localhost:5173
   - Proxy: Configured to proxy API requests to http://localhost:3000

3. **My App Frontend** - React Application (Create React App)
   - Location: `my-app/`
   - Port: `3000`
   - URL: http://localhost:3000

## Quick Start - Run All Applications

### Option 1: Run All at Once
Double-click `start-all.bat` to start all three applications simultaneously.

```bash
# Or run from command line:
start-all.bat
```

### Option 2: Run Individually

#### Start Backend Only
```bash
start-backend.bat
# Or manually:
cd backend
npm start
```

#### Start CoreUI Admin Only
```bash
start-coreui.bat
# Or manually:
cd coreui-free-react-admin-template-main
npm start
```

#### Start My App Frontend Only
```bash
start-myapp.bat
# Or manually:
cd my-app
npm start
```

## Development Mode

For development with auto-reload:

### Backend (with nodemon)
```bash
cd backend
npm run start-dev
```

### Frontend Applications
Frontend applications already have hot-reload enabled by default.

## Accessing the Applications

Once all applications are running:

- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173
- **Frontend App**: http://localhost:3000

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

1. Find the process using the port:
   ```bash
   netstat -ano | findstr :5000
   netstat -ano | findstr :3000
   netstat -ano | findstr :5173
   ```

2. Kill the process:
   ```bash
   taskkill /PID <process_id> /F
   ```

### Dependencies Issues
If you encounter module errors:

```bash
# Reinstall dependencies for each application
cd backend && npm install
cd ../coreui-free-react-admin-template-main && npm install
cd ../my-app && npm install
```

### Environment Variables
Make sure you have proper `.env` files in each directory:
- `backend/.env` - Database connection, API keys, ports
- `coreui-free-react-admin-template-main/.env` - Frontend config
- `my-app/.env` - Frontend config

## Stopping Applications

1. Press `Ctrl+C` in each terminal window
2. Or close the cmd/terminal windows

## Build for Production

### Backend
```bash
cd backend
# Backend runs directly with Node.js
node index.js
```

### CoreUI Admin
```bash
cd coreui-free-react-admin-template-main
npm run build
npm run serve
```

### My App
```bash
cd my-app
npm run build
# Then serve the build folder with a static server
```
