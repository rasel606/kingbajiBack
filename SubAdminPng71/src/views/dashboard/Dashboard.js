// // import React from 'react'
// // import classNames from 'classnames'

// // import {
// //   CAvatar,
// //   CButton,
// //   CButtonGroup,
// //   CCard,
// //   CCardBody,
// //   CCardFooter,
// //   CCardHeader,
// //   CCol,
// //   CProgress,
// //   CRow,
// //   CTable,
// //   CTableBody,
// //   CTableDataCell,
// //   CTableHead,
// //   CTableHeaderCell,
// //   CTableRow,
// // } from '@coreui/react'
// // import CIcon from '@coreui/icons-react'
// // import {
// //   cibCcAmex,
// //   cibCcApplePay,
// //   cibCcMastercard,
// //   cibCcPaypal,
// //   cibCcStripe,
// //   cibCcVisa,
// //   cibGoogle,
// //   cibFacebook,
// //   cibLinkedin,
// //   cifBr,
// //   cifEs,
// //   cifFr,
// //   cifIn,
// //   cifPl,
// //   cifUs,
// //   cibTwitter,
// //   cilCloudDownload,
// //   cilPeople,
// //   cilUser,
// //   cilUserFemale,
// //   cilCash,
// // } from '@coreui/icons'

// // import avatar1 from 'src/assets/images/avatars/1.jpg'
// // import avatar2 from 'src/assets/images/avatars/2.jpg'
// // import avatar3 from 'src/assets/images/avatars/3.jpg'
// // import avatar4 from 'src/assets/images/avatars/4.jpg'
// // import avatar5 from 'src/assets/images/avatars/5.jpg'
// // import avatar6 from 'src/assets/images/avatars/6.jpg'

// // import WidgetsBrand from '../widgets/WidgetsBrand'
// // import WidgetsDropdown from '../widgets/WidgetsDropdown'
// // import MainChart from './MainChart'

// // const Dashboard = () => {
// //   const progressExample = [
// //     { title: 'Total Users', value: 'user.totalUsers', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'success' },
// //     { title: 'Total Online', value: 'user.totalOnline', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'info' },
// //     { title: 'Total Deposit', value: 'user.totalDeposit', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'warning' },
// //     { title: 'Total Withdraw', value: 'user.totalWithdraw', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'danger' },
// //     { title: 'Total Balance', value: 'user.totalBalance', percent: "{(ThisMonth - LastMonth)/LastMonth}*100", color: 'primary' },
// //     // { title: 'Total Betting', value: 'Average Rate', percent: 40.15, color: 'primary' },
// //     // { title: 'Total Turnover', value: 'Average Rate', percent: 40.15, color: 'primary' },
// //   ]

// //   const progressGroupExample1 = [
// //     { title: 'Monday', value1: 34, value2: 78 },
// //     { title: 'Tuesday', value1: 56, value2: 94 },
// //     { title: 'Wednesday', value1: 12, value2: 67 },
// //     { title: 'Thursday', value1: 43, value2: 91 },
// //     { title: 'Friday', value1: 22, value2: 73 },
// //     { title: 'Saturday', value1: 53, value2: 82 },
// //     { title: 'Sunday', value1: 9, value2: 69 },
// //   ]

// //   const progressGroupExample2 = [
// //     { title: 'Total Withdraw', icon: cilCash, value: "ThisMonthWithdrawal - LastMonthWithdrawal" },
// //     { title: 'Total Deposit', icon: cilUserFemale, value: "ThisMonthWithdrawal - LastMonthWithdrawal" },
// //   ]

// //   const progressGroupExample3 = [
// //     { title: 'Total ProfitLoss', icon: cibGoogle, percent: "{(ThisMonth - LastMonth)/LastMonth}*100", value: 'Total Deposit' },
// //     { title: 'Total Bet', icon: cibFacebook, percent: "{(ThisMonth - LastMonth)/LastMonth}*100", value: 'user.totalBet' },
// //     { title: 'Total userBonus', icon: cibTwitter, percent: "{(ThisMonth - LastMonth)/LastMonth}*100", value: 'user.totalUserBonus' },
// //     { title: 'Total userReffaralBonus', icon: cibLinkedin, percent: "{(ThisMonth - LastMonth)/LastMonth}*100", value: 'user.totalUserReffaralBonus' },
// //   ]

