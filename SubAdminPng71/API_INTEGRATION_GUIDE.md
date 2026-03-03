# Frontend-Backend API Integration Guide

## 📋 Table of Contents
1. [Setup](#setup)
2. [Environment Configuration](#environment-configuration)
3. [API Services](#api-services)
4. [Usage Examples](#usage-examples)
5. [Socket.IO Integration](#socketio-integration)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## 🚀 Setup

### Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000` or `http://localhost:5173`
- Node.js and npm installed

### Installation

1. **Install Socket.IO Client** (for real-time features):
```bash
cd SubAdminPng71
npm install socket.io-client
```

2. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`
   - Update values as needed

---

## ⚙️ Environment Configuration

### `.env` File Structure

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Application
VITE_APP_NAME=SubAdmin Dashboard
VITE_NODE_ENV=development

# Debug
VITE_DEBUG=true
VITE_LOG_API_CALLS=true
VITE_API_TIMEOUT=30000
```

### Production Configuration

For production, update:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
VITE_NODE_ENV=production
VITE_DEBUG=false
VITE_LOG_API_CALLS=false
```

---

## 📦 API Services

### Available Services

| Service | File | Purpose |
|---------|------|---------|
| `apiService` | `api.js` | Core API client |
| `authService` | `authService.js` | Authentication |
| `adminServices` | `adminServices.js` | Admin operations |
| `userService` | `userService.js` | User management |
| `transactionService` | `transactionService.js` | Transactions |
| `agentService` | `agentService.js` | Agent management |
| `affiliateService` | `affiliateService.js` | Affiliate operations |
| `gameService` | `gameService.js` | Game management |
| `paymentService` | `paymentService.js` | Payment methods |
| `vipService` | `vipService.js` | VIP user management |
| `reportService` | `reportService.js` | Reports & analytics |
| `announcementService` | `announcementService.js` | Announcements |
| `referralService` | `referralService.js` | Referral system |
| `socketService` | `socketService.js` | Real-time updates |

---

## 💡 Usage Examples

### 1. Authentication

```javascript
import authService from './service/authService';

// Initialize auth on app start
authService.init();

// Login
const handleLogin = async () => {
  try {
    const response = await authService.login({
      username: 'admin',
      password: 'password123'
    });
    console.log('Logged in:', response);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// Get Profile
const getProfile = async () => {
  try {
    const profile = await authService.getProfile();
    console.log('Profile:', profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};

// Logout
const handleLogout = () => {
  authService.logout();
  // Redirect to login page
};
```

### 2. User Management

```javascript
import userService from './service/userService';

// Get all users with pagination
const getUsers = async () => {
  try {
    const users = await userService.getAllUsers({
      page: 1,
      limit: 10,
      status: 'active'
    });
    console.log('Users:', users);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

// Update user
const updateUser = async (userId) => {
  try {
    const updated = await userService.updateUser(userId, {
      status: 'active',
      balance: 1000
    });
    console.log('User updated:', updated);
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

### 3. Transactions

```javascript
import transactionService from './service/transactionService';

// Get pending deposits
const getPendingDeposits = async () => {
  try {
    const transactions = await transactionService.getPendingTransactions({
      type: 'deposit',
      status: 'pending'
    });
    console.log('Pending deposits:', transactions);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Approve deposit
const approveDeposit = async (transactionId) => {
  try {
    const result = await transactionService.approveDeposit(transactionId, {
      adminNote: 'Approved'
    });
    console.log('Deposit approved:', result);
  } catch (error) {
    console.error('Approval failed:', error);
  }
};
```

### 4. Agent Management

```javascript
import agentService from './service/agentService';

// Create new agent
const createAgent = async () => {
  try {
    const agent = await agentService.createAgent({
      username: 'agent001',
      email: 'agent@example.com',
      password: 'secure123',
      commissionRate: 5
    });
    console.log('Agent created:', agent);
  } catch (error) {
    console.error('Creation failed:', error);
  }
};

// Get agent dashboard
const getAgentDashboard = async (agentId) => {
  try {
    const dashboard = await agentService.getAgentDashboard(agentId);
    console.log('Dashboard:', dashboard);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 5. Reports & Analytics

```javascript
import reportService from './service/reportService';

// Get dashboard analytics
const getAnalytics = async () => {
  try {
    const analytics = await reportService.getDashboardAnalytics({
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });
    console.log('Analytics:', analytics);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Export betting report
const exportReport = async () => {
  try {
    const report = await reportService.exportBettingReport({
      format: 'xlsx',
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });
    console.log('Report:', report);
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

---

## 🔌 Socket.IO Integration

### Setup Socket Connection

```javascript
import socketService from './service/socketService';
import authService from './service/authService';

// Connect on login
const handleLogin = async () => {
  const response = await authService.login(credentials);
  
  // Connect socket with token
  socketService.connect(response.token);
  
  // Setup listeners
  setupSocketListeners();
};

// Setup listeners
const setupSocketListeners = () => {
  // Listen for notifications
  socketService.onNotification((data) => {
    console.log('New notification:', data);
    // Update UI
  });

  // Listen for transaction updates
  socketService.onTransactionUpdate((data) => {
    console.log('Transaction updated:', data);
    // Refresh transaction list
  });

  // Listen for dashboard updates
  socketService.onDashboardUpdate((data) => {
    console.log('Dashboard updated:', data);
    // Refresh dashboard stats
  });

  // Listen for chat messages
  socketService.onChatMessage((message) => {
    console.log('New message:', message);
    // Update chat UI
  });
};

// Join a chat room
const joinChat = (roomId) => {
  socketService.joinChatRoom(roomId);
};

// Send message
const sendMessage = (roomId, message) => {
  socketService.sendChatMessage(roomId, message);
};

// Disconnect on logout
const handleLogout = () => {
  socketService.disconnect();
  authService.logout();
};
```

### React Hook Example

```javascript
import { useEffect } from 'react';
import socketService from './service/socketService';

const useSocket = () => {
  useEffect(() => {
    const token = localStorage.getItem('subadmin_token');
    
    if (token) {
      socketService.connect(token);
      
      // Cleanup on unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, []);

  return socketService;
};

export default useSocket;
```

---

## ❌ Error Handling

### Global Error Handler

```javascript
import { apiService } from './service/api';

// Add global error handler
const setupErrorHandling = () => {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show error notification to user
    if (event.reason?.message) {
      alert(event.reason.message);
    }
  });
};
```

### Component Error Handling

```javascript
const MyComponent = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userService.getAllUsers();
      // Handle success
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div>Loading...</div>}
      {/* Rest of component */}
    </div>
  );
};
```

### Token Expiration Handling

```javascript
import { apiService } from './service/api';
import authService from './service/authService';

// Intercept 401 errors and redirect to login
const originalRequest = apiService.request.bind(apiService);

apiService.request = async function(endpoint, options) {
  try {
    return await originalRequest(endpoint, options);
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Token expired
      authService.logout();
      window.location.href = '/login';
    }
    throw error;
  }
};
```

---

## 🧪 Testing

### Test API Connection

Create a test component to verify the connection:

```javascript
// TestConnection.jsx
import React, { useState } from 'react';
import authService from './service/authService';

const TestConnection = () => {
  const [status, setStatus] = useState('');

  const testConnection = async () => {
    try {
      setStatus('Testing...');
      
      // Initialize auth service
      authService.init();
      
      // Try to get profile (should fail if not logged in)
      const profile = await authService.getProfile();
      setStatus('✅ Connection successful! Profile: ' + JSON.stringify(profile));
    } catch (error) {
      if (error.message.includes('401')) {
        setStatus('✅ Backend is reachable (401 expected without login)');
      } else {
        setStatus('❌ Connection failed: ' + error.message);
      }
    }
  };

  return (
    <div>
      <button onClick={testConnection}>Test API Connection</button>
      <p>{status}</p>
    </div>
  );
};

export default TestConnection;
```

### Backend Routes Reference

```
Authentication:
- POST /api/subadmin/auth/register_Sub_admin
- POST /api/subadmin/auth/login_sub_admin
- GET  /api/subadmin/auth/main_sub_admin

Users:
- GET    /api/user
- POST   /api/user
- PUT    /api/user/:id
- DELETE /api/user/:id

Transactions:
- GET /api/transactions
- PUT /api/transactions/deposit/approve/:id
- PUT /api/transactions/withdrawal/approve/:id

Agents:
- GET  /api/agent
- POST /api/subadmin/auth/register_agent
- GET  /api/agent_dashboard/:id

Affiliates:
- POST /api/affiliate/Auth/login
- GET  /api/affiliate/dashboard
- GET  /api/affiliate/earnings

Games:
- GET /api/games
- GET /api/games/categories
- GET /api/games/popular

Reports:
- GET /api/dashboard/analytics
- GET /api/unified-dashboard
- GET /api/user/betting
```

---

## 🎯 Quick Start Checklist

- [ ] Install dependencies: `npm install socket.io-client`
- [ ] Create `.env` file from `.env.example`
- [ ] Start backend: `cd backend && npm start`
- [ ] Start frontend: `cd SubAdminPng71 && npm start`
- [ ] Initialize auth: `authService.init()` in App.jsx
- [ ] Test login functionality
- [ ] Connect Socket.IO on successful login
- [ ] Implement error handling
- [ ] Test all API endpoints

---

## 📞 Support

For issues or questions:
1. Check backend logs at `backend/logs/`
2. Enable debug mode: `VITE_LOG_API_CALLS=true`
3. Check browser console for errors
4. Verify backend is running on port 5000

---

## 🔧 Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Ensure backend has correct CORS configuration
2. Check `backend/.env` for `CORS_ORIGINS`
3. Restart backend after changes

### Connection Refused
1. Verify backend is running: `http://localhost:5000`
2. Check firewall settings
3. Ensure correct port in `.env`

### Token Issues
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check token in browser DevTools → Application → Local Storage

---

**Last Updated:** March 2026
**Version:** 1.0.0
