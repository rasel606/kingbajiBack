/**
 * Dashboard Widgets - Reusable components for agent dashboard
 */

import React from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CProgress,
  CBadge,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsA,
} from '@coreui/react';
import {
  cilPeople,
  cilCash,
  cilArrowBottom,
  cilArrowTop,
  cilUser,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';

/**
 * Stat Widget Card - Shows key metrics with growth indicator
 */
export const StatsWidget = ({ title, value, growth, icon, color = 'primary', prefix = '', suffix = '' }) => {
  const growthValue = growth || 0;
  const isPositive = growthValue >= 0;

  return (
    <CWidgetStatsA
      className="mb-4"
      color={color}
      value={
        <>
          {prefix}{value !== undefined ? value.toLocaleString() : '0'}{suffix}
          <span className="fs-6 fw-normal ms-2">
            <CIcon icon={isPositive ? cilArrowTop : cilArrowBottom} />
            {' '}{Math.abs(growthValue).toFixed(1)}%
          </span>
        </>
      }
      title={title}
      action={
        <CBadge color={isPositive ? 'success' : 'danger'} className="ms-auto">
          {isPositive ? '+' : ''}{growthValue.toFixed(1)}%
        </CBadge>
      }
      chart={
        <div className="mt-2">
          <CProgress color={isPositive ? 'success' : 'danger'} value={Math.min(Math.abs(growthValue), 100)} height={8} />
        </div>
      }
    />
  );
};

/**
 * Quick Stats Card - Compact stat display
 */
export const QuickStatCard = ({ title, value, color = 'primary', icon, prefix = '', suffix = '' }) => {
  return (
    <CCard className="mb-4">
      <CCardBody className="d-flex align-items-center">
        {icon && (
          <div className={`flex-shrink-0 rounded-circle bg-${color} bg-opacity-10 p-3 me-3`}>
            <CIcon icon={icon} size="xl" className={`text-${color}`} />
          </div>
        )}
        <div className="flex-grow-1">
          <div className="text-medium-emphasis small">{title}</div>
          <div className="fs-4 fw-semibold">
            {prefix}{value !== undefined ? value.toLocaleString() : '0'}{suffix}
          </div>
        </div>
      </CCardBody>
    </CCard>
  );
};

/**
 * Recent Activity Widget
 */
export const RecentActivityWidget = ({ activities }) => {
  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex align-items-center">
        <CIcon icon={cilUser} className="me-2" />
        Recent Activity
      </CCardHeader>
      <CCardBody className="p-0">
        {activities && activities.length > 0 ? (
          <div className="list-group list-group-flush">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{activity.title}</div>
                  <small className="text-medium-emphasis">{activity.description}</small>
                </div>
                <small className="text-medium-emphasis">{activity.time}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-medium-emphasis">No recent activity</div>
        )}
      </CCardBody>
    </CCard>
  );
};

/**
 * Top Users Table Widget
 */
