// import React from 'react'
// import classNames from 'classnames'

// import {
//   CAvatar,
//   CButton,
//   CButtonGroup,
//   CCard,
//   CCardBody,
//   CCardFooter,
//   CCardHeader,
//   CCol,
//   CProgress,
//   CRow,
//   CTable,
//   CTableBody,
//   CTableDataCell,
//   CTableHead,
//   CTableHeaderCell,
//   CTableRow,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import {
//   cibCcAmex,
//   cibCcApplePay,
//   cibCcMastercard,
//   cibCcPaypal,
//   cibCcStripe,
//   cibCcVisa,
//   cibGoogle,
//   cibFacebook,
//   cibLinkedin,
//   cifBr,
//   cifEs,
//   cifFr,
//   cifIn,
//   cifPl,
//   cifUs,
//   cibTwitter,
//   cilCloudDownload,
//   cilPeople,
//   cilUser,
//   cilUserFemale,
//   cilCash,
// } from '@coreui/icons'

// import avatar1 from 'src/assets/images/avatars/1.jpg'
// import avatar2 from 'src/assets/images/avatars/2.jpg'
// import avatar3 from 'src/assets/images/avatars/3.jpg'
// import avatar4 from 'src/assets/images/avatars/4.jpg'
// import avatar5 from 'src/assets/images/avatars/5.jpg'
// import avatar6 from 'src/assets/images/avatars/6.jpg'

// import WidgetsBrand from '../widgets/WidgetsBrand'
// import WidgetsDropdown from '../widgets/WidgetsDropdown'
// import MainChart from './MainChart'

// const Dashboard = () => {
//   const progressExample = [
//     { title: 'Total Users', value: 'user.totalUsers', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'success' },
//     { title: 'Total Online', value: 'user.totalOnline', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'info' },
//     { title: 'Total Deposit', value: 'user.totalDeposit', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'warning' },
//     { title: 'Total Withdraw', value: 'user.totalWithdraw', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'danger' },
//     { title: 'Total Balance', value: 'user.totalBalance', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'primary' },
//     // { title: 'Total Betting', value: 'Average Rate', percent: 40.15, color: 'primary' },
//     // { title: 'Total Turnover', value: 'Average Rate', percent: 40.15, color: 'primary' },
//   ]

//   const progressGroupExample1 = [
//     { title: 'Monday', value1: 34, value2: 78 },
//     { title: 'Tuesday', value1: 56, value2: 94 },
//     { title: 'Wednesday', value1: 12, value2: 67 },
//     { title: 'Thursday', value1: 43, value2: 91 },
//     { title: 'Friday', value1: 22, value2: 73 },
//     { title: 'Saturday', value1: 53, value2: 82 },
//     { title: 'Sunday', value1: 9, value2: 69 },
//   ]

//   const progressGroupExample2 = [
//     { title: 'Total Withdraw', icon: cilCash, value: "ThisMonthWithdrawal - LastMonthWithdrawal" },
//     { title: 'Total Deposit', icon: cilUserFemale, value: "ThisMonthWithdrawal - LastMonthWithdrawal" },
//   ]

//   const progressGroupExample3 = [
//     { title: 'Total ProfitLoss', icon: cibGoogle, percent: "{(ThisMonth - LastMonth)/LastMonth}*100", value: 'Total Deposit' },
//     { title: 'Total Bet', icon: cibFacebook, percent: "{(ThisMonth - LastMonth)/LastMonth}*100", value: 'user.totalBet' },
//     { title: 'Total userBonus', icon: cibTwitter, percent: "{(ThisMonth - LastMonth)/LastMonth}*100", value: 'user.totalUserBonus' },
//     { title: 'Total userReffaralBonus', icon: cibLinkedin, percent: "{(ThisMonth - LastMonth)/LastMonth}*100", value: 'user.totalUserReffaralBonus' },
//   ]