// //   const tableExample = [
// //     {
// //       avatar: { src: avatar1, status: 'success' },
// //       user: {
// //         name: 'Yiorgos Avraamu',
// //         new: true,
// //         registered: 'Jan 1, 2023',
// //       },
// //       country: { name: 'USA', flag: cifUs },
// //       usage: {
// //         value: 50,
// //         period: 'Jun 11, 2023 - Jul 10, 2023',
// //         color: 'success',
// //       },
// //       payment: { name: 'Mastercard', icon: cibCcMastercard },
// //       activity: '10 sec ago',
// //     },
// //     {
// //       avatar: { src: avatar2, status: 'danger' },
// //       user: {
// //         name: 'Avram Tarasios',
// //         new: false,
// //         registered: 'Jan 1, 2023',
// //       },
// //       country: { name: 'Brazil', flag: cifBr },
// //       usage: {
// //         value: 22,
// //         period: 'Jun 11, 2023 - Jul 10, 2023',
// //         color: 'info',
// //       },
// //       payment: { name: 'Visa', icon: cibCcVisa },
// //       activity: '5 minutes ago',
// //     },
// //     {
// //       avatar: { src: avatar3, status: 'warning' },
// //       user: { name: 'Quintin Ed', new: true, registered: 'Jan 1, 2023' },
// //       country: { name: 'India', flag: cifIn },
// //       usage: {
// //         value: 74,
// //         period: 'Jun 11, 2023 - Jul 10, 2023',
// //         color: 'warning',
// //       },
// //       payment: { name: 'Stripe', icon: cibCcStripe },
// //       activity: '1 hour ago',
// //     },
// //     {
// //       avatar: { src: avatar4, status: 'secondary' },
// //       user: { name: 'Enéas Kwadwo', new: true, registered: 'Jan 1, 2023' },
// //       country: { name: 'France', flag: cifFr },
// //       usage: {
// //         value: 98,
// //         period: 'Jun 11, 2023 - Jul 10, 2023',
// //         color: 'danger',
// //       },
// //       payment: { name: 'PayPal', icon: cibCcPaypal },
// //       activity: 'Last month',
// //     },
// //     {
// //       avatar: { src: avatar5, status: 'success' },
// //       user: {
// //         name: 'Agapetus Tadeáš',
// //         new: true,
// //         registered: 'Jan 1, 2023',
// //       },
// //       country: { name: 'Spain', flag: cifEs },
// //       usage: {
// //         value: 22,
// //         period: 'Jun 11, 2023 - Jul 10, 2023',
// //         color: 'primary',
// //       },
// //       payment: { name: 'Google Wallet', icon: cibCcApplePay },
// //       activity: 'Last week',
// //     },
// //     {
// //       avatar: { src: avatar6, status: 'danger' },
// //       user: {
// //         name: 'Friderik Dávid',
// //         new: true,
// //         registered: 'Jan 1, 2023',
// //       },
// //       country: { name: 'Poland', flag: cifPl },
// //       usage: {
// //         value: 43,
// //         period: 'Jun 11, 2023 - Jul 10, 2023',
// //         color: 'success',
// //       },
// //       payment: { name: 'Amex', icon: cibCcAmex },
// //       activity: 'Last week',
// //     },
// //   ]

