import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CBadge,
  CSpinner,
  CAlert,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormSelect,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CProgress,
  CProgressBar,
} from '@coreui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import axios from 'axios'
import moment from 'moment-timezone'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilMoney,
  cilGamepad,
  cilChartPie,
  cilShieldAlt,
  cilStar,
  cilCalendar,
  cilReload,
  cilCloudDownload,
} from '@coreui/icons'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const UnifiedDynamicDashboard = () => {
  // =============================================
  // STATE MANAGEMENT
  // =============================================
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [realtimeData, setRealtimeData] = useState(null)
  const [systemHealth, setSystemHealth] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    timeZone: 'UTC',
    modules: 'all',
  })

  // Active modules
  const [enabledModules, setEnabledModules] = useState({
    users: true,
    transactions: true,
    betting: true,
    affiliates: true,
    agents: true,
    games: true,
    finance: true,
    security: true,
    promotions: true,
    vip: true,
    analytics: true,
  })

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  // =============================================
  // DATA FETCHING
  // =============================================
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const modules = Object.keys(enabledModules)
        .filter((key) => enabledModules[key])
        .join(',')

      const response = await axios.get(`${API_BASE_URL}/unified-dashboard`, {
        params: {
          ...filters,
          modules: modules || 'all',
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_auth_token')}`,
        },
      })

      if (response.data.success) {
        setDashboardData(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, enabledModules])

  const fetchRealtimeData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/unified-dashboard/realtime`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_auth_token')}`,
        },
      })

      if (response.data.success) {
        setRealtimeData(response.data.data)
      }
    } catch (err) {
      console.error('Realtime data error:', err)
    }
  }, [])

  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/unified-dashboard/system-health`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_auth_token')}`,
        },
      })

      if (response.data.success) {
        setSystemHealth(response.data.data)
      }
    } catch (err) {
      console.error('System health error:', err)
    }
  }, [])

  // =============================================
  // EFFECTS
  // =============================================
  useEffect(() => {
    fetchDashboardData()
    fetchRealtimeData()
    fetchSystemHealth()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchRealtimeData()
        fetchSystemHealth()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchRealtimeData, fetchSystemHealth])

  // =============================================
  // HANDLERS
  // =============================================
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleModuleToggle = (module) => {
    setEnabledModules((prev) => ({ ...prev, [module]: !prev[module] }))
  }

  const handleRefresh = () => {
    fetchDashboardData()
    fetchRealtimeData()
    fetchSystemHealth()
  }

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/unified-dashboard/export`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_auth_token')}`,
        },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dashboard-${moment().format('YYYY-MM-DD')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Export error:', err)
    }
  }

  // =============================================
  // RENDER MODULES
  // =============================================
  const renderOverview = () => {
    if (!dashboardData) return null

    const modules = Object.keys(dashboardData).filter(
      (key) => key !== 'realtime' && key !== 'systemHealth',
    )

    return (
      <CRow>
        {/* Real-time Stats */}
        {realtimeData && (
          <CCol xs={12} className="mb-4">
            <CCard>
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Real-time Statistics</strong>
                <CBadge color="success" className="pulse">
                  LIVE
                </CBadge>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol sm={6} md={3}>
                    <div className="text-center mb-3">
                      <CIcon icon={cilPeople} size="xl" className="text-info mb-2" />
                      <h3>{realtimeData.onlineUsers || 0}</h3>
                      <p className="text-muted mb-0">Online Users</p>
                    </div>
                  </CCol>
                  <CCol sm={6} md={3}>
                    <div className="text-center mb-3">
                      <CIcon icon={cilGamepad} size="xl" className="text-success mb-2" />
                      <h3>{realtimeData.last5Minutes?.bets || 0}</h3>
                      <p className="text-muted mb-0">Bets (Last 5m)</p>
                    </div>
                  </CCol>
                  <CCol sm={6} md={3}>
                    <div className="text-center mb-3">
                      <CIcon icon={cilMoney} size="xl" className="text-warning mb-2" />
                      <h3>{realtimeData.last5Minutes?.deposits || 0}</h3>
                      <p className="text-muted mb-0">Deposits (Last 5m)</p>
                    </div>
                  </CCol>
                  <CCol sm={6} md={3}>
                    <div className="text-center mb-3">
                      <CIcon icon={cilChartPie} size="xl" className="text-danger mb-2" />
                      <h3>{realtimeData.activeGames || 0}</h3>
                      <p className="text-muted mb-0">Active Games</p>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        )}

        {/* Module Summaries */}
        {modules.map((module) => {
          const data = dashboardData[module]
          if (!data || !data.summary) return null

          return (
            <CCol xs={12} md={6} lg={4} key={module} className="mb-4">
              <CCard className="h-100">
                <CCardHeader>
                  <strong className="text-capitalize">{module}</strong>
                </CCardHeader>
                <CCardBody>
                  {Object.entries(data.summary).map(([key, value]) => (
                    <div key={key} className="d-flex justify-content-between mb-2">
                      <span className="text-capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong>
                    </div>
                  ))}
                </CCardBody>
              </CCard>
            </CCol>
          )
        })}
      </CRow>
    )
  }

  const renderUsersModule = () => {
    const users = dashboardData?.users
    if (!users) return null

    return (
      <CRow>
        <CCol xs={12} className="mb-4">
          <CCard>
            <CCardHeader>
              <strong>User Statistics</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={3}>
                  <div className="border-start border-start-4 border-start-info py-3 px-3 mb-3">
                    <h3 className="mb-0">{users.summary.total.toLocaleString()}</h3>
                    <span className="text-muted">Total Users</span>
                  </div>
                </CCol>
                <CCol md={3}>
                  <div className="border-start border-start-4 border-start-success py-3 px-3 mb-3">
                    <h3 className="mb-0">{users.summary.new.toLocaleString()}</h3>
                    <span className="text-muted">New Users</span>
                  </div>
                </CCol>
                <CCol md={3}>
                  <div className="border-start border-start-4 border-start-warning py-3 px-3 mb-3">
                    <h3 className="mb-0">{users.summary.active.toLocaleString()}</h3>
                    <span className="text-muted">Active Users</span>
                  </div>
                </CCol>
                <CCol md={3}>
                  <div className="border-start border-start-4 border-start-danger py-3 px-3 mb-3">
                    <h3 className="mb-0">{users.summary.online.toLocaleString()}</h3>
                    <span className="text-muted">Online Now</span>
                  </div>
                </CCol>
              </CRow>

              {users.growth && users.growth.length > 0 && (
                <div className="mt-4">
                  <h5>User Growth Trend</h5>
                  <Line
                    data={{
                      labels: users.growth.map((d) => d._id),
                      datasets: [
                        {
                          label: 'New Users',
                          data: users.growth.map((d) => d.count),
                          borderColor: 'rgb(75, 192, 192)',
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: true },
                        title: { display: false },
                      },
                    }}
                  />
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {users.byCountry && users.byCountry.length > 0 && (
          <CCol xs={12} md={6} className="mb-4">
            <CCard className="h-100">
              <CCardHeader>
                <strong>Users by Country</strong>
              </CCardHeader>
              <CCardBody>
                <Doughnut
                  data={{
                    labels: users.byCountry.map((c) => c._id || 'Unknown'),
                    datasets: [
                      {
                        data: users.byCountry.map((c) => c.count),
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.8)',
                          'rgba(54, 162, 235, 0.8)',
                          'rgba(255, 206, 86, 0.8)',
                          'rgba(75, 192, 192, 0.8)',
                          'rgba(153, 102, 255, 0.8)',
                          'rgba(255, 159, 64, 0.8)',
                          'rgba(199, 199, 199, 0.8)',
                          'rgba(83, 102, 255, 0.8)',
                          'rgba(255, 99, 255, 0.8)',
                          'rgba(99, 255, 132, 0.8)',
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        )}

        {users.byDevice && users.byDevice.length > 0 && (
          <CCol xs={12} md={6} className="mb-4">
            <CCard className="h-100">
              <CCardHeader>
                <strong>Users by Device</strong>
              </CCardHeader>
              <CCardBody>
                <Pie
                  data={{
                    labels: users.byDevice.map((d) => d._id || 'Unknown'),
                    datasets: [
                      {
                        data: users.byDevice.map((d) => d.count),
                        backgroundColor: [
                          'rgba(54, 162, 235, 0.8)',
                          'rgba(255, 99, 132, 0.8)',
                          'rgba(255, 206, 86, 0.8)',
                          'rgba(75, 192, 192, 0.8)',
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        )}

        {users.topUsers && users.topUsers.length > 0 && (
          <CCol xs={12} className="mb-4">
            <CCard>
              <CCardHeader>
                <strong>Top Users</strong>
              </CCardHeader>
              <CCardBody>
                <CTable striped hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>User</CTableHeaderCell>
                      <CTableHeaderCell>Total Bets</CTableHeaderCell>
                      <CTableHeaderCell>Bet Amount</CTableHeaderCell>
                      <CTableHeaderCell>Win Amount</CTableHeaderCell>
                      <CTableHeaderCell>Profit/Loss</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {users.topUsers.map((user, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>{user.user?.[0]?.username || user._id}</CTableDataCell>
                        <CTableDataCell>{user.totalBets.toLocaleString()}</CTableDataCell>
                        <CTableDataCell>${user.totalAmount.toLocaleString()}</CTableDataCell>
                        <CTableDataCell>${user.totalWin.toLocaleString()}</CTableDataCell>
                        <CTableDataCell>
                          <span
                            className={
                              user.totalWin - user.totalAmount > 0 ? 'text-success' : 'text-danger'
                            }
                          >
                            ${(user.totalWin - user.totalAmount).toLocaleString()}
                          </span>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        )}
      </CRow>
    )
  }

  const renderTransactionsModule = () => {
    const transactions = dashboardData?.transactions
    if (!transactions) return null

    return (
      <CRow>
        <CCol xs={12} className="mb-4">
          <CCard>
            <CCardHeader>
              <strong>Transaction Overview</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <h5>Deposits</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Total:</span>
                      <strong>{transactions.deposits.total.toLocaleString()}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Pending:</span>
                      <CBadge color="warning">
                        {transactions.deposits.pending.toLocaleString()}
                      </CBadge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Amount:</span>
                      <strong className="text-success">
                        ${transactions.deposits.amount.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <h5>Withdrawals</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Total:</span>
                      <strong>{transactions.withdrawals.total.toLocaleString()}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Pending:</span>
                      <CBadge color="warning">
                        {transactions.withdrawals.pending.toLocaleString()}
                      </CBadge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Amount:</span>
                      <strong className="text-danger">
                        ${transactions.withdrawals.amount.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </CCol>
              </CRow>

              {transactions.trends && transactions.trends.length > 0 && (
                <div className="mt-4">
                  <h5>Transaction Trends</h5>
                  <Line
                    data={{
                      labels: transactions.trends.map((t) => t._id),
                      datasets: [
                        {
                          label: 'Deposits',
                          data: transactions.trends.map((t) => t.deposits),
                          borderColor: 'rgb(75, 192, 192)',
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        },
                        {
                          label: 'Withdrawals',
                          data: transactions.trends.map((t) => t.withdrawals),
                          borderColor: 'rgb(255, 99, 132)',
                          backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: true },
                      },
                    }}
                  />
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  const renderBettingModule = () => {
    const betting = dashboardData?.betting
    if (!betting) return null

    return (
      <CRow>
        <CCol xs={12} className="mb-4">
          <CCard>
            <CCardHeader>
              <strong>Betting Statistics</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={3}>
                  <div className="border-start border-start-4 border-start-primary py-3 px-3 mb-3">
                    <h3 className="mb-0">{betting.summary.totalBets.toLocaleString()}</h3>
                    <span className="text-muted">Total Bets</span>
                  </div>
                </CCol>
                <CCol md={3}>
                  <div className="border-start border-start-4 border-start-success py-3 px-3 mb-3">
                    <h3 className="mb-0">${betting.summary.betAmount.toLocaleString()}</h3>
                    <span className="text-muted">Bet Amount</span>
                  </div>
                </CCol>
                <CCol md={3}>
                  <div className="border-start border-start-4 border-start-warning py-3 px-3 mb-3">
                    <h3 className="mb-0">${betting.summary.profit.toLocaleString()}</h3>
                    <span className="text-muted">Profit</span>
                  </div>
                </CCol>
                <CCol md={3}>
                  <div className="border-start border-start-4 border-start-info py-3 px-3 mb-3">
                    <h3 className="mb-0">{betting.summary.margin}%</h3>
                    <span className="text-muted">Margin</span>
                  </div>
                </CCol>
              </CRow>

              {betting.topGames && betting.topGames.length > 0 && (
                <div className="mt-4">
                  <h5>Top Games by Revenue</h5>
                  <Bar
                    data={{
                      labels: betting.topGames.map((g) => g.game?.[0]?.name || g._id),
                      datasets: [
                        {
                          label: 'Revenue',
                          data: betting.topGames.map((g) => g.revenue),
                          backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true },
                      },
                    }}
                  />
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  const renderFinanceModule = () => {
    const finance = dashboardData?.finance
    if (!finance) return null

    return (
      <CRow>
        <CCol xs={12} className="mb-4">
          <CCard>
            <CCardHeader>
              <strong>Financial Summary</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={4}>
                  <div className="border-start border-start-4 border-start-success py-3 px-3 mb-3">
                    <h3 className="mb-0 text-success">
                      ${finance.summary.revenue.toLocaleString()}
                    </h3>
                    <span className="text-muted">Total Revenue</span>
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="border-start border-start-4 border-start-danger py-3 px-3 mb-3">
                    <h3 className="mb-0 text-danger">
                      ${finance.summary.expenses.toLocaleString()}
                    </h3>
                    <span className="text-muted">Total Expenses</span>
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="border-start border-start-4 border-start-primary py-3 px-3 mb-3">
                    <h3 className="mb-0 text-primary">
                      ${finance.summary.netProfit.toLocaleString()}
                    </h3>
                    <span className="text-muted">Net Profit</span>
                  </div>
                </CCol>
              </CRow>

              {finance.bySource && (
                <div className="mt-4">
                  <h5>Revenue by Source</h5>
                  <Doughnut
                    data={{
                      labels: finance.bySource.map((s) => s.source),
                      datasets: [
                        {
                          data: finance.bySource.map((s) => s.amount),
                          backgroundColor: [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  // =============================================
  // MAIN RENDER
  // =============================================
  if (loading && !dashboardData) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" size="lg" />
        <p className="mt-3">Loading dashboard...</p>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <CAlert color="danger">
        <strong>Error:</strong> {error}
        <CButton color="primary" size="sm" className="ms-3" onClick={handleRefresh}>
          Retry
        </CButton>
      </CAlert>
    )
  }

  return (
    <div className="unified-dashboard">
      {/* Header */}
      <CRow className="mb-4">
        <CCol>
          <h2>Unified Dynamic Dashboard</h2>
          <p className="text-muted">Comprehensive view of all system controllers and metrics</p>
        </CCol>
      </CRow>

      {/* Filters and Controls */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CFormLabel>Start Date</CFormLabel>
          <CFormInput
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </CCol>
        <CCol md={3}>
          <CFormLabel>End Date</CFormLabel>
          <CFormInput
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </CCol>
        <CCol md={3}>
          <CFormLabel>Time Zone</CFormLabel>
          <CFormSelect name="timeZone" value={filters.timeZone} onChange={handleFilterChange}>
            <option value="UTC">UTC</option>
            <option value="Asia/Dhaka">Asia/Dhaka</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </CFormSelect>
        </CCol>
        <CCol md={3} className="d-flex align-items-end">
          <CButton color="primary" className="me-2" onClick={fetchDashboardData}>
            <CIcon icon={cilReload} className="me-1" />
            Apply
          </CButton>
          <CButton color="secondary" onClick={handleRefresh}>
            <CIcon icon={cilReload} className="me-1" />
            Refresh
          </CButton>
        </CCol>
      </CRow>

      {/* System Health */}
      {systemHealth && (
        <CRow className="mb-4">
          <CCol>
            <CCard>
              <CCardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>System Status: </strong>
                    <CBadge color="success">{systemHealth.status}</CBadge>
                  </div>
                  <div>
                    <small className="text-muted">
                      Uptime: {Math.floor(systemHealth.uptime / 3600)}h{' '}
                      {Math.floor((systemHealth.uptime % 3600) / 60)}m
                    </small>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Navigation Tabs */}
      <CNav variant="tabs" role="tablist" className="mb-4">
        <CNavItem>
          <CNavLink
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            style={{ cursor: 'pointer' }}
          >
            Overview
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            style={{ cursor: 'pointer' }}
          >
            Users
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 'transactions'}
            onClick={() => setActiveTab('transactions')}
            style={{ cursor: 'pointer' }}
          >
            Transactions
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 'betting'}
            onClick={() => setActiveTab('betting')}
            style={{ cursor: 'pointer' }}
          >
            Betting
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            active={activeTab === 'finance'}
            onClick={() => setActiveTab('finance')}
            style={{ cursor: 'pointer' }}
          >
            Finance
          </CNavLink>
        </CNavItem>
      </CNav>

      {/* Tab Content */}
      <CTabContent>
        <CTabPane visible={activeTab === 'overview'}>{renderOverview()}</CTabPane>
        <CTabPane visible={activeTab === 'users'}>{renderUsersModule()}</CTabPane>
        <CTabPane visible={activeTab === 'transactions'}>{renderTransactionsModule()}</CTabPane>
        <CTabPane visible={activeTab === 'betting'}>{renderBettingModule()}</CTabPane>
        <CTabPane visible={activeTab === 'finance'}>{renderFinanceModule()}</CTabPane>
      </CTabContent>

      <style jsx>{`
        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default UnifiedDynamicDashboard
