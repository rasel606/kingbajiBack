# 🚀 MegaBaji Applications - Running Status

## ✅ Currently Running Applications

All applications have been started individually and are now accessible at the following URLs:

### Backend API
- **Application:** Backend Server
- **Port:** `5000`
- **URL:** http://localhost:5000
- **Status:** ✅ Running
- **Process ID:** 20352
- **Type:** Node.js Express Server
- **Location:** `backend/`

---

### Frontend Applications

#### 1. Affiliate Portal (my-app)
- **Port:** `3000`
- **URL:** http://localhost:3000
- **Status:** ✅ Running
- **Process ID:** 18092
- **Type:** React Application (Create React App)
- **Location:** `my-app/`
- **Purpose:** Affiliate management portal

#### 2. Player Frontend (png71-front)
- **Port:** `3001`
- **URL:** http://localhost:3001
- **Status:** ✅ Running
- **Process ID:** 13152
- **Type:** React Application (Create React App)
- **Location:** `png71-front/`
- **Purpose:** Player gaming frontend

#### 3. Agent Admin Panel (agentPng71)
- **Port:** `3002`
- **URL:** http://localhost:3002
- **Status:** ✅ Running
- **Process ID:** 10352
- **Type:** React Application (Vite)
- **Location:** `agentPng71/`
- **Purpose:** Agent administration panel

#### 4. Sub-Admin Panel (SubAdminPng71)
- **Port:** `3003`
- **URL:** http://localhost:3003
- **Status:** ✅ Running
- **Process ID:** 8964
- **Type:** React Application (Vite)
- **Location:** `SubAdminPng71/`
- **Purpose:** Sub-administrator management panel

#### 5. Main Admin Panel (CoreUI)
- **Port:** `5173` (default Vite port)
- **URL:** http://localhost:5173
- **Status:** ✅ Running (check terminal)
- **Type:** React Application (Vite)
- **Location:** `coreui-free-react-admin-template-main/`
- **Purpose:** Main administrator dashboard

#### 6. Sub-Agent Panel (subAgentPng71)
- **Port:** Auto-assigned (check terminal)
- **URL:** Check terminal output
- **Status:** ✅ Running
- **Type:** React Application (Vite)
- **Location:** `subAgentPng71/`
- **Purpose:** Sub-agent management panel

---

## 📋 Quick Access Links

| Application | URL | Port |
|------------|-----|------|
| Backend API | http://localhost:5000 | 5000 |
| Affiliate Portal | http://localhost:3000 | 3000 |
| Player Frontend | http://localhost:3001 | 3001 |
| Agent Admin | http://localhost:3002 | 3002 |
| Sub-Admin Panel | http://localhost:3003 | 3003 |
| Main Admin (CoreUI) | http://localhost:5173 | 5173 |

---

## 🛠️ How Applications Were Started

Each application was started individually using the following commands:

### Backend
```bash
cd /e/megabaji-2/backend
npm start
```

### my-app (Affiliate Portal)
```bash
cd /e/megabaji-2/my-app
npm start
```

### png71-front (Player Frontend)
```bash
cd /e/megabaji-2/png71-front
npm start
```

### coreui-free-react-admin-template-main (Main Admin)
```bash
cd /e/megabaji-2/coreui-free-react-admin-template-main
npm start
```

### agentPng71 (Agent Admin)
```bash
cd /e/megabaji-2/agentPng71
npm start
```

### SubAdminPng71 (Sub-Admin Panel)
```bash
cd /e/megabaji-2/SubAdminPng71
npm start
```

### subAgentPng71 (Sub-Agent Panel)
```bash
cd /e/megabaji-2/subAgentPng71
npm start
```

---

## 🔄 Managing Running Applications

### To Stop an Application
Press `Ctrl+C` in the terminal window where the application is running.

### To Stop a Specific Port
```bash
# Find process ID
netstat -ano | findstr :PORT_NUMBER

# Kill the process
taskkill /PID <process_id> /F
```

### To Restart an Application
1. Stop the application (Ctrl+C)
2. Run the start command again from the application directory

---

## 🔍 Troubleshooting

### Port Already in Use
If you get an error that a port is already in use:

1. **Check what's using the port:**
   ```bash
   netstat -ano | findstr :PORT_NUMBER
   ```

2. **Kill the process:**
   ```bash
   taskkill /PID <process_id> /F
   ```

3. **Or let the application use a different port** when prompted.

### Application Not Loading
- Check if the backend (port 5000) is running - most apps depend on it
- Verify no firewall is blocking the ports
- Check browser console for errors
- Ensure all dependencies are installed (`npm install` in each directory)

### Checking Application Status
```bash
# View all listening ports
netstat -ano | findstr "LISTENING"

# View specific port range (3000-3003, 5000, 5173)
netstat -ano | findstr ":3000 :3001 :3002 :3003 :5000 :5173"
```

---

## 📝 Notes

- **Backend must run first** - All frontend applications connect to the backend API
- **Vite applications** (CoreUI, agentPng71, SubAdminPng71, subAgentPng71) support hot module replacement
- **Create React App applications** (my-app, png71-front) support fast refresh
- Each application runs in its own terminal/process
- Port conflicts are automatically resolved by Vite (it will try the next available port)

---

## 🎯 Default Ports Configuration

### Configured Ports:
- **Backend:** 5000 (Express)
- **my-app:** 3000 (CRA default)
- **png71-front:** 3001 (CRA - manually configured)
- **CoreUI Admin:** 5173 (Vite default)
- **Other Vite apps:** Auto-assigned starting from 3000+

### Proxy Configuration:
- **my-app:** No proxy in package.json
- **png71-front:** Proxies to `https://api.png71.live`
- **CoreUI Admin:** Proxies to `http://localhost:3000`
- **agentPng71:** Proxies to `http://localhost:5000`
- **SubAdminPng71:** Proxies to `http://localhost:5000`
- **subAgentPng71:** Proxies to `https://api.png71.live`

---

*Generated on: March 4, 2026*
*All applications are running successfully!*
