# 📊 Agent Dashboard Analytics - Complete Guide

## ✅ Complete System Overview

Your comprehensive analytics dashboard for agentPng71 is now fully implemented with advanced features.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐   ┌──────────────────┐               │
│  │ AnalyticsDashboard│   │  Dashboard.js    │              │
│  │ (Enhanced)        │   │  (Standard)      │              │
│  └────────┬─────────┘   └────────┬─────────┘               │
│           │                      │                          │
│  ┌────────▼──────────────────────▼─────────────────────┐   │
│  │  Dashboard Widgets & Charts Components              │   │
│  │  - StatsWidget, QuickStatCard                      │   │
│  │  - DailyCashFlowChart, PaymentBreakdownChart      │   │
│  │  - TopUsersWidget, MonthlyComparisonWidget        │   │
│  │  - RevenueTrendChart, UserDistributionChart       │   │
│  └────────┬──────────────────────────────────────────┘   │
│           │                                                 │
│  ┌────────▼──────────────────────────────────────────┐   │
│  │  dashBoardService.js                              │   │
│  │  - getAnalytics()                                │   │
│  │  - dashboardStats()                              │   │
│  └────────┬──────────────────────────────────────────┘   │
│           │                                                 │
│  ┌────────▼──────────────────────────────────────────┐   │
│  │  apiService.js (API Layer)                        │   │
│  │  - HTTP calls with auth                          │   │
│  └────────┬──────────────────────────────────────────┘   │
│           │                                                 │
└───────────┼─────────────────────────────────────────────────┘
            │
            │ HTTP Request
            │