// //   return (
// //     <>
// //       <WidgetsDropdown className="mb-4" />
// //       <CCard className="mb-4">
// //         <CCardBody>
// //           <CRow>
// //             <CCol sm={5}>
// //               <h4 id="traffic" className="card-title mb-0">
// //                 Traffic
// //               </h4>
// //               <div className="small text-body-secondary">January - July 2023</div>
// //             </CCol>
// //             <CCol sm={7} className="d-none d-md-block">
// //               <CButton color="primary" className="float-end">
// //                 <CIcon icon={cilCloudDownload} />
// //               </CButton>
// //               <CButtonGroup className="float-end me-3">
// //                 {['Day', 'Month', 'Year'].map((value) => (
// //                   <CButton
// //                     color="outline-secondary"
// //                     key={value}
// //                     className="mx-0"
// //                     active={value === 'Month'}
// //                   >
// //                     {value}
// //                   </CButton>
// //                 ))}
// //               </CButtonGroup>
// //             </CCol>
// //           </CRow>
// //           <MainChart />
// //         </CCardBody>
// //         <CCardFooter>
// //           <CRow
// //             xs={{ cols: 1, gutter: 4 }}
// //             sm={{ cols: 2 }}
// //             lg={{ cols: 4 }}
// //             xl={{ cols: 5 }}
// //             className="mb-2 text-center"
// //           >
// //             {progressExample.map((item, index, items) => (
// //               <CCol
// //                 className={classNames({
// //                   'd-none d-xl-block': index + 1 === items.length,
// //                 })}
// //                 key={index}
// //               >
// //                 <div className="text-body-secondary">{item.title}</div>
// //                 <div className="fw-semibold text-truncate">
// //                   {item.value} ({item.percent}%)
// //                 </div>
// //                 <CProgress thin className="mt-2" color={item.color} value={item.percent} />
// //               </CCol>
// //             ))}
// //           </CRow>
// //         </CCardFooter>
// //       </CCard>
// //       <WidgetsBrand className="mb-4" withCharts />
// //       <CRow>
// //         <CCol xs>
// //           <CCard className="mb-4">
// //             <CCardHeader>Traffic {' & '} Sales</CCardHeader>
// //             <CCardBody>
// //               <CRow>
// //                 <CCol xs={12} md={6} xl={6}>
// //                   <CRow>
// //                     <CCol xs={6}>
// //                       <div className="border-start border-start-4 border-start-info py-1 px-3">
// //                         <div className="text-body-secondary text-truncate small">New Clients</div>
// //                         <div className="fs-5 fw-semibold">9,123</div>
// //                       </div>
// //                     </CCol>
// //                     <CCol xs={6}>
// //                       <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
// //                         <div className="text-body-secondary text-truncate small">
// //                           Recurring Clients
// //                         </div>
// //                         <div className="fs-5 fw-semibold">22,643</div>
// //                       </div>
// //                     </CCol>
// //                   </CRow>
// //                   <hr className="mt-0" />
// //                   {progressGroupExample1.map((item, index) => (
// //                     <div className="progress-group mb-4" key={index}>
// //                       <div className="progress-group-prepend">
// //                         <span className="text-body-secondary small">{item.title}</span>
// //                       </div>
// //                       <div className="progress-group-bars">
// //                         <CProgress thin color="info" value={item.value1} />
// //                         <CProgress thin color="danger" value={item.value2} />
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </CCol>
// //                 <CCol xs={12} md={6} xl={6}>
// //                   <CRow>
// //                     <CCol xs={6}>
// //                       <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
// //                         <div className="text-body-secondary text-truncate small">Pageviews</div>
// //                         <div className="fs-5 fw-semibold">78,623</div>
// //                       </div>
// //                     </CCol>
// //                     <CCol xs={6}>
// //                       <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
// //                         <div className="text-body-secondary text-truncate small">Organic</div>
// //                         <div className="fs-5 fw-semibold">49,123</div>
// //                       </div>
// //                     </CCol>
// //                   </CRow>

// //                   <hr className="mt-0" />

// //                   {progressGroupExample2.map((item, index) => (
// //                     <div className="progress-group mb-4" key={index}>
// //                       <div className="progress-group-header">
// //                         <CIcon className="me-2" icon={item.icon} size="lg" />
// //                         <span>{item.title}</span>
// //                         <span className="ms-auto fw-semibold">{item.value}%</span>
// //                       </div>
// //                       <div className="progress-group-bars">
// //                         <CProgress thin color="warning" value={item.value} />
// //                       </div>
// //                     </div>
// //                   ))}

// //                   <div className="mb-5"></div>

// //                   {progressGroupExample3.map((item, index) => (
// //                     <div className="progress-group" key={index}>
// //                       <div className="progress-group-header">
// //                         <CIcon className="me-2" icon={item.icon} size="lg" />
// //                         <span>{item.title}</span>
// //                         <span className="ms-auto fw-semibold">
// //                           {item.value}{' '}
// //                           <span className="text-body-secondary small">({item.percent}%)</span>
// //                         </span>
// //                       </div>
// //                       <div className="progress-group-bars">
// //                         <CProgress thin color="success" value={item.percent} />
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </CCol>
// //               </CRow>

// //               <br />

