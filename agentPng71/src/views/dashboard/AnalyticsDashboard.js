/**
 * Enhanced Agent Dashboard with Advanced Analytics
 * Main dashboard page with comprehensive statistics and visualizations
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  CAlert,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilReload, cilCloudDownload } from '@coreui/icons';

import { dashBoardService } from '../../service/dashBoardService';
import {
  StatsWidget,
  QuickStatCard,
  TopUsersWidget,
  MonthlyComparisonWidget,
  SummaryStatsGrid,
  TransactionStatsWidget,
} from './DashboardWidgets';
import {
  DailyCashFlowChart,
  PaymentBreakdownChart,
  UserDistributionChart,
  DepositWithdrawComparisonChart,
  RevenueTrendChart,
} from './DashboardCharts';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7days');

  // Load dashboard data
  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      // Fetch analytics and stats in parallel
      const [analyticsResponse, statsResponse] = await Promise.all([
        dashBoardService.getAnalytics(),
        dashBoardService.dashboardStats(),
      ]);

      setAnalytics(analyticsResponse?.data || null);
      setStats(statsResponse?.data || null);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Manual refresh handler
  const handleRefresh = () => {
    loadDashboardData(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="mt-3">Loading dashboard analytics...</div>
      </div>
    );
  }

  // Error state
  if (error && !analytics) {
    return (
      <CAlert color="danger">
        <h4 className="alert-heading">Error Loading Dashboard</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end">
          <CButton color="danger" variant="outline" onClick={handleRefresh}>
            <CIcon icon={cilReload} className="me-2" />
            Retry
          </CButton>
        </div>
      </CAlert>
    );
  }

  const summary = analytics?.summary || {};
  const growth = analytics?.growth || {};
  const monthly = analytics?.monthly || {};
  const charts = analytics?.charts || {};
  const topUsers = analytics?.topUsers || [];

  return (
    <>
      {/* Header with Refresh Button */}
      <CRow className="mb-4">
        <CCol>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Analytics Dashboard</h2>
              <small className="text-medium-emphasis">
                Last updated: {analytics?.generatedAt ? new Date(analytics.generatedAt).toLocaleString() : 'Never'}
              </small>
            </div>
            <div className="d-flex gap-2">
              <CButtonGroup>
                <CButton
                  color={timeRange === '7days' ? 'primary' : 'outline-primary'}
                  onClick={() => setTimeRange('7days')}
                >
                  7 Days
                </CButton>
                <CButton
                  color={timeRange === '30days' ? 'primary' : 'outline-primary'}
                  onClick={() => setTimeRange('30days')}
                >
                  30 Days
                </CButton>
                <CButton
                  color={timeRange === '90days' ? 'primary' : 'outline-primary'}
                  onClick={() => setTimeRange('90days')}
                >
                  90 Days
                </CButton>
              </CButtonGroup>
              <CButton
                color="primary"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <CIcon icon={refreshing ? cilReload : cilReload} className={refreshing ? 'me-2 spin' : 'me-2'} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </CButton>
            </div>
          </div>
        </CCol>
      </CRow>

      {/* Main Statistics Cards */}
      <CRow>
        <CCol sm={6} lg={3}>
          <StatsWidget
            title="Total Users"
            value={summary.totalUsers || 0}
            growth={growth.users || 0}
            color="info"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <StatsWidget
            title="Total Deposits"
            value={summary.totalDeposit || 0}
            growth={growth.deposits || 0}
            color="success"
            prefix="৳ "
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <StatsWidget
            title="Total Withdrawals"
            value={summary.totalWithdraw || 0}
            growth={growth.withdrawals || 0}
            color="danger"
            prefix="৳ "
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <StatsWidget
            title="Betting Volume"
            value={summary.thisMonthBetting || 0}
            growth={growth.betting || 0}
            color="warning"
            prefix="৳ "
          />
        </CCol>
      </CRow>

      {/* Summary Stats Grid */}
      <SummaryStatsGrid summary={summary} />

      {/* Monthly Comparison */}
      <MonthlyComparisonWidget
        currentMonth={monthly?.thisMonth}
        lastMonth={monthly?.lastMonth}
      />

      {/* Transaction Statistics */}
      <TransactionStatsWidget
        deposits={summary.totalDeposit}
        withdrawals={summary.totalWithdraw}
        pending={(summary.pendingDeposits || 0) + (summary.pendingWithdrawals || 0)}
      />

      {/* Charts Row 1 */}
      <CRow>
        <CCol lg={8}>
          <DailyCashFlowChart dailyFlow={charts.dailyFlow} />
        </CCol>
        <CCol lg={4}>
          <PaymentBreakdownChart paymentBreakdown={charts.paymentBreakdown} />
        </CCol>
      </CRow>

      {/* Charts Row 2 */}
      <CRow>
        <CCol lg={8}>
          <RevenueTrendChart dailyFlow={charts.dailyFlow} />
        </CCol>
        <CCol lg={4}>
          <UserDistributionChart
            totalUsers={summary.totalUsers}
            onlineUsers={summary.onlineUsers}
          />
        </CCol>
      </CRow>

      {/* Charts Row 3 */}
      <CRow>
        <CCol lg={6}>
          <DepositWithdrawComparisonChart
            deposits={monthly?.thisMonth?.deposits}
            withdrawals={monthly?.thisMonth?.withdrawals}
            period="This Month"
          />
        </CCol>
        <CCol lg={6}>
          <DepositWithdrawComparisonChart
            deposits={monthly?.lastMonth?.deposits}
            withdrawals={monthly?.lastMonth?.withdrawals}
            period="Last Month"
          />
        </CCol>
      </CRow>

      {/* Top Users Table */}
      <CRow>
        <CCol lg={8}>
          <TopUsersWidget users={topUsers} />
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4">
            <CCardHeader>Quick Actions</CCardHeader>
            <CCardBody>
              <div className="d-grid gap-2">
                <CButton color="primary" variant="outline">
                  View All Transactions
                </CButton>
                <CButton color="success" variant="outline">
                  View Deposits
                </CButton>
                <CButton color="danger" variant="outline">
                  View Withdrawals
                </CButton>
                <CButton color="info" variant="outline">
                  View Users
                </CButton>
                <CButton color="warning" variant="outline">
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Export Report
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Error Alert (if any during refresh) */}
      {error && analytics && (
        <CAlert color="warning" dismissible onClose={() => setError('')}>
          <strong>Warning:</strong> {error}
        </CAlert>
      )}

      {/* Custom CSS for spinning animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default AnalyticsDashboard;
