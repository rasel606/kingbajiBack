# Quick Start - Frontend & Backend Connection

## ✅ Complete Integration Setup

Your frontend and backend are now fully connected with comprehensive API integration.

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend Apps
cd agentPng71
npm install

cd ../SubAdminPng71
npm install

cd ../subAgentPng71
npm install
```

### Step 2: Start Backend

```bash
cd backend
npm start

# Backend will start on http://localhost:5000
# API available at http://localhost:5000/api
```

### Step 3: Start Frontend

In separate terminals:

```bash
# Agents Dashboard
cd agentPng71
npm start

# SubAdmin Dashboard
cd SubAdminPng71
npm start

# SubAgent Panel
cd subAgentPng71
npm start
```

Each frontend will run on their respective Vite dev ports (usually :5173, :5174, :5175)

---

## 📋 File Structure

```
Frontend Apps/
├── agentPng71/
│   ├── .env.example          ← Environment template
│   ├── src/
│   │   ├── service/
│   │   │   ├── api.js        ← Main API service
│   │   │   └── apiUtils.js   ← Utilities & helpers
│   │   └── components/
│   │       └── examples/
│   │           └── ApiExample.jsx  ← Example components
│   └── ...
├── SubAdminPng71/            ← Same structure
├── subAgentPng71/            ← Same structure
└── ...

Backend/
├── .env                       ← Backend config
├── app.js                     ← Express app
├── src/
│   ├── router/                ← All API routes
│   ├── controller/            ← Business logic
│   ├── models/                ← Database schemas
│   └── middleWare/            ← Auth, CORS, etc.
└── ...
```

---

## 🔗 API Connection Overview

### How It Works

```
User Action
    ↓
Frontend Component
    ↓
Call apiService.method()
    ↓
HTTP Fetch to Backend
    ↓
Backend Route Handler
    ↓
Process Request
    ↓
Return JSON Response
    ↓
Update Frontend State
    ↓
Update UI
```

### Environment Configuration

Each frontend has API endpoint configured:

- **agentPng71**: `VITE_API_BASE_URL=http://localhost:5000/api`
- **SubAdminPng71**: `VITE_API_BASE_URL=http://localhost:5000/api`
- **subAgentPng71**: `VITE_API_BASE_URL=http://localhost:5000/api`

For production, update to your production API URL.

---

## 💡 Usage Examples

### Fetch Data

```javascript
import apiService from '@/service/api';

// Fetch users
const users = await apiService.getUsers();

// Fetch with ID
const user = await apiService.getUserById('userId123');

// Fetch transactions with filters
const txs = await apiService.getTransactions({ status: 'pending' });
```

### Create Data

```javascript
// Create new user
const newUser = await apiService.createUser({
  name: 'John',
  email: 'john@example.com',
  password: 'secure123',
  role: 'agent'
});
```

### Update Data

```javascript
// Update existing user
await apiService.updateUser('userId123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

### Delete Data

```javascript
// Delete user
await apiService.deleteUser('userId123');
```

### Error Handling

```javascript
try {
  const data = await apiService.getUsers();
} catch (error) {
  console.error('Failed:', error.message);
  // Show error to user
}
```

---

## 📚 Available API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Admin registration
- `POST /api/admin/logout` - Admin logout

### Users Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard` - Dashboard data
- `GET /api/dashboard/stats` - Statistics

### Agents
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction

### Games
- `GET /api/games` - List games
- `POST /api/games` - Create game
- `PUT /api/games/:id` - Update game

### And many more...

See [API_CONNECTION_GUIDE.md](./API_CONNECTION_GUIDE.md) for full endpoint list.

---

## 🧪 Testing API Connection

### Using Postman

1. Import endpoints from `backend/openapi.yaml`
2. Login to get token: `POST /api/admin/login`
3. Add token to Authorization header
4. Test other endpoints

### Using Browser Console

```javascript
// Import apiService
import apiService from 'http://localhost:5173/src/service/api.js'

// Test login
await apiService.login({ email: 'admin@test.com', password: 'pass' })

// Test get users
await apiService.getUsers()
```

### Using Curl

```bash
# Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass"}'

# Get users (with token)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔐 Authentication & Security

### Token Management

```javascript
// Tokens are saved to localStorage
localStorage.getItem('admin_token')
localStorage.getItem('agent_token')
localStorage.getItem('admin_sub_token')

// Automatically included in all API requests
// Authorization: Bearer {token}
```

### Security Features

✅ JWT Authentication
✅ CORS enabled
✅ Request validation
✅ Error handling
✅ Token auto-refresh support

---

## 🛠️ Debugging & Troubleshooting

### Enable API Logging

In frontend `.env`:
```
VITE_LOG_API_CALLS=true
VITE_DEBUG=true
```

### Check Backend Running

```bash
# Should return 200 OK
curl http://localhost:5000/api/admin/health
```

### Check Frontend Connection

Open browser DevTools → Network tab
Make API call and inspect request/response

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS Error | Ensure backend CORS middleware is enabled |
| 401 Unauthorized | Check token is valid and included in header |
| 404 Not Found | Check endpoint path and backend route exists |
| Connection Refused | Make sure backend is running on port 5000 |

---

## 📖 Resources

- **API Guide**: [API_CONNECTION_GUIDE.md](./API_CONNECTION_GUIDE.md)
- **Backend Setup**: [backend/BACKEND_SETUP_COMPLETE.md](./backend/BACKEND_SETUP_COMPLETE.md)
- **API Docs**: [backend/openapi.yaml](./backend/openapi.yaml)
- **Example Components**: `src/components/examples/ApiExample.jsx`

---

## 🎯 Next Steps

1. ✅ **API Services Setup** - Already configured
2. ✅ **Environment Files** - Already created
3. ✅ **Utilities & Helpers** - Already added
4. **Test connections** - Use postman/curl to test
5. **Build features** - Use example components as template
6. **Deploy** - Push to production servers

---

## 📞 Support

For issues or questions:

1. Check the API_CONNECTION_GUIDE.md
2. Review example components
3. Check backend error logs: `backend/logs/`
4. Inspect browser network tab
5. Check backend routes in `backend/src/router/`

---

**Last Updated**: March 4, 2026
**Status**: ✅ Ready to Use