export const TopUsersWidget = ({ users }) => {
  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CIcon icon={cilPeople} className="me-2" />
        Top Users by Balance
      </CCardHeader>
      <CCardBody className="p-0">
        <CTable hover responsive className="mb-0">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="text-center">#</CTableHeaderCell>
              <CTableHeaderCell>Username</CTableHeaderCell>
              <CTableHeaderCell>User ID</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <CTableRow key={user.userId || index}>
                  <CTableDataCell className="text-center">
                    <CBadge color={index < 3 ? 'warning' : 'secondary'}>
                      {index + 1}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="fw-semibold">{user.username || '-'}</CTableDataCell>
                  <CTableDataCell className="text-medium-emphasis">{user.userId}</CTableDataCell>
                  <CTableDataCell className="text-end fw-semibold">
                    ৳ {user.balance?.toLocaleString() || '0'}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CBadge color="success">Active</CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="5" className="text-center text-medium-emphasis">
                  No users found
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

/**
 * Monthly Comparison Widget
 */
export const MonthlyComparisonWidget = ({ currentMonth, lastMonth }) => {
  const calculateChange = (current, last) => {
    if (!last || last === 0) return current > 0 ? 100 : 0;
    return ((current - last) / last) * 100;
  };

  const metrics = [
    {
      label: 'New Users',
      current: currentMonth?.users || 0,
      last: lastMonth?.users || 0,
      color: 'info',
    },
    {
      label: 'Deposits',
      current: currentMonth?.deposits || 0,
      last: lastMonth?.deposits || 0,
      color: 'success',
      prefix: '৳ ',
    },
    {
      label: 'Withdrawals',
      current: currentMonth?.withdrawals || 0,
      last: lastMonth?.withdrawals || 0,
      color: 'danger',
      prefix: '৳ ',
    },
    {
      label: 'Betting Volume',
      current: currentMonth?.betting || 0,
      last: lastMonth?.betting || 0,
      color: 'warning',
      prefix: '৳ ',
    },
  ];

  return (
    <CCard className="mb-4">
      <CCardHeader>Monthly Comparison</CCardHeader>
      <CCardBody>
        <CRow>
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.last);
            const isPositive = change >= 0;

            return (
              <CCol key={index} sm={6} lg={3} className="mb-3">
                <div className="border-start border-start-4" style={{ borderColor: `var(--cui-${metric.color})` }}>
                  <div className="px-3 py-2">
                    <div className="text-medium-emphasis small">{metric.label}</div>
                    <div className="fs-5 fw-semibold">
                      {metric.prefix || ''}{metric.current.toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <small className={isPositive ? 'text-success' : 'text-danger'}>
                        {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                      </small>
                      <small className="text-medium-emphasis ms-2">vs last month</small>
                    </div>
                    <CProgress className="mt-1" value={Math.min(Math.abs(change), 100)} color={metric.color} height={4} />
                  </div>
                </div>
              </CCol>
            );
          })}
        </CRow>
      </CCardBody>
    </CCard>
  );
};

/**
 * Summary Stats Grid
 */
export const SummaryStatsGrid = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    { label: 'Total Users', value: summary.totalUsers, icon: cilPeople, color: 'info' },
    { label: 'Online Users', value: summary.onlineUsers, icon: cilUser, color: 'success' },
    { label: 'Today Deposit', value: summary.todayDeposit, icon: cilArrowTop, color: 'success', prefix: '৳ ' },
    { label: 'Today Withdraw', value: summary.todayWithdraw, icon: cilArrowBottom, color: 'danger', prefix: '৳ ' },
    { label: 'Total Balance', value: summary.totalBalance, icon: cilCash, color: 'primary', prefix: '৳ ' },
    { label: 'Net Revenue', value: summary.netRevenue, icon: cilCash, color: summary.netRevenue >= 0 ? 'success' : 'danger', prefix: '৳ ' },
  ];

  return (
    <CRow>
      {stats.map((stat, index) => (
        <CCol key={index} sm={6} lg={4} xl={2}>
          <QuickStatCard
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            prefix={stat.prefix || ''}
          />
        </CCol>
      ))}
    </CRow>
  );
};

/**
 * Transaction Stats Widget
 */
export const TransactionStatsWidget = ({ deposits, withdrawals, pending }) => {
  return (
    <CCard className="mb-4">
      <CCardHeader>Transaction Statistics</CCardHeader>
      <CCardBody>
        <CRow className="text-center">
          <CCol md={4}>
            <div className="border-end">
              <div className="fs-2 fw-semibold text-success">
                ৳ {deposits?.toLocaleString() || '0'}
              </div>
              <div className="text-medium-emphasis small">Total Deposits</div>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="border-end">
              <div className="fs-2 fw-semibold text-danger">
                ৳ {withdrawals?.toLocaleString() || '0'}
              </div>
              <div className="text-medium-emphasis small">Total Withdrawals</div>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="fs-2 fw-semibold text-warning">
              {pending || '0'}
            </div>
            <div className="text-medium-emphasis small">Pending Transactions</div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default {
  StatsWidget,
  QuickStatCard,
  RecentActivityWidget,
  TopUsersWidget,
  MonthlyComparisonWidget,
  SummaryStatsGrid,
  TransactionStatsWidget,
};