// //               <CTable align="middle" className="mb-0 border" hover responsive>
// //                 <CTableHead className="text-nowrap">
// //                   <CTableRow>
// //                     <CTableHeaderCell className="bg-body-tertiary text-center">
// //                       <CIcon icon={cilPeople} />
// //                     </CTableHeaderCell>
// //                     <CTableHeaderCell className="bg-body-tertiary">User</CTableHeaderCell>
// //                     <CTableHeaderCell className="bg-body-tertiary text-center">
// //                       Country
// //                     </CTableHeaderCell>
// //                     <CTableHeaderCell className="bg-body-tertiary">Usage</CTableHeaderCell>
// //                     <CTableHeaderCell className="bg-body-tertiary text-center">
// //                       Payment Method
// //                     </CTableHeaderCell>
// //                     <CTableHeaderCell className="bg-body-tertiary">Activity</CTableHeaderCell>
// //                   </CTableRow>
// //                 </CTableHead>
// //                 <CTableBody>
// //                   {tableExample.map((item, index) => (
// //                     <CTableRow v-for="item in tableItems" key={index}>
// //                       <CTableDataCell className="text-center">
// //                         <CAvatar size="md" src={item.avatar.src} status={item.avatar.status} />
// //                       </CTableDataCell>
// //                       <CTableDataCell>
// //                         <div>{item.user.name}</div>
// //                         <div className="small text-body-secondary text-nowrap">
// //                           <span>{item.user.new ? 'New' : 'Recurring'}</span> | Registered:{' '}
// //                           {item.user.registered}
// //                         </div>
// //                       </CTableDataCell>
// //                       <CTableDataCell className="text-center">
// //                         <CIcon size="xl" icon={item.country.flag} title={item.country.name} />
// //                       </CTableDataCell>
// //                       <CTableDataCell>
// //                         <div className="d-flex justify-content-between text-nowrap">
// //                           <div className="fw-semibold">{item.usage.value}%</div>
// //                           <div className="ms-3">
// //                             <small className="text-body-secondary">{item.usage.period}</small>
// //                           </div>
// //                         </div>
// //                         <CProgress thin color={item.usage.color} value={item.usage.value} />
// //                       </CTableDataCell>
// //                       <CTableDataCell className="text-center">
// //                         <CIcon size="xl" icon={item.payment.icon} />
// //                       </CTableDataCell>
// //                       <CTableDataCell>
// //                         <div className="small text-body-secondary text-nowrap">Last login</div>
// //                         <div className="fw-semibold text-nowrap">{item.activity}</div>
// //                       </CTableDataCell>
// //                     </CTableRow>
// //                   ))}
// //                 </CTableBody>
// //               </CTable>
// //             </CCardBody>
// //           </CCard>
// //         </CCol>
// //       </CRow>
// //     </>
// //   )
// // }

// // export default Dashboard

// import React, { useEffect, useState } from 'react'
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
// import { cilCloudDownload, cilPeople, cilCash, cilUserFemale, cilChart } from '@coreui/icons'

// import WidgetsBrand from '../widgets/WidgetsBrand'
// import WidgetsDropdown from '../widgets/WidgetsDropdown'
// import MainChart from './MainChart'
// import { dashBoardService } from '../../service/dashBoardService'

// const Dashboard = () => {
//   const [stats, setStats] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const data = await dashBoardService.dashboardStats()
//         console.log('Dashboard Stats:', data)
//         setStats(data)
//       } catch (err) {
//         console.error('Dashboard fetch failed:', err)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchDashboardData()
//   }, [])

//   if (loading) return <div>Loading dashboard...</div>
//   if (!stats) return <div>Failed to load stats</div>

//   const progressExample = [
//     { title: 'Total Users', value: stats.totalUsers, percent: stats.growth.userGrowth, color: 'success' },
//     { title: 'Online Users', value: stats.onlineUsers, percent: 0, color: 'info' },
//     { title: 'Total Deposit', value: stats.totalDeposit, percent: stats.growth.depositGrowth, color: 'warning' },
//     { title: 'Total Withdraw', value: stats.totalWithdraw, percent: stats.growth.withdrawGrowth, color: 'danger' },
//     { title: 'Total Balance', value: stats.totalBalance, percent: 0, color: 'primary' },
//     { title: 'This Month Betting', value: stats.thisMonthBetting, percent: stats.growth.bettingGrowth, color: 'info' },
//   ]

