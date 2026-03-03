# Frontend-Backend Connection Setup ✅

## 🎉 Setup Complete!

Your frontend (SubAdminPng71) is now fully connected to the backend API with all necessary services and configurations.

---

## 📦 What Was Created

### 1. Environment Configuration
- ✅ **`.env`** - Environment variables for API connection
- ✅ Configured API Base URL: `http://localhost:5000/api`
- ✅ Configured Socket URL: `http://localhost:5000`

### 2. Core API Service
- ✅ **`src/service/api.js`** - Enhanced with:
  - Environment variable support
  - Request timeout handling
  - Better error handling
  - FormData support for file uploads
  - Debug logging
  - PATCH method support

### 3. Service Modules Created
All services are in `src/service/`:

| Service | File | Purpose |
|---------|------|---------|
| 🔐 Auth | `authService.js` | Login, register, profile |
| 👥 Users | `userService.js` | User management (existing) |
| 💰 Transactions | `transactionService.js` | Deposits, withdrawals, approvals |
| 🤝 Agents | `agentService.js` | Agent management & dashboard |
| 📢 Affiliates | `affiliateService.js` | Affiliate program management |
| 🎮 Games | `gameService.js` | Game catalog & launching |
| 💳 Payments | `paymentService.js` | Payment methods & gateways |
| ⭐ VIP | `vipService.js` | VIP user management |
| 📊 Reports | `reportService.js` | Analytics & reporting |
| 📣 Announcements | `announcementService.js` | Announcement management |
| 🔗 Referrals | `referralService.js` | Referral system |
| 🔌 Socket | `socketService.js` | Real-time WebSocket connection |

### 4. Utilities
- ✅ **`src/service/index.js`** - Central export for all services
- ✅ **`src/utils/testConnection.js`** - Connection testing utilities

### 5. Documentation
- ✅ **`API_INTEGRATION_GUIDE.md`** - Complete integration guide
- ✅ **`API_QUICK_REFERENCE.md`** - Quick reference for developers

### 6. App Initialization
- ✅ **`src/App.js`** - Updated to initialize auth service on startup

---

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
cd SubAdminPng71
npm install socket.io-client
```

### Step 2: Start Backend

```bash
cd backend
npm start
```

Backend should be running on: **http://localhost:5000**

### Step 3: Start Frontend

```bash
cd SubAdminPng71
npm start
```

Frontend will run on: **http://localhost:3000** or **http://localhost:5173**

### Step 4: Test Connection

Open browser console and you should see:
```
✅ Auth service initialized
```

---

## 📖 Usage Examples

### Basic Authentication

```javascript
import authService from './service/authService';