┌───────────▼─────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  /agent-dashboard/* Routes                        │      │
│  │  - GET /stats                                     │      │
│  │  - GET /analytics                                 │      │
│  │  - GET /recent-activity                           │      │
│  │  - GET /users/list                                │      │
│  │  - GET /transactions/pending-deposits             │      │
│  │  - GET /transactions/pending-withdrawals          │      │
│  └────────┬──────────────────────────────────────────┘      │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────────┐      │
│  │  AgentDashboard.js (Controller)                   │      │
│  │  - getDashboardStats()                            │      │
│  │  - getAnalytics()                                 │      │
│  │  - getRecentActivity()                            │      │
│  └────────┬──────────────────────────────────────────┘      │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────────┐      │
│  │  MongoDB Models                                    │      │
│  │  - User, Transaction, Agent, BettingHistory       │      │
│  └────────────────────────────────────────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Files Created/Enhanced

### Frontend Files

#### 1. **DashboardWidgets.js** (NEW)
Location: `agentPng71/src/views/dashboard/DashboardWidgets.js`

Components:
- `StatsWidget` - Main statistics cards with growth indicators
- `QuickStatCard` - Compact stat displays
- `RecentActivityWidget` - Shows recent activities
- `TopUsersWidget` - Table of top users by balance
- `MonthlyComparisonWidget` - Month-over-month comparison
- `SummaryStatsGrid` - Grid of summary statistics
- `TransactionStatsWidget` - Transaction overview

#### 2. **DashboardCharts.js** (NEW)
Location: `agentPng71/src/views/dashboard/DashboardCharts.js`

Charts:
- `DailyCashFlowChart` - 7-day deposits vs withdrawals line chart
- `PaymentBreakdownChart` - Payment gateway distribution doughnut
- `MonthlyGrowthChart` - 12-month bar chart
- `UserDistributionChart` - Online/offline users pie chart
- `DepositWithdrawComparisonChart` - Comparison bar chart
- `RevenueTrendChart` - Net revenue trend over time

#### 3. **AnalyticsDashboard.js** (NEW)
Location: `agentPng71/src/views/dashboard/AnalyticsDashboard.js`

Features:
- Comprehensive analytics view
- Auto-refresh every 5 minutes
- Manual refresh button
- Time range selector (7/30/90 days)
- Error handling
- Loading states
- Uses all widgets and charts

#### 4. **Dashboard.js** (ENHANCED)
Location: `agentPng71/src/views/dashboard/Dashboard.js`

Current implementation with basic analytics and charts.

### Backend Files (Already Exists)

#### 1. **agentDashboard.js** (Router)
Location: `backend/src/router/agentDashboard.js`

Routes:
- `GET /stats` - Dashboard statistics
- `GET /analytics` - Comprehensive analytics
- `GET /recent-activity` - Recent activity
- `GET /users/list` - User list with pagination
- `GET /users/agents` - Agent list
- `GET /users/subagents` - Sub-agent list
- `GET /transactions/pending-deposits` - Pending deposits
- `GET /transactions/pending-withdrawals` - Pending withdrawals
- `GET /transactions/recent` - Recent transactions

#### 2. **AgentDashboard.js** (Controller)
Location: `backend/src/controllers/AgentDashboard.js`

Methods:
- `getDashboardStats()` - Calculate comprehensive statistics
- `getAnalytics()` - Generate detailed analytics with charts data
- `getRecentActivity()` - Fetch recent transactions, users, logins
- `getUserList()` - Paginated user list
- `getPendingDeposits()` - Pending deposit transactions
- `getPendingWithdrawals()` - Pending withdrawal transactions

---

## 🚀 Features Implemented

### 1. **Real-time Statistics**
✅ Total users count
✅ Online/offline user distribution
✅ Deposit/withdrawal totals
✅ Betting volume tracking
✅ Net revenue calculation

### 2. **Growth Metrics**
✅ Month-over-month comparisons
✅ Growth percentage calculations
✅ Trend indicators (up/down arrows)
✅ Color-coded progress bars

### 3. **Advanced Visualizations**
✅ Line charts for cash flow
✅ Doughnut charts for payment breakdown
✅ Bar charts for comparisons
✅ Pie charts for distributions
✅ Multi-dataset charts

### 4. **Time-based Analytics**
✅ 7-day cash flow analysis
✅ Monthly comparisons
✅ Daily revenue tracking
✅ Historical data (12 months)

### 5. **User Insights**
✅ Top users by balance
✅ Online user tracking
✅ New user growth
✅ User activity monitoring

### 6. **Transaction Analytics**
✅ Deposit trends
✅ Withdrawal patterns
✅ Pending transaction counts
✅ Payment gateway breakdown

### 7. **Real-time Updates**
✅ Auto-refresh every 5 minutes
✅ Manual refresh button
✅ Loading states
✅ Error handling

---

## 📊 Dashboard Data Structure

### Analytics Response
```javascript
{
  success: true,
  data: {
    summary: {
      totalUsers: 150,
      onlineUsers: 45,
      totalDeposit: 500000,
      totalWithdraw: 300000,
      totalBalance: 200000,
      netRevenue: 200000,
      todayDeposit: 15000,
      todayWithdraw: 8000,
      thisMonthBetting: 750000,
      lastMonthBetting: 650000
    },
    growth: {
      users: 12.5,        // % growth
      deposits: 25.3,
      withdrawals: -5.2,
      betting: 15.4
    },
    monthly: {
      thisMonth: {
        users: 25,
        deposits: 125000,
        withdrawals: 75000,
        betting: 250000
      },
      lastMonth: {
        users: 20,
        deposits: 100000,
        withdrawals: 80000,
        betting: 220000
      }
    },
    charts: {
      dailyFlow: [
        { date: '2026-02-26', deposit: 25000, withdraw: 15000 },
        { date: '2026-02-27', deposit: 30000, withdraw: 18000 },
        // ... 7 days
      ],
      paymentBreakdown: [
        { name: 'bKash', value: 150000 },
        { name: 'Nagad', value: 100000 },
        { name: 'Rocket', value: 75000 }
      ]
    },
    topUsers: [
      {
        userId: 'U12345',
        username: 'player1',
        balance: 50000,
        joinedAt: '2026-01-15T10:30:00Z'
      },
      // ... top 5 users
    ],
    generatedAt: '2026-03-04T10:30:00Z'
  }
}
```

---

## 🎨 UI Components

### Widget Types

#### 1. StatsWidget
```jsx
<StatsWidget
  title="Total Users"
  value={150}
  growth={12.5}
  color="info"
/>
```

#### 2. QuickStatCard
```jsx
<QuickStatCard
  title="Total Balance"
  value={200000}
  icon={cilCash}
  color="primary"
  prefix="৳ "
/>
```

#### 3. Chart Components
```jsx
<DailyCashFlowChart dailyFlow={chartData} />
<PaymentBreakdownChart paymentBreakdown={gatewayData} />
<UserDistributionChart totalUsers={150} onlineUsers={45} />
```

---

## 🔧 Usage Guide

### Using Standard Dashboard
```javascript
// In routes.js
import Dashboard from './views/dashboard/Dashboard'

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  // ...
]
```

### Using Enhanced Analytics Dashboard
```javascript
// In routes.js
import AnalyticsDashboard from './views/dashboard/AnalyticsDashboard'

const routes = [
  { path: '/analytics', name: 'Analytics', element: AnalyticsDashboard },
  // OR replace standard dashboard
  { path: '/dashboard', name: 'Dashboard', element: AnalyticsDashboard },
]
```

### Custom Widget Usage
```javascript
import { StatsWidget, TopUsersWidget } from './views/dashboard/DashboardWidgets'
import { DailyCashFlowChart } from './views/dashboard/DashboardCharts'

function MyCustomDashboard() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    dashBoardService.getAnalytics().then(res => setData(res.data))
  }, [])
  
  return (
    <>
      <StatsWidget title="Users" value={data.summary.totalUsers} growth={data.growth.users} />
      <DailyCashFlowChart dailyFlow={data.charts.dailyFlow} />
      <TopUsersWidget users={data.topUsers} />
    </>
  )
}
```

---

## 📈 API Endpoints

### GET /api/agent-dashboard/stats
Returns basic dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "onlineUsers": 45,
    "totalDeposit": 500000,
    "totalWithdraw": 300000,
    "growth": { "users": 12.5, "deposits": 25.3 }
  }
}
```

### GET /api/agent-dashboard/analytics
Returns comprehensive analytics with chart data

**Response:** See "Dashboard Data Structure" above

### GET /api/agent-dashboard/recent-activity
Returns recent transactions, users, and logins

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "newUsers": [...],
    "recentLogins": [...]
  }
}
```

---

## 🎯 Key Metrics Explained

### Growth Calculation
```
Growth (%) = ((Current - Previous) / Previous) * 100
```

### Net Revenue
```
Net Revenue = Total Deposits - Total Withdrawals
```

### User Activity Rate
```
Activity Rate (%) = (Online Users / Total Users) * 100
```

---

## 🔄 Auto-Refresh Feature

The dashboard auto-refreshes every 5 minutes:

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    loadDashboardData(true);  // Silent refresh
  }, 5 * 60 * 1000);  // 5 minutes

  return () => clearInterval(interval);
}, []);
```

Manual refresh button also available for immediate updates.

---

## 🎨 Color Scheme

- **Primary (Blue)**: General information
- **Success (Green)**: Positive metrics, deposits
- **Danger (Red)**: Negative metrics, withdrawals
- **Warning (Yellow)**: Caution metrics, betting
- **Info (Cyan)**: User-related metrics

---

## 📊 Chart Customization

All charts use Chart.js (via @coreui/react-chartjs) and support:
- Custom colors
- Tooltips with formatted values
- Responsive design
- Animation effects
- Click interactions (can be added)

Example customization:
```javascript
const chartOptions = {
  plugins: {
    legend: { display: true, position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (context) => `৳ ${context.parsed.y.toLocaleString()}`
      }
    }
  }
}
```

---

## 🚀 Getting Started

### 1. Start Backend
```bash
cd backend
npm start
# Backend runs on http://localhost:5000
```

### 2. Start Frontend
```bash
cd agentPng71
npm start
# Frontend runs on http://localhost:5173
```

### 3. Access Dashboard
Navigate to:
- Standard Dashboard: http://localhost:5173/dashboard
- Analytics Dashboard: http://localhost:5173/analytics (if configured)

### 4. Login
Use your agent credentials to access the dashboard.

---

## 🔒 Security & Authentication

All dashboard endpoints require authentication:
- JWT token must be present in Authorization header
- Token format: `Bearer {token}`
- Middleware: `AgentAuth`
- Filters data based on referral code (agent-specific data only)

---

## 📱 Responsive Design

Dashboard is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-4 column grid
- **Large screens**: Full grid with all widgets

---

## 🐛 Troubleshooting

### Dashboard not loading
1. Check backend is running
2. Verify authentication token exists
3. Check browser console for errors
4. Verify API endpoint URL in `.env`

### Charts not rendering
1. Ensure @coreui/react-chartjs is installed
2. Check chart data structure
3. Verify Chart.js dependencies

### Data not updating
1. Check auto-refresh interval
2. Click manual refresh button
3. Verify API response in Network tab

---

## 📚 Dependencies

### Frontend
- `@coreui/react` - UI components
- `@coreui/react-chartjs` - Chart components
- `@coreui/icons-react` - Icons
- `chart.js` - Chart library (peer dependency)

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - Authentication

---

## 🎯 Next Steps

1. **Add Export Functionality**
   - Export charts as images
   - Export data as CSV/Excel
   - Generate PDF reports

2. **Add Filters**
   - Date range selector
   - User type filters
   - Gateway filters

3. **Add Notifications**
   - Real-time alerts
   - Threshold notifications
   - Email reports

4. **Add More Charts**
   - Heatmaps
   - Funnel charts
   - Scatter plots

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API_CONNECTION_GUIDE.md
3. Check backend logs: `backend/logs/`
4. Inspect browser console

---

**Dashboard Status**: ✅ **FULLY FUNCTIONAL**
**Last Updated**: March 4, 2026
**Components**: 15+ widgets and charts
**API Endpoints**: 8+ endpoints
**Features**: Real-time updates, auto-refresh, responsive design
