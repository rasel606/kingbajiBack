# Frontend & Backend API Integration Guide

This guide explains how to connect your frontend applications with the backend API.

## Architecture Overview

```
Frontend Apps → API Gateway → Backend Routes → Database
├── agentPng71 (Admin Panel)
├── SubAdminPng71 (Sub-Admin Panel)
├── subAgentPng71 (Sub-Agent Panel)
└── my-app (User App)
         ↓
   Vite Dev Server
         ↓
   http://localhost:5000 (Backend API)
```

## Environment Configuration

### Local Development Setup

Each frontend application has environment variables configured in `.env` files:

**agentPng71/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

**SubAdminPng71/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

**subAgentPng71/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

**my-app/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Production Setup

For production, update `.env.production` in each app:

```
VITE_API_BASE_URL=https://api.png71.live/api
REACT_APP_API_URL=https://api.png71.live/api
```

## Backend API Endpoints Available

### Authentication Routes
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `POST /api/admin/register` - Admin registration

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard` - Dashboard data
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/report` - Dashboard reports

### Agent Management
- `GET /api/agents` - Get all agents
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Games
- `GET /api/games` - Get all games
- `POST /api/games` - Create game
- `GET /api/games/:id` - Get game details
- `PUT /api/games/:id` - Update game

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details

### Withdrawals
- `GET /api/withdrawals` - Get withdrawals
- `POST /api/withdrawals` - Request withdrawal
- `PUT /api/withdrawals/:id/approve` - Approve withdrawal
- `PUT /api/withdrawals/:id/reject` - Reject withdrawal

### Bonuses
- `GET /api/bonus` - Get bonuses
- `POST /api/bonus` - Create bonus
- `PUT /api/bonus/:id` - Update bonus

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Reports
- `GET /api/reports` - Get reports
- `POST /api/reports/generate` - Generate report

## Using the API Service

### Basic Usage

```javascript
import apiService from '@/service/api';

// Login
const loginData = await apiService.login({
  email: 'admin@example.com',
  password: 'password123'
});

// Get Users
const users = await apiService.getUsers();

// Get User by ID
const user = await apiService.getUserById('userId123');

// Create User
const newUser = await apiService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'agent'
});

// Update User
const updated = await apiService.updateUser('userId123', {
  name: 'Jane Doe'
});

// Delete User
await apiService.deleteUser('userId123');
```

### Error Handling

```javascript
try {
  const data = await apiService.getUsers();
} catch (error) {
  console.error('Failed to fetch users:', error.message);
  // Handle error appropriately
}
```

### Authentication Token Management

The API service automatically manages authentication tokens:

```javascript
// Token is stored in localStorage
// Set during login: localStorage.setItem('admin_token', token)

// Token is automatically included in all requests
// Authorization header: "Bearer {token}"

// Logout
await apiService.logout();
localStorage.removeItem('admin_token');
```

## Frontend API Service Files

### agentPng71/src/service/api.js
Main API service with all available endpoints.

### Other Service Files
- `authService.js` - Authentication functions
- `userService.js` - User management functions
- `dashBoardService.js` - Dashboard data fetching
- `gameManagementService.js` - Game management
- `withdrawalService.js` - Withdrawal operations
- `adminServices.js` - Admin-specific operations

## Example: Using API in a Component

```javascript
import { useEffect, useState } from 'react';
import apiService from '@/service/api';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await apiService.getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user._id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
}
```

## Starting the Services

### Start Backend
```bash
cd backend
npm start
# Backend runs on http://localhost:5000
```

### Start Frontend (agentPng71)
```bash
cd agentPng71
npm start
# Frontend runs on http://localhost:5173 (Vite default)
```

### Start SubAdminPng71
```bash
cd SubAdminPng71
npm start
```

### Start subAgentPng71
```bash
cd subAgentPng71
npm start
```

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure:
1. Backend has CORS enabled in `app.js`
2. Frontend API_BASE_URL matches backend URL
3. Request headers are correctly set

### Authentication Issues
- Ensure token is saved to localStorage after login
- Token should be included in Authorization header
- Token format: `Bearer {token}`

### Connection Issues
1. Check backend is running: `http://localhost:5000`
2. Check frontend API URL in `.env`
3. Network tab in DevTools to inspect requests
4. Browser console for error messages

## API Call Flow

```
User Action (Component)
    ↓
apiService.method() [e.g., getUsers()]
    ↓
fetch() with headers & auth token
    ↓
Backend API (http://localhost:5000/api/...)
    ↓
Authentication Check (JWT verification)
    ↓
Controller Logic
    ↓
Database Query
    ↓
Response
    ↓
Parse JSON
    ↓
Return to Component
    ↓
Update State/UI
```

## Security Best Practices

1. **Store tokens securely**: Use localStorage or sessionStorage
2. **Include auth headers**: Always send Authorization header with token
3. **Validate inputs**: Validate data before sending to backend
4. **Error handling**: Never expose sensitive data in error messages
5. **HTTPS in production**: Use HTTPS for all API calls in production
6. **Token expiration**: Implement token refresh mechanism

## Testing API Connections

Use tools like Postman to test endpoints:

1. Set working directory to backend: `POST http://localhost:5000/api/admin/login`
2. Get response token
3. Add Authorization header: `Bearer {token}`
4. Test other endpoints

Or use curl:
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Additional Resources

- Backend API spec: `backend/openapi.yaml`
- Test endpoints: `backend/TEST_ENDPOINTS.md`
- Integration guide: `backend/API_INTEGRATION_GUIDE.md`
