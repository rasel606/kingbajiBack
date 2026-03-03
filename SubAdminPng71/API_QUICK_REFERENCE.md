# API Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install socket.io-client

# 2. Setup environment
cp .env.example .env

# 3. Start backend (in backend folder)
npm start

# 4. Start frontend (in SubAdminPng71 folder)
npm start
```

## 🔑 Authentication

```javascript
import authService from './service/authService';

// Login
await authService.login({ username, password });

// Get Profile
await authService.getProfile();

// Logout
authService.logout();
```

## 👥 Users

```javascript
import userService from './service/userService';

// Get all users
await userService.getAllUsers({ page: 1, limit: 10 });

// Get user by ID
await userService.getUserById(userId);

// Update user
await userService.updateUser(userId, data);
```

## 💰 Transactions

```javascript
import transactionService from './service/transactionService';

// Get pending
await transactionService.getPendingTransactions();

// Approve deposit
await transactionService.approveDeposit(id, data);

// Approve withdrawal
await transactionService.approveWithdrawal(id, data);
```

## 🎮 Games

```javascript
import gameService from './service/gameService';

// Get all games
await gameService.getAllGames();

// Get by category
await gameService.getGamesByCategory(category);
```

## 📊 Reports

```javascript
import reportService from './service/reportService';

// Get analytics
await reportService.getDashboardAnalytics({ startDate, endDate });

// Export report
await reportService.exportBettingReport({ format: 'xlsx' });
```

## 🔌 Socket.IO

```javascript
import socketService from './service/socketService';

// Connect
socketService.connect(token);

// Listen
socketService.onNotification((data) => console.log(data));
socketService.onTransactionUpdate((data) => console.log(data));

// Disconnect
socketService.disconnect();
```

## 🌐 API Endpoints

### Auth
- `POST /api/subadmin/auth/login_sub_admin` - Login
- `GET /api/subadmin/auth/main_sub_admin` - Get profile

### Users  
- `GET /api/user` - Get all users
- `POST /api/user` - Create user
- `PUT /api/user/:id` - Update user

### Transactions
- `GET /api/transactions` - Get all
- `PUT /api/transactions/deposit/approve/:id` - Approve deposit
- `PUT /api/transactions/withdrawal/approve/:id` - Approve withdrawal

### Agents
- `GET /api/agent` - Get all agents
- `POST /api/subadmin/auth/register_agent` - Create agent
- `GET /api/agent_dashboard/:id` - Agent dashboard

### Games
- `GET /api/games` - Get all games
- `GET /api/games/categories` - Get categories

## ⚙️ Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_LOG_API_CALLS=true
```

## 🐛 Debugging

```javascript
// Enable logging in .env
VITE_LOG_API_CALLS=true
VITE_DEBUG=true

// Check console for:
// 🌐 API Request logs
// ✅ API Response logs
// ❌ API Error logs
```

## ❌ Error Handling

```javascript
try {
  const data = await userService.getAllUsers();
} catch (error) {
  console.error(error.message);
  // Handle error
}
```

## 📦 Import All Services

```javascript
// Import individual
import authService from './service/authService';
import userService from './service/userService';

// Or import all
import services from './service';
services.auth.login();
services.user.getAllUsers();
```

## 🔄 Real-time Updates

```javascript
// Setup in useEffect
useEffect(() => {
  const token = localStorage.getItem('subadmin_token');
  if (token) {
    socketService.connect(token);
    
    socketService.onNotification((notification) => {
      // Handle notification
    });
  }
  
  return () => socketService.disconnect();
}, []);
```

## 🎯 Common Patterns

### Paginated List
```javascript
const [users, setUsers] = useState([]);
const [page, setPage] = useState(1);

const fetchUsers = async () => {
  const data = await userService.getAllUsers({ page, limit: 10 });
  setUsers(data.users);
};
```

### Form Submission
```javascript
const handleSubmit = async (formData) => {
  try {
    await userService.createUser(formData);
    alert('Success!');
  } catch (error) {
    alert(error.message);
  }
};
```

### File Upload
```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  await apiService.upload('/upload', formData);
};
```

---

**Backend:** http://localhost:5000  
**Frontend:** http://localhost:3000 or http://localhost:5173  
**Docs:** [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