//   const tableExample = [
//     {
//       avatar: { src: avatar1, status: 'success' },
//       user: {
//         name: 'Yiorgos Avraamu',
//         new: true,
//         registered: 'Jan 1, 2023',
//       },
//       country: { name: 'USA', flag: cifUs },
//       usage: {
//         value: 50,
//         period: 'Jun 11, 2023 - Jul 10, 2023',
//         color: 'success',
//       },
//       payment: { name: 'Mastercard', icon: cibCcMastercard },
//       activity: '10 sec ago',
//     },
//     {
//       avatar: { src: avatar2, status: 'danger' },
//       user: {
//         name: 'Avram Tarasios',
//         new: false,
//         registered: 'Jan 1, 2023',
//       },
//       country: { name: 'Brazil', flag: cifBr },
//       usage: {
//         value: 22,
//         period: 'Jun 11, 2023 - Jul 10, 2023',
//         color: 'info',
//       },
//       payment: { name: 'Visa', icon: cibCcVisa },
//       activity: '5 minutes ago',
//     },
//     {
//       avatar: { src: avatar3, status: 'warning' },
//       user: { name: 'Quintin Ed', new: true, registered: 'Jan 1, 2023' },
//       country: { name: 'India', flag: cifIn },
//       usage: {
//         value: 74,
//         period: 'Jun 11, 2023 - Jul 10, 2023',
//         color: 'warning',
//       },
//       payment: { name: 'Stripe', icon: cibCcStripe },
//       activity: '1 hour ago',
//     },
//     {
//       avatar: { src: avatar4, status: 'secondary' },
//       user: { name: 'Enéas Kwadwo', new: true, registered: 'Jan 1, 2023' },
//       country: { name: 'France', flag: cifFr },
//       usage: {
//         value: 98,
//         period: 'Jun 11, 2023 - Jul 10, 2023',
//         color: 'danger',
//       },
//       payment: { name: 'PayPal', icon: cibCcPaypal },
//       activity: 'Last month',
//     },
//     {
//       avatar: { src: avatar5, status: 'success' },
//       user: {
//         name: 'Agapetus Tadeáš',
//         new: true,
//         registered: 'Jan 1, 2023',
//       },
//       country: { name: 'Spain', flag: cifEs },
//       usage: {
//         value: 22,
//         period: 'Jun 11, 2023 - Jul 10, 2023',
//         color: 'primary',
//       },
//       payment: { name: 'Google Wallet', icon: cibCcApplePay },
//       activity: 'Last week',
//     },
//     {
//       avatar: { src: avatar6, status: 'danger' },
//       user: {
//         name: 'Friderik Dávid',
//         new: true,
//         registered: 'Jan 1, 2023',
//       },
//       country: { name: 'Poland', flag: cifPl },
//       usage: {
//         value: 43,
//         period: 'Jun 11, 2023 - Jul 10, 2023',
//         color: 'success',
//       },
//       payment: { name: 'Amex', icon: cibCcAmex },
//       activity: 'Last week',
//     },
//   ]