//   const progressGroupExample2 = [
//     { title: 'This Month Deposit', icon: cilCash, value: stats.thisMonthDeposits },
//     { title: 'Last Month Deposit', icon: cilCash, value: stats.lastMonthDeposits },
//     { title: 'This Month Withdraw', icon: cilUserFemale, value: stats.thisMonthWithdraws },
//     { title: 'Last Month Withdraw', icon: cilUserFemale, value: stats.lastMonthWithdraws },
//     { title: 'This Month New Users', icon: cilPeople, value: stats.thisMonthNewUsers },
//     { title: 'Last Month New Users', icon: cilPeople, value: stats.lastMonthNewUsers },
//     { title: 'This Month Betting', icon: cilChart, value: stats.thisMonthBetting },
//     { title: 'Last Month Betting', icon: cilChart, value: stats.lastMonthBetting },
//   ]

//   return (
//     <>
//       {/* Top KPI Widgets */}
//       <WidgetsDropdown className="mb-4" stats={stats.growth}         loading={loading} />

//       {/* Main Stats Card */}
//       <CCard className="mb-4">
//         <CCardBody>
//           <CRow>
//             <CCol sm={5}>
//               <h4 className="card-title mb-0">Platform Statistics</h4>
//               <div className="small text-body-secondary">{new Date().toLocaleDateString()}</div>
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

//           {/* Main Chart */}
//           <MainChart stats={stats} />
//         </CCardBody>
//         <CCardFooter>
//           <CRow xs={{ cols: 1, gutter: 4 }} sm={{ cols: 2 }} lg={{ cols: 3 }} xl={{ cols: 6 }}>
//             {progressExample.map((item, index) => (
//               <CCol key={index}>
//                 <div className="text-body-secondary">{item.title}</div>
//                 <div className="fw-semibold">
//                   {item.value.toLocaleString()} ({item.percent}%)
//                 </div>
//                 <CProgress thin className="mt-2" color={item.color} value={parseFloat(item.percent)} />
//               </CCol>
//             ))}
//           </CRow>
//         </CCardFooter>
//       </CCard>

//       {/* Brand Widgets */}
//       <WidgetsBrand className="mb-4" withCharts stats={stats} />

//       {/* Detailed Monthly Breakdown */}
//       <CRow>
//         <CCol xs>
//           <CCard className="mb-4">
//             <CCardHeader>Monthly Breakdown</CCardHeader>
//             <CCardBody>
//               {progressGroupExample2.map((item, index) => (
//                 <div className="progress-group mb-4" key={index}>
//                   <div className="progress-group-header">
//                     <CIcon className="me-2" icon={item.icon} size="lg" />
//                     <span>{item.title}</span>
//                     <span className="ms-auto fw-semibold">{item.value.toLocaleString()}</span>
//                   </div>
//                   <div className="progress-group-bars">
//                     <CProgress thin color="warning" value={item.value} />
//                   </div>
//                 </div>
//               ))}
//             </CCardBody>
//           </CCard>
//         </CCol>
//       </CRow>
//     </>
//   )
// }

// export default Dashboard



