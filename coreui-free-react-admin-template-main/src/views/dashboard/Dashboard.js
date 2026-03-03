import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilPeople, cilCash, cilUserFemale, cilChart } from '@coreui/icons'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import { dashBoardService } from '../../service/dashBoardService'
import ApiBalanceWidget from '../widgets/ApiBalanceWidget'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashBoardService.dashboardStats()
        console.log('Dashboard Stats:', data)
        setStats(data)
      } catch (err) {
        console.error('Dashboard fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) return <div>Loading dashboard...</div>
  if (!stats) return <div>Failed to load stats</div>

  const progressExample = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      percent: stats.growth.userGrowth,
      color: 'success',
    },
    { title: 'Online Users', value: stats.onlineUsers, percent: 0, color: 'info' },
    {
      title: 'Total Deposit',
      value: stats.totalDeposit,
      percent: stats.growth.depositGrowth,
      color: 'warning',
    },
    {
      title: 'Total Withdraw',
      value: stats.totalWithdraw,
      percent: stats.growth.withdrawGrowth,
      color: 'danger',
    },
    { title: 'Total Balance', value: stats.totalBalance, percent: 0, color: 'primary' },
    {
      title: 'This Month Betting',
      value: stats.thisMonthBetting,
      percent: stats.growth.bettingGrowth,
      color: 'info',
    },
  ]

  const progressGroupExample2 = [
    { title: 'This Month Deposit', icon: cilCash, value: stats.thisMonthDeposits },
    { title: 'Last Month Deposit', icon: cilCash, value: stats.lastMonthDeposits },
    { title: 'This Month Withdraw', icon: cilUserFemale, value: stats.thisMonthWithdraws },
    { title: 'Last Month Withdraw', icon: cilUserFemale, value: stats.lastMonthWithdraws },
    { title: 'This Month New Users', icon: cilPeople, value: stats.thisMonthNewUsers },
    { title: 'Last Month New Users', icon: cilPeople, value: stats.lastMonthNewUsers },
    { title: 'This Month Betting', icon: cilChart, value: stats.thisMonthBetting },
    { title: 'Last Month Betting', icon: cilChart, value: stats.lastMonthBetting },
  ]

  return (
    <>
      {/* Top KPI Widgets */}
      <WidgetsDropdown className="mb-4" stats={stats.growth} loading={loading} />

      {/* Main Stats Card */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 className="card-title mb-0">Platform Statistics</h4>
              <div className="small text-body-secondary">{new Date().toLocaleDateString()}</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Month'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>

          {/* Main Chart */}
          <MainChart stats={stats} />
        </CCardBody>
        <CCardFooter>
          <CRow xs={{ cols: 1, gutter: 4 }} sm={{ cols: 2 }} lg={{ cols: 3 }} xl={{ cols: 6 }}>
            {progressExample.map((item, index) => (
              <CCol key={index}>
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold">
                  {item.value.toLocaleString()} ({item.percent}%)
                </div>
                <CProgress
                  thin
                  className="mt-2"
                  color={item.color}
                  value={parseFloat(item.percent)}
                />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>

      {/* Brand Widgets */}
      {/* <WidgetsBrand className="mb-4" withCharts stats={stats} /> */}
      <CCol xs={12} md={6} lg={4}>
        <ApiBalanceWidget />
      </CCol>
      {/* Detailed Monthly Breakdown */}
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Monthly Breakdown</CCardHeader>
            <CCardBody>
              {progressGroupExample2.map((item, index) => (
                <div className="progress-group mb-4" key={index}>
                  <div className="progress-group-header">
                    <CIcon className="me-2" icon={item.icon} size="lg" />
                    <span>{item.title}</span>
                    <span className="ms-auto fw-semibold">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="progress-group-bars">
                    <CProgress thin color="warning" value={item.value} />
                  </div>
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
