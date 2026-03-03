# 📊 Dashboard Quick Reference Card

## 🚀 Quick Start

### Start Services
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd agentPng71 && npm start
```

### Access Dashboard
```
http://localhost:5173/dashboard
```

---

## 📁 File Locations

### Frontend Components
```
agentPng71/src/views/dashboard/
├── Dashboard.js              # Standard dashboard
├── AnalyticsDashboard.js     # Enhanced analytics
├── DashboardWidgets.js       # Reusable widgets
├── DashboardCharts.js        # Chart components
└── MainChart.js              # Main chart component
```

### Services
```
agentPng71/src/service/
├── api.js                    # Main API service
└── dashBoardService.js       # Dashboard API calls
```

### Backend
```
backend/src/
├── router/agentDashboard.js          # Routes
└── controllers/AgentDashboard.js     # Logic
```

---

## 🔌 API Endpoints

### Dashboard Stats
```
GET /api/agent-dashboard/stats
```

### Comprehensive Analytics
```
GET /api/agent-dashboard/analytics
```

### Recent Activity
```
GET /api/agent-dashboard/recent-activity
```

### Users
```
GET /api/agent-dashboard/users/list?page=1&limit=10
GET /api/agent-dashboard/users/agents
GET /api/agent-dashboard/users/subagents
```

### Transactions
```
GET /api/agent-dashboard/transactions/pending-deposits
GET /api/agent-dashboard/transactions/pending-withdrawals
GET /api/agent-dashboard/transactions/recent?limit=10
```

---

## 🧩 Widget Components

### Stats Widget
```jsx
import { StatsWidget } from './DashboardWidgets'

<StatsWidget
  title="Total Users"
  value={150}
  growth={12.5}
  color="primary"
/>
```

### Quick Stat Card
```jsx
import { QuickStatCard } from './DashboardWidgets'

<QuickStatCard
  title="Balance"
  value={50000}
  prefix="৳ "
  icon={cilCash}
  color="success"
/>
```

### Top Users Widget
```jsx
import { TopUsersWidget } from './DashboardWidgets'

<TopUsersWidget users={[
  { userId: '123', username: 'user1', balance: 10000 }
]} />
```

### Monthly Comparison
```jsx
import { MonthlyComparisonWidget } from './DashboardWidgets'

<MonthlyComparisonWidget
  currentMonth={{ users: 25, deposits: 100000 }}
  lastMonth={{ users: 20, deposits: 80000 }}
/>
```

---

## 📈 Chart Components

### Daily Cash Flow
```jsx
import { DailyCashFlowChart } from './DashboardCharts'

<DailyCashFlowChart dailyFlow={[
  { date: '2026-03-01', deposit: 10000, withdraw: 5000 },
  // ... more days
]} />
```

### Payment Breakdown
```jsx
import { PaymentBreakdownChart } from './DashboardCharts'

<PaymentBreakdownChart paymentBreakdown={[
  { name: 'bKash', value: 50000 },
  { name: 'Nagad', value: 30000 }
]} />
```

### User Distribution
```jsx
import { UserDistributionChart } from './DashboardCharts'

<UserDistributionChart
  totalUsers={100}
  onlineUsers={45}
/>
```

### Revenue Trend
```jsx
import { RevenueTrendChart } from './DashboardCharts'

<RevenueTrendChart dailyFlow={dailyData} />
```

---

## 🎨 Color Scheme

| Color   | Code      | Usage |
|---------|-----------|-------|
| Primary | `#321fdb` | General info |
| Success | `#2eb85c` | Positive/Deposits |
| Danger  | `#e55353` | Negative/Withdrawals |
| Warning | `#f9b115` | Caution/Betting |
| Info    | `#39f`    | Users |

---

## 📊 Data Format

### Analytics Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUsers": 150,
      "onlineUsers": 45,
      "totalDeposit": 500000,
      "todayDeposit": 15000
    },
    "growth": {
      "users": 12.5,
      "deposits": 25.3
    },
    "charts": {
      "dailyFlow": [...],
      "paymentBreakdown": [...]
    },
    "topUsers": [...]
  }
}
```

---

## 🔄 Service Usage

### Get Analytics
```javascript
import { dashBoardService } from '@/service/dashBoardService'

const data = await dashBoardService.getAnalytics()
// data.data contains analytics
```

### Get Stats
```javascript
const stats = await dashBoardService.dashboardStats()
// stats.data contains statistics
```

---

## 🎯 Common Tasks

### Load Dashboard Data
```javascript
const [data, setData] = useState(null)

useEffect(() => {
  dashBoardService.getAnalytics()
    .then(res => setData(res.data))
    .catch(err => console.error(err))
}, [])
```

### Auto-refresh
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    loadData()
  }, 5 * 60 * 1000) // 5 minutes

  return () => clearInterval(interval)
}, [])
```

### Manual Refresh
```javascript
const handleRefresh = async () => {
  setLoading(true)
  await dashBoardService.getAnalytics()
  setLoading(false)
}
```

---

## 🐛 Debugging

### Check Backend
```bash
curl http://localhost:5000/api/agent-dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Frontend
```javascript
// Browser console
localStorage.getItem('admin_token')
localStorage.getItem('agent_token')
```

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Error | Check token exists and is valid |
| 404 Error | Verify API endpoint URL |
| Empty data | Check backend is running |
| Charts not showing | Install @coreui/react-chartjs |

---

## 📦 Install Dependencies

### If charts not working
```bash
cd agentPng71
npm install @coreui/react-chartjs chart.js
```

### If widgets missing
```bash
npm install @coreui/react @coreui/icons-react
```

---

## 🔒 Authentication

All endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Token is auto-added by apiService if stored in localStorage.

---

## 📱 Responsive Breakpoints

| Device | Columns | Breakpoint |
|--------|---------|------------|
| Mobile | 1 | < 576px |
| Tablet | 2 | 576px - 767px |
| Desktop | 3-4 | 768px - 1199px |
| Large | 4+ | ≥ 1200px |

---

## 🎯 Feature Checklist

- ✅ Real-time statistics
- ✅ Growth indicators
- ✅ Multiple chart types
- ✅ Auto-refresh (5 min)
- ✅ Manual refresh
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Top users list
- ✅ Payment breakdown
- ✅ Cash flow trends
- ✅ Monthly comparisons

---

## 📞 Quick Links

- [Full Documentation](./DASHBOARD_ANALYTICS_GUIDE.md)
- [API Guide](./API_CONNECTION_GUIDE.md)
- [Backend Routes](./backend/src/router/agentDashboard.js)
- [Controller Logic](./backend/src/controllers/AgentDashboard.js)

---

**Version**: 1.0.0
**Last Updated**: March 4, 2026
**Status**: ✅ Production Ready