import React, { useEffect, useState } from 'react'
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
  CBadge,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilPeople,
  cilCash,
  cilUserFemale,
  cilChart,
  cilUser,
  cilShieldAlt,
  cilMoney,
  cilArrowThickTop,
  cilArrowThickBottom
} from '@coreui/icons'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import { dashBoardService } from '../../service/dashBoardService'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Fetch main stats
        const statsData = await dashBoardService.dashboardStats()
        setStats(statsData ||{})

        // Fetch pending transactions
        const transactionsData = await dashBoardService.getPendingTransactions('deposit')
        setPendingTransactions(transactionsData.transactions || [])

        // Fetch recent users
        const usersData = await dashBoardService.getUserList('all')
        setRecentUsers(usersData.data?.slice(0, 5) || [])

      } catch (err) {
        console.error('Dashboard fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const getTransactionBadge = (status, type) => {
    const statusColors = {
      0: 'warning', // pending
      1: 'success', // approved
      2: 'danger'   // rejected
    }

    const typeLabels = {
      0: 'Deposit',
      1: 'Withdrawal'
    }

    return (
      <CBadge color={statusColors[status]}>
        {typeLabels[type]} - {status === 0 ? 'Pending' : status === 1 ? 'Approved' : 'Rejected'}
      </CBadge>
    )
  }

  const getAmountColor = (type) => {
    return type === 0 ? 'success' : 'danger'
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-2">Loading dashboard...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="alert alert-danger">
        Failed to load dashboard data. Please try refreshing the page.
      </div>
    )
  }

  const progressExample = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      percent: stats.growth?.userGrowth || 0,
      color: 'success',
      icon: cilPeople
    },
    {
      title: 'Online Users',
      value: stats.onlineUsers,
      percent: 0,
      color: 'info',
      icon: cilUser
    },
    {
      title: 'Total Deposit',
      value: `$${stats.totalDeposit?.toLocaleString()}`,
      percent: stats.growth?.depositGrowth || 0,
      color: 'warning',
      icon: cilArrowThickBottom
    },
    {
      title: 'Total Withdraw',
      value: `$${stats.totalWithdraw?.toLocaleString()}`,
      percent: stats.growth?.withdrawGrowth || 0,
      color: 'danger',
      icon: cilArrowThickTop
    },
    {
      title: 'Total Balance',
      value: `$${stats.totalBalance?.toLocaleString()}`,
      percent: 0,
      color: 'primary',
      icon: cilMoney
    },
    {
      title: 'This Month Betting',
      value: `$${stats.thisMonthBetting?.toLocaleString()}`,
      percent: stats.growth?.bettingGrowth || 0,
      color: 'info',
      icon: cilChart
    },
  ]

  const progressGroupExample2 = [
    { title: 'This Month Deposit', icon: cilCash, value: `$${stats.thisMonthDeposits?.toLocaleString()}` },
    { title: 'Last Month Deposit', icon: cilCash, value: `$${stats.lastMonthDeposits?.toLocaleString()}` },
    { title: 'This Month Withdraw', icon: cilUserFemale, value: `$${stats.thisMonthWithdraws?.toLocaleString()}` },
    { title: 'Last Month Withdraw', icon: cilUserFemale, value: `$${stats.lastMonthWithdraws?.toLocaleString()}` },
    { title: 'This Month New Users', icon: cilPeople, value: stats.thisMonthNewUsers },
    { title: 'Last Month New Users', icon: cilPeople, value: stats.lastMonthNewUsers },
    { title: 'This Month Betting', icon: cilChart, value: `$${stats.thisMonthBetting?.toLocaleString()}` },
    { title: 'Last Month Betting', icon: cilChart, value: `$${stats.lastMonthBetting?.toLocaleString()}` },
  ]

  return (
    <>
      {/* Navigation Tabs */}
      {/* <CCard className="mb-4">
        <CCardBody>
          <CButtonGroup role="group">
            <CButton
              color={activeTab === 'overview' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </CButton>
            <CButton
              color={activeTab === 'transactions' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('transactions')}
            >
              Pending Transactions
            </CButton>
            <CButton
              color={activeTab === 'users' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('users')}
            >
              Recent Users
            </CButton>
          </CButtonGroup>
        </CCardBody>
      </CCard> */}

      {activeTab === 'overview' && (
        <>
          {/* Top KPI Widgets */}
          {/* <WidgetsDropdown className="mb-4" stats={stats.growth} loading={loading} /> */}

          {/* Main Stats Card */}
          <CCard className="mb-4">
            <CCardBody>
              {/* <CRow>
                <CCol sm={5}>
                  <h4 className="card-title mb-0">Platform Statistics</h4>
                  <div className="small text-body-secondary">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </CCol>
                <CCol sm={7} className="d-none d-md-block">
                  <CButton color="primary" className="float-end">
                    <CIcon icon={cilCloudDownload} /> Export Report
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
              </CRow> */}

              {/* Main Chart */}
              <MainChart stats={stats} />
            </CCardBody>
            <CCardFooter>
              <CRow xs={{ cols: 1, gutter: 4 }} sm={{ cols: 2 }} lg={{ cols: 3 }} xl={{ cols: 4 }}>
                {progressExample.map((item, index) => (
                  <CCol key={index} className="mb-3">
                    <div className="d-flex align-items-center">
                      <CIcon icon={item.icon} className="me-2 text-body-secondary" />
                      <div className="flex-grow-1">
                        <div className="text-body-secondary small">{item.title}</div>
                        <div className="fw-semibold">
                          {item.value}
                          {item.percent > 0 && (
                            <small className={`text-${item.percent > 0 ? 'success' : 'danger'} ms-1`}>
                              ({item.percent > 0 ? '+' : ''}{item.percent}%)
                            </small>
                          )}
                        </div>
                        <CProgress
                          thin
                          className="mt-1"
                          color={item.color}
                          value={Math.min(Math.abs(parseFloat(item.percent)), 100)}
                        />
                      </div>
                    </div>
                  </CCol>
                ))}
              </CRow>
            </CCardFooter>
          </CCard>

          {/* Brand Widgets */}
          {/* <WidgetsBrand className="mb-4" withCharts stats={stats} /> */}

          {/* Detailed Monthly Breakdown */}
          <CRow>
            <CCol xs>
              <CCard className="mb-4">
                <CCardHeader>
                  <CIcon icon={cilChart} className="me-2" />
                  Monthly Performance Breakdown
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    {progressGroupExample2.map((item, index) => (
                      <CCol md={6} lg={3} key={index} className="mb-3">
                        <div className="progress-group">
                          <div className="progress-group-header">
                            <CIcon className="me-2" icon={item.icon} />
                            <span className="small">{item.title}</span>
                            <span className="ms-auto fw-semibold">{item.value}</span>
                          </div>
                        </div>
                      </CCol>
                    ))}
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
      {/* 
      {activeTab === 'transactions' && (
        <CCard>
          <CCardHeader>
            <CIcon icon={cilCash} className="me-2" />
            Pending Transactions
            <CBadge color="warning" className="ms-2">
              {pendingTransactions.length}
            </CBadge>
          </CCardHeader>
          <CCardBody>
            {pendingTransactions.length > 0 ? (
              <CTable responsive hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>User</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {pendingTransactions.map((transaction, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <div>
                          <strong>{transaction.user?.username || 'N/A'}</strong>
                          <div className="small text-body-secondary">
                            {transaction.user?.email || 'No email'}
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        {getTransactionBadge(transaction.status, transaction.type)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className={`text-${getAmountColor(transaction.type)} fw-semibold`}>
                          ${transaction.amount?.toLocaleString()}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={transaction.status === 0 ? 'warning' : transaction.status === 1 ? 'success' : 'danger'}>
                          {transaction.status === 0 ? 'Pending' : transaction.status === 1 ? 'Approved' : 'Rejected'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton size="sm" color="primary" className="me-1">
                          View
                        </CButton>
                        <CButton size="sm" color="success" className="me-1">
                          Approve
                        </CButton>
                        <CButton size="sm" color="danger">
                          Reject
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            ) : (
              <div className="text-center py-4">
                <CIcon icon={cilCash} size="3xl" className="text-body-secondary mb-2" />
                <p className="text-body-secondary">No pending transactions</p>
              </div>
            )}
          </CCardBody>
        </CCard>
      )}

      {activeTab === 'users' && (
        <CCard>
          <CCardHeader>
            <CIcon icon={cilPeople} className="me-2" />
            Recent Users
            <CBadge color="info" className="ms-2">
              {recentUsers.length}
            </CBadge>
          </CCardHeader>
          <CCardBody>
            {recentUsers.length > 0 ? (
              <CTable responsive hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>User</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Join Date</CTableHeaderCell>
                    <CTableHeaderCell>Balance</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recentUsers.map((user, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <div>
                          <strong>{user.username}</strong>
                          <div className="small text-body-secondary">{user.email}</div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={
                          user.role === 'admin' ? 'danger' : 
                          user.role === 'agent' ? 'warning' : 
                          user.role === 'subagent' ? 'info' : 'secondary'
                        }>
                          {user.role}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={user.status === 'active' ? 'success' : 'danger'}>
                          {user.status}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className="fw-semibold">
                          ${user.balance?.toLocaleString()}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton size="sm" color="primary">
                          View Details
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            ) : (
              <div className="text-center py-4">
                <CIcon icon={cilPeople} size="3xl" className="text-body-secondary mb-2" />
                <p className="text-body-secondary">No users found</p>
              </div>
            )}
          </CCardBody>
        </CCard>
      )} */}
    </>
  )
}

export default Dashboard