//   return (
//     <>
//       <WidgetsDropdown className="mb-4" />
//       <CCard className="mb-4">
//         <CCardBody>
//           <CRow>
//             <CCol sm={5}>
//               <h4 id="traffic" className="card-title mb-0">
//                 Traffic
//               </h4>
//               <div className="small text-body-secondary">January - July 2023</div>
//             </CCol>
//             <CCol sm={7} className="d-none d-md-block">
//               <CButton color="primary" className="float-end">
//                 <CIcon icon={cilCloudDownload} />
//               </CButton>
//               <CButtonGroup className="float-end me-3">
//                 {['Day', 'Month', 'Year'].map((value) => (
//                   <CButton
//                     color="outline-secondary"
//                     key={value}
//                     className="mx-0"
//                     active={value === 'Month'}
//                   >
//                     {value}
//                   </CButton>
//                 ))}
//               </CButtonGroup>
//             </CCol>
//           </CRow>
//           <MainChart />
//         </CCardBody>
//         <CCardFooter>
//           <CRow
//             xs={{ cols: 1, gutter: 4 }}
//             sm={{ cols: 2 }}
//             lg={{ cols: 4 }}
//             xl={{ cols: 5 }}
//             className="mb-2 text-center"
//           >
//             {progressExample.map((item, index, items) => (
//               <CCol
//                 className={classNames({
//                   'd-none d-xl-block': index + 1 === items.length,
//                 })}
//                 key={index}
//               >
//                 <div className="text-body-secondary">{item.title}</div>
//                 <div className="fw-semibold text-truncate">
//                   {item.value} ({item.percent}%)
//                 </div>
//                 <CProgress thin className="mt-2" color={item.color} value={item.percent} />
//               </CCol>
//             ))}
//           </CRow>
//         </CCardFooter>
//       </CCard>
//       <WidgetsBrand className="mb-4" withCharts />
//       <CRow>
//         <CCol xs>
//           <CCard className="mb-4">
//             <CCardHeader>Traffic {' & '} Sales</CCardHeader>
//             <CCardBody>
//               <CRow>
//                 <CCol xs={12} md={6} xl={6}>
//                   <CRow>
//                     <CCol xs={6}>
//                       <div className="border-start border-start-4 border-start-info py-1 px-3">
//                         <div className="text-body-secondary text-truncate small">New Clients</div>
//                         <div className="fs-5 fw-semibold">9,123</div>
//                       </div>
//                     </CCol>
//                     <CCol xs={6}>
//                       <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
//                         <div className="text-body-secondary text-truncate small">
//                           Recurring Clients
//                         </div>
//                         <div className="fs-5 fw-semibold">22,643</div>
//                       </div>
//                     </CCol>
//                   </CRow>
//                   <hr className="mt-0" />
//                   {progressGroupExample1.map((item, index) => (
//                     <div className="progress-group mb-4" key={index}>
//                       <div className="progress-group-prepend">
//                         <span className="text-body-secondary small">{item.title}</span>
//                       </div>
//                       <div className="progress-group-bars">
//                         <CProgress thin color="info" value={item.value1} />
//                         <CProgress thin color="danger" value={item.value2} />
//                       </div>
//                     </div>
//                   ))}
//                 </CCol>
//                 <CCol xs={12} md={6} xl={6}>
//                   <CRow>
//                     <CCol xs={6}>
//                       <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
//                         <div className="text-body-secondary text-truncate small">Pageviews</div>
//                         <div className="fs-5 fw-semibold">78,623</div>
//                       </div>
//                     </CCol>
//                     <CCol xs={6}>
//                       <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
//                         <div className="text-body-secondary text-truncate small">Organic</div>
//                         <div className="fs-5 fw-semibold">49,123</div>
//                       </div>
//                     </CCol>
//                   </CRow>

//                   <hr className="mt-0" />

//                   {progressGroupExample2.map((item, index) => (
//                     <div className="progress-group mb-4" key={index}>
//                       <div className="progress-group-header">
//                         <CIcon className="me-2" icon={item.icon} size="lg" />
//                         <span>{item.title}</span>
//                         <span className="ms-auto fw-semibold">{item.value}%</span>
//                       </div>
//                       <div className="progress-group-bars">
//                         <CProgress thin color="warning" value={item.value} />
//                       </div>
//                     </div>
//                   ))}

//                   <div className="mb-5"></div>

//                   {progressGroupExample3.map((item, index) => (
//                     <div className="progress-group" key={index}>
//                       <div className="progress-group-header">
//                         <CIcon className="me-2" icon={item.icon} size="lg" />
//                         <span>{item.title}</span>
//                         <span className="ms-auto fw-semibold">
//                           {item.value}{' '}
//                           <span className="text-body-secondary small">({item.percent}%)</span>
//                         </span>
//                       </div>
//                       <div className="progress-group-bars">
//                         <CProgress thin color="success" value={item.percent} />
//                       </div>
//                     </div>
//                   ))}
//                 </CCol>
//               </CRow>

//               <br />