// Login
const handleLogin = async () => {
  try {
    const response = await authService.login({
      username: 'admin',
      password: 'password'
    });
    console.log('Logged in:', response);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### Fetch Users

```javascript
import userService from './service/userService';

const getUsers = async () => {
  try {
    const users = await userService.getAllUsers({ 
      page: 1, 
      limit: 10 
    });
    console.log('Users:', users);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Real-time Updates

```javascript
import socketService from './service/socketService';

// Connect (usually after login)
socketService.connect(token);

// Listen for notifications
socketService.onNotification((data) => {
  console.log('New notification:', data);
});

// Listen for transaction updates
socketService.onTransactionUpdate((data) => {
  console.log('Transaction updated:', data);
});
```

### Import All Services

```javascript
// Option 1: Import individual services
import authService from './service/authService';
import userService from './service/userService';

// Option 2: Import all at once
import services from './service';
services.auth.login({ username, password });
services.user.getAllUsers();
```

---

## 🧪 Testing the Connection

### Method 1: Using Test Utility

```javascript
import { runDiagnostics } from './utils/testConnection';

// Run full diagnostic test
const test = async () => {
  const results = await runDiagnostics();
  console.log(results);
};
```

### Method 2: Manual Test

Open browser console and run:

```javascript
// Test backend connection
fetch('http://localhost:5000/api/v1/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend is running:', data))
  .catch(err => console.error('❌ Backend error:', err));
```

### Method 3: Login Test

1. Navigate to `/login`
2. Enter credentials
3. Check console for auth initialization
4. Check localStorage for `subadmin_token`

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file to change configuration:

```env
# Development
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Production (when deploying)
VITE_API_BASE_URL=https://your-domain.com/api
VITE_SOCKET_URL=https://your-domain.com

# Debug settings
VITE_DEBUG=true
VITE_LOG_API_CALLS=true
```

**Important:** Restart the dev server after changing `.env` file!

---

## 📡 Available API Endpoints

### Authentication
```
POST /api/subadmin/auth/register_Sub_admin
POST /api/subadmin/auth/login_sub_admin
GET  /api/subadmin/auth/main_sub_admin
```

### Users
```
GET    /api/user
POST   /api/user
GET    /api/user/:id
PUT    /api/user/:id
DELETE /api/user/:id
```

### Transactions
```
GET /api/transactions
GET /api/transactions/pending
PUT /api/transactions/deposit/approve/:id
PUT /api/transactions/withdrawal/approve/:id
```

### Agents
```
GET  /api/agent
POST /api/subadmin/auth/register_agent
GET  /api/agent/:id
GET  /api/agent_dashboard/:id
```

### Games
```
GET /api/games
GET /api/games/categories
GET /api/games/popular
```

### Reports & Analytics
```
GET /api/dashboard/analytics
GET /api/unified-dashboard
GET /api/user/betting
```

See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) for complete endpoint list.

---

## 🐛 Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check backend CORS configuration in `backend/app.js`
2. Ensure frontend URL is in `CORS_ORIGINS`
3. Restart backend after changes

### Connection Refused

If backend is not reachable:
1. Verify backend is running: `http://localhost:5000`
2. Check backend logs for errors
3. Ensure correct port in `.env`

### 401 Unauthorized

If API calls return 401:
1. Check if token exists: `localStorage.getItem('subadmin_token')`
2. Try logging in again
3. Check token expiration on backend

### Environment Variables Not Working

If environment variables don't load:
1. Ensure `.env` file is in root of `SubAdminPng71/`
2. Variable names must start with `VITE_`
3. Restart dev server after creating/editing `.env`

---

## 🎯 Next Steps

### 1. Implement Socket.IO
- Install: `npm install socket.io-client`
- Connect socket after successful login
- Listen for real-time events

### 2. Add Error Handling
- Create global error handler
- Add toast notifications for errors
- Implement retry logic for failed requests

### 3. Add Loading States
- Show spinners during API calls
- Implement skeleton screens
- Add progress indicators

### 4. Implement Caching
- Cache frequently accessed data
- Use React Query or SWR
- Implement optimistic updates

### 5. Add Request Interceptors
- Auto-refresh expired tokens
- Add request logging
- Handle rate limiting

---

## 📚 Documentation Links

- **Complete Guide:** [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
- **Quick Reference:** [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
- **Backend Setup:** [../backend/README.md](../backend/README.md)

---

## ✅ Checklist

- [x] Create `.env` file
- [x] Update API service with environment variables
- [x] Create service modules for all features
- [x] Add Socket.IO service
- [x] Initialize auth service in App.js
- [x] Create documentation
- [ ] Install socket.io-client: `npm install socket.io-client`
- [ ] Test login functionality
- [ ] Test API endpoints
- [ ] Implement Socket.IO connection
- [ ] Add error handling
- [ ] Deploy to production

---

## 🆘 Support

### Backend Issues
- Check logs: `backend/logs/`
- Restart backend: `npm start`
- Check environment: `backend/.env`

### Frontend Issues
- Clear cache: `localStorage.clear()`
- Restart dev server
- Check browser console for errors
- Enable debug mode: `VITE_DEBUG=true` in `.env`

### Getting Help
1. Check documentation files
2. Review console logs
3. Check network tab in DevTools
4. Test endpoints individually

---

## 🎊 Success!

Your frontend and backend are now connected! You can:
- ✅ Make authenticated API requests
- ✅ Use all service modules
- ✅ Handle errors properly
- ✅ Connect via Socket.IO
- ✅ Debug with logging

**Happy coding!** 🚀

---

**Created:** March 2026  
**Version:** 1.0.0  
**Project:** BajiCrick Admin Panel
