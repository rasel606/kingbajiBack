# 📖 Individual Application Startup Guide

This guide explains how to start each application individually for development.

## 🎯 Available Applications

1. **Backend Server** - API & Database
2. **my-app** - Affiliate Portal
3. **png71-front** - Player Gaming Frontend
4. **coreui-free-react-admin-template-main** - Main Admin Dashboard
5. **agentPng71** - Agent Admin Panel
6. **SubAdminPng71** - Sub-Admin Panel
7. **subAgentPng71** - Sub-Agent Panel

---

## 🚀 Method 1: Using Batch Files (Windows)

### Quick Start - Double Click These Files:

```
📄 start-backend.bat        → Backend API Server
📄 start-myapp.bat          → Affiliate Portal
📄 start-png71-front.bat    → Player Frontend
📄 start-coreui.bat         → Main Admin Dashboard
📄 start-agent-panel.bat    → Agent Admin Panel
📄 start-subadmin.bat       → Sub-Admin Panel
📄 start-subagent-panel.bat → Sub-Agent Panel
```

Simply double-click any `.bat` file to start that application.

---

## 🛠️ Method 2: Manual Commands

### 1. Backend Server (Port 5000)

```bash
cd backend
npm start
```

**Production mode with auto-restart:**
```bash
cd backend
npm run start-dev
```

---

### 2. Affiliate Portal - my-app (Port 3000)

```bash
cd my-app
npm start
```

Will open automatically in browser at http://localhost:3000

---

### 3. Player Frontend - png71-front (Port 3001)

```bash
cd png71-front
npm start
```

Will prompt for port if 3000 is taken - choose Yes to use 3001

---

### 4. Main Admin Dashboard - CoreUI (Port 5173)

```bash
cd coreui-free-react-admin-template-main
npm start
```

Vite will start on port 5173 by default

---

### 5. Agent Admin Panel - agentPng71

```bash
cd agentPng71
npm start
```

Vite will auto-assign available port (usually 3002 if 3000-3001 are taken)

---

### 6. Sub-Admin Panel - SubAdminPng71

```bash
cd SubAdminPng71
npm start
```

Vite will auto-assign available port (usually 3003)

---

### 7. Sub-Agent Panel - subAgentPng71

```bash
cd subAgentPng71
npm start
```

Vite will auto-assign available port

---

## ⚙️ Method 3: Using npm Scripts

Each application can be started individually using npm:

```bash
# Backend
cd backend && npm start

# Affiliate Portal
cd my-app && npm start

# Player Frontend  
cd png71-front && npm start

# Main Admin
cd coreui-free-react-admin-template-main && npm start

# Agent Panel
cd agentPng71 && npm start

# Sub-Admin Panel
cd SubAdminPng71 && npm start

# Sub-Agent Panel
cd subAgentPng71 && npm start
```

---

## 🔄 Development Workflow

### Starting Applications in Order:

**1. Start Backend First (Required)**
```bash
cd backend
npm start
# Wait for "Server is running on port 5000"
```

**2. Start Frontend Applications (Any Order)**
```bash
# In separate terminals:
cd my-app && npm start
cd png71-front && npm start
cd coreui-free-react-admin-template-main && npm start
cd agentPng71 && npm start
cd SubAdminPng71 && npm start
cd subAgentPng71 && npm start
```

---

## 🌐 Access URLs

Once started, access applications at:

| Application | URL | Default Port |
|-------------|-----|--------------|
| Backend API | http://localhost:5000 | 5000 |
| Affiliate Portal | http://localhost:3000 | 3000 |
| Player Frontend | http://localhost:3001 | 3001 |
| Agent Panel | http://localhost:3002 | 3002 |
| Sub-Admin | http://localhost:3003 | 3003 |
| Main Admin | http://localhost:5173 | 5173 |
| Sub-Agent | http://localhost:5174 | 5174 |

*Note: Vite applications auto-increment port if default is taken*

---

## 🛑 Stopping Applications

### Stop Individual Application:
Press `Ctrl+C` in the terminal running that application

### Stop All Applications:
Close all terminal windows or press `Ctrl+C` in each

### Force Stop by Port:
```bash
# Find process
netstat -ano | findstr :PORT_NUMBER

# Kill process
taskkill /PID <process_id> /F
```

---

## 🔍 Checking Running Applications

### View All Running Apps:
```bash
netstat -ano | findstr "LISTENING"
```

### View Specific Ports:
```bash
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5000"
netstat -ano | findstr ":5173"
```

### Check if Backend is Running:
```bash
curl http://localhost:5000
# or visit in browser
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Problem:** "Port XXXX is already in use"

**Solution 1:** Let it use another port (if prompted)
- Create React App will ask: "Would you like to run on another port?"
- Type `Y` and press Enter

**Solution 2:** Kill the process using that port
```bash
# Windows
netstat -ano | findstr :PORT
taskkill /PID <pid> /F

# PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort PORT).OwningProcess | Stop-Process -Force
```

---

### Dependencies Not Found

**Problem:** "Cannot find module" or "Module not found"

**Solution:** Install dependencies
```bash
cd [application-folder]
npm install
```

---

### Backend Connection Failed

**Problem:** Frontend shows "Network Error" or "Cannot connect to backend"

**Solution:**
1. Ensure backend is running (`cd backend && npm start`)
2. Check backend URL in frontend code
3. Verify no CORS issues in browser console

---

### Application Won't Start

**Problem:** Application fails to start

**Solution:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```

3. Check Node.js version:
   ```bash
   node --version
   # Should be v14 or higher
   ```

---

## 📝 Tips for Individual Development

### 1. Use Multiple Terminals
Open a separate terminal for each application you're developing

### 2. Watch Mode
All applications support hot reload:
- **Vite apps:** Instant HMR (Hot Module Replacement)
- **Create React App:** Fast Refresh
- **Backend:** Use `npm run start-dev` for nodemon auto-restart

### 3. Focus on One App
Only start the applications you need:
- Backend + Frontend you're working on
- No need to run all 7 simultaneously

### 4. Check Logs
Each terminal shows its own application logs - useful for debugging

### 5. Environment Variables
Check `.env` files in each application folder for configuration

---

## 🎓 Common Development Scenarios

### Working on Frontend Only:
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd [your-frontend-app] && npm start
```

### Working on Backend Only:
```bash
cd backend && npm run start-dev
# Use Postman/Thunder Client to test API
```

### Full Stack Development:
```bash
# Terminal 1 - Backend
cd backend && npm run start-dev

# Terminal 2 - Frontend
cd [your-frontend-app] && npm start
```

### Testing Multiple Panels:
```bash
# Start backend + multiple admin panels
cd backend && npm start
cd agentPng71 && npm start
cd SubAdminPng71 && npm start
```

---

## 📚 Additional Resources

- [Backend API Documentation](backend/README.md)
- [API Integration Guide](API_INTEGRATION_SUMMARY.md)
- [Running Services Status](RUNNING_APPLICATIONS.md)
- [Quick Start Guide](START_GUIDE.md)

---

*Last Updated: March 4, 2026*
*All applications support individual development!*