//               <CTable align="middle" className="mb-0 border" hover responsive>
//                 <CTableHead className="text-nowrap">
//                   <CTableRow>
//                     <CTableHeaderCell className="bg-body-tertiary text-center">
//                       <CIcon icon={cilPeople} />
//                     </CTableHeaderCell>
//                     <CTableHeaderCell className="bg-body-tertiary">User</CTableHeaderCell>
//                     <CTableHeaderCell className="bg-body-tertiary text-center">
//                       Country
//                     </CTableHeaderCell>
//                     <CTableHeaderCell className="bg-body-tertiary">Usage</CTableHeaderCell>
//                     <CTableHeaderCell className="bg-body-tertiary text-center">
//                       Payment Method
//                     </CTableHeaderCell>
//                     <CTableHeaderCell className="bg-body-tertiary">Activity</CTableHeaderCell>
//                   </CTableRow>
//                 </CTableHead>
//                 <CTableBody>
//                   {tableExample.map((item, index) => (
//                     <CTableRow v-for="item in tableItems" key={index}>
//                       <CTableDataCell className="text-center">
//                         <CAvatar size="md" src={item.avatar.src} status={item.avatar.status} />
//                       </CTableDataCell>
//                       <CTableDataCell>
//                         <div>{item.user.name}</div>
//                         <div className="small text-body-secondary text-nowrap">
//                           <span>{item.user.new ? 'New' : 'Recurring'}</span> | Registered:{' '}
//                           {item.user.registered}
//                         </div>
//                       </CTableDataCell>
//                       <CTableDataCell className="text-center">
//                         <CIcon size="xl" icon={item.country.flag} title={item.country.name} />
//                       </CTableDataCell>
//                       <CTableDataCell>
//                         <div className="d-flex justify-content-between text-nowrap">
//                           <div className="fw-semibold">{item.usage.value}%</div>
//                           <div className="ms-3">
//                             <small className="text-body-secondary">{item.usage.period}</small>
//                           </div>
//                         </div>
//                         <CProgress thin color={item.usage.color} value={item.usage.value} />
//                       </CTableDataCell>
//                       <CTableDataCell className="text-center">
//                         <CIcon size="xl" icon={item.payment.icon} />
//                       </CTableDataCell>
//                       <CTableDataCell>
//                         <div className="small text-body-secondary text-nowrap">Last login</div>
//                         <div className="fw-semibold text-nowrap">{item.activity}</div>
//                       </CTableDataCell>
//                     </CTableRow>
//                   ))}
//                 </CTableBody>
//               </CTable>
//             </CCardBody>
//           </CCard>
//         </CCol>
//       </CRow>
//     </>
//   )
// }

// export default Dashboard

import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartDoughnut, CChartLine } from '@coreui/react-chartjs'
import { dashBoardService } from '../../service/dashBoardService'

const formatAmount = (value = 0) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })

