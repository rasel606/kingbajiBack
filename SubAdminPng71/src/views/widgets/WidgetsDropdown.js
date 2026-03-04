import React from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsA,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilCash, cilArrowTop, cilArrowBottom, cilChart } from '@coreui/icons'

const WidgetsDropdown = ({ stats, loading, className = '' }) => {
  if (loading) {
    return <div>Loading widgets...</div>
  }

  const widgets = [
    {
      color: 'primary',
      value: stats?.totalUsers || 0,
      title: 'Total Users',
      progress: { value: stats?.userGrowth || 0, label: `${stats?.userGrowth || 0}%` },
      icon: <CIcon icon={cilPeople} height={36} />,
    },
    {
      color: 'info',
      value: `$${stats?.totalDeposit?.toLocaleString() || 0}`,
      title: 'Total Deposits',
      progress: { value: stats?.depositGrowth || 0, label: `${stats?.depositGrowth || 0}%` },
      icon: <CIcon icon={cilArrowBottom} height={36} />,
    },
    {
      color: 'warning',
      value: `$${stats?.totalWithdraw?.toLocaleString() || 0}`,
      title: 'Total Withdrawals',
      progress: { value: stats?.withdrawGrowth || 0, label: `${stats?.withdrawGrowth || 0}%` },
      icon: <CIcon icon={cilArrowTop} height={36} />,
    },
    {
      color: 'danger',
      value: `$${stats?.totalBalance?.toLocaleString() || 0}`,
      title: 'Platform Balance',
      progress: { value: 100, label: 'Active' },
      icon: <CIcon icon={cilChart} height={36} />,
    },
  ]

  return (
    <CRow className={className}>
      {widgets.map((widget, index) => (
        <CCol sm={6} lg={3} key={index}>
          <CWidgetStatsA
            color={widget.color}
            value={widget.value}
            title={widget.title}
            progress={widget.progress}
            icon={widget.icon}
          />
        </CCol>
      ))}
    </CRow>
  )
}

export default WidgetsDropdown