const StatCard = ({ title, value, growth, color = 'primary', prefix = '' }) => (
  <CCard className="mb-4 h-100">
    <CCardBody>
      <div className="text-medium-emphasis small">{title}</div>
      <div className="fs-4 fw-semibold mt-1">
        {prefix}
        {formatAmount(value)}
      </div>
      <div className="mt-2 d-flex align-items-center justify-content-between">
        <span className={`small ${growth >= 0 ? 'text-success' : 'text-danger'}`}>
          {growth >= 0 ? '+' : ''}
          {formatAmount(growth)}%
        </span>
        <CBadge color={growth >= 0 ? 'success' : 'danger'}>{growth >= 0 ? 'Up' : 'Down'}</CBadge>
      </div>
      <CProgress className="mt-2" value={Math.min(Math.abs(growth), 100)} color={color} />
    </CCardBody>
  </CCard>
)

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await dashBoardService.getAnalytics()
        setAnalytics(response?.data || null)
      } catch (err) {
        setError(err?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const dailyFlowChart = useMemo(() => {
    const rows = analytics?.charts?.dailyFlow || []
    return {
      labels: rows.map((item) => item.date),
      datasets: [
        {
          label: 'Deposits',
          data: rows.map((item) => item.deposit || 0),
          borderColor: '#2eb85c',
          backgroundColor: 'rgba(46, 184, 92, 0.15)',
          fill: true,
          tension: 0.35,
        },
        {
          label: 'Withdrawals',
          data: rows.map((item) => item.withdraw || 0),
          borderColor: '#e55353',
          backgroundColor: 'rgba(229, 83, 83, 0.12)',
          fill: true,
          tension: 0.35,
        },
      ],
    }
  }, [analytics])

  const paymentBreakdownChart = useMemo(() => {
    const rows = analytics?.charts?.paymentBreakdown || []
    const colors = ['#321fdb', '#39f', '#f9b115', '#2eb85c', '#e55353', '#6f42c1']

    return {
      labels: rows.map((item) => item.name),
      datasets: [
        {
          data: rows.map((item) => item.value || 0),
          backgroundColor: rows.map((_, index) => colors[index % colors.length]),
        },
      ],
    }
  }, [analytics])

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="mt-2">Loading analytics...</div>
      </div>
    )
  }

  if (error || !analytics) {
    return <CAlert color="danger">{error || 'Analytics data unavailable'}</CAlert>
  }

  const summary = analytics.summary || {}
  const growth = analytics.growth || {}

  return (
    <>
      <CRow>
        <CCol sm={6} xl={3}>
          <StatCard title="Total Users" value={summary.totalUsers} growth={growth.users || 0} color="info" />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard title="Total Deposit" value={summary.totalDeposit} growth={growth.deposits || 0} color="success" prefix="৳ " />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard title="Total Withdraw" value={summary.totalWithdraw} growth={growth.withdrawals || 0} color="danger" prefix="৳ " />
        </CCol>
        <CCol sm={6} xl={3}>
          <StatCard title="This Month Betting" value={summary.thisMonthBetting} growth={growth.betting || 0} color="warning" prefix="৳ " />
        </CCol>
      </CRow>

      <CRow>
        <CCol lg={8}>
          <CCard className="mb-4">
            <CCardHeader>7-Day Cash Flow</CCardHeader>
            <CCardBody>
              <CChartLine
                data={dailyFlowChart}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: true } },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
                style={{ height: '320px' }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4">
            <CCardHeader>Payment Breakdown (This Month)</CCardHeader>
            <CCardBody>
              {paymentBreakdownChart.labels.length ? (
                <CChartDoughnut
                  data={paymentBreakdownChart}
                  options={{ plugins: { legend: { position: 'bottom' } } }}
                  style={{ maxHeight: '320px' }}
                />
              ) : (
                <div className="text-medium-emphasis">No payment data this month.</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol lg={7}>
          <CCard className="mb-4">
            <CCardHeader>Top Users by Balance</CCardHeader>
            <CCardBody className="p-0">
              <CTable hover responsive className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>User ID</CTableHeaderCell>
                    <CTableHeaderCell>Username</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {(analytics.topUsers || []).map((user) => (
                    <CTableRow key={user.userId}>
                      <CTableDataCell>{user.userId}</CTableDataCell>
                      <CTableDataCell>{user.username || '-'}</CTableDataCell>
                      <CTableDataCell className="text-end">৳ {formatAmount(user.balance)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={5}>
          <CCard className="mb-4">
            <CCardHeader>Quick Summary</CCardHeader>
            <CCardBody>
              <div className="d-flex justify-content-between mb-2">
                <span>Online Users</span>
                <strong>{formatAmount(summary.onlineUsers)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Today Deposit</span>
                <strong>৳ {formatAmount(summary.todayDeposit)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Today Withdraw</span>
                <strong>৳ {formatAmount(summary.todayWithdraw)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Balance</span>
                <strong>৳ {formatAmount(summary.totalBalance)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Net Revenue</span>
                <strong className={summary.netRevenue >= 0 ? 'text-success' : 'text-danger'}>
                  ৳ {formatAmount(summary.netRevenue)}
                </strong>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
