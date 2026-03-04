/**
 * Dashboard Charts - Advanced chart components for analytics
 */

import React from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,ButtonGroup,
  CButton,
} from '@coreui/react';
import {
  CChartLine,
  CChartBar,
  CChartDoughnut,
  CChartPie,
} from '@coreui/react-chartjs';

/**
 * Daily Cash Flow Line Chart
 */
export const DailyCashFlowChart = ({ dailyFlow }) => {
  const chartData = {
    labels: (dailyFlow || []).map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Deposits',
        data: (dailyFlow || []).map(item => item.deposit || 0),
        borderColor: 'rgb(46, 184, 92)',
        backgroundColor: 'rgba(46, 184, 92, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Withdrawals',
        data: (dailyFlow || []).map(item => item.withdraw || 0),
        borderColor: 'rgb(229, 83, 83)',
        backgroundColor: 'rgba(229, 83, 83, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += '৳ ' + context.parsed.y.toLocaleString();
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '৳ ' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <span>7-Day Cash Flow</span>
        <small className="text-medium-emphasis">Last 7 days</small>
      </CCardHeader>
      <CCardBody>
        <div style={{ height: '300px' }}>
          <CChartLine data={chartData} options={options} />
        </div>
      </CCardBody>
    </CCard>
  );
};

/**
 * Payment Gateway Breakdown Doughnut Chart
 */
export const PaymentBreakdownChart = ({ paymentBreakdown }) => {
  const colors = [
    'rgb(50, 31, 219)',
    'rgb(51, 153, 255)',
    'rgb(249, 177, 21)',
    'rgb(46, 184, 92)',
    'rgb(229, 83, 83)',
    'rgb(111, 66, 193)',
  ];

  const chartData = {
    labels: (paymentBreakdown || []).map(item => item.name || 'Unknown'),
    datasets: [
      {
        data: (paymentBreakdown || []).map(item => item.value || 0),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ৳ ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Payment Gateway Breakdown</CCardHeader>
      <CCardBody>
        {paymentBreakdown && paymentBreakdown.length > 0 ? (
          <div style={{ height: '300px' }}>
            <CChartDoughnut data={chartData} options={options} />
          </div>
        ) : (
          <div className="text-center text-medium-emphasis py-5">
            No payment data available
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

/**
 * Monthly Growth Bar Chart
 */
export const MonthlyGrowthChart = ({ monthlyData }) => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Deposits',
        data: monthlyData || Array(12).fill(0),
        backgroundColor: 'rgba(46, 184, 92, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Deposits: ৳ ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '৳ ' + value.toLocaleString();
          }
        }
      }
    },
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Monthly Deposits (Last 12 Months)</CCardHeader>
      <CCardBody>
        <div style={{ height: '300px' }}>
          <CChartBar data={chartData} options={options} />
        </div>
      </CCardBody>
    </CCard>
  );
};

/**
 * User Distribution Pie Chart
 */
export const UserDistributionChart = ({ totalUsers, onlineUsers }) => {
  const offlineUsers = Math.max((totalUsers || 0) - (onlineUsers || 0), 0);

  const chartData = {
    labels: ['Online Users', 'Offline Users'],
    datasets: [
      {
        data: [onlineUsers || 0, offlineUsers],
        backgroundColor: [
          'rgba(46, 184, 92, 0.8)',
          'rgba(229, 83, 83, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = totalUsers || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>User Status Distribution</CCardHeader>
      <CCardBody>
        <div style={{ height: '300px' }}>
          <CChartPie data={chartData} options={options} />
        </div>
        <div className="mt-3 text-center">
          <div className="d-flex justify-content-around">
            <div>
              <div className="fs-5 fw-semibold text-success">{onlineUsers || 0}</div>
              <div className="small text-medium-emphasis">Online</div>
            </div>
            <div>
              <div className="fs-5 fw-semibold text-danger">{offlineUsers}</div>
              <div className="small text-medium-emphasis">Offline</div>
            </div>
            <div>
              <div className="fs-5 fw-semibold text-info">{totalUsers || 0}</div>
              <div className="small text-medium-emphasis">Total</div>
            </div>
          </div>
        </div>
      </CCardBody>
    </CCard>
  );
};

/**
 * Comparison Chart - Deposits vs Withdrawals
 */
export const DepositWithdrawComparisonChart = ({ deposits, withdrawals, period = 'This Month' }) => {
  const chartData = {
    labels: ['Deposits', 'Withdrawals', 'Net'],
    datasets: [
      {
        label: period,
        data: [
          deposits || 0,
          withdrawals || 0,
          (deposits || 0) - (withdrawals || 0),
        ],
        backgroundColor: [
          'rgba(46, 184, 92, 0.8)',
          'rgba(229, 83, 83, 0.8)',
          (deposits || 0) - (withdrawals || 0) >= 0 ? 'rgba(50, 31, 219, 0.8)' : 'rgba(229, 83, 83, 0.8)',
        ],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ৳ ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '৳ ' + value.toLocaleString();
          }
        }
      }
    },
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Deposit vs Withdrawal - {period}</CCardHeader>
      <CCardBody>
        <div style={{ height: '300px' }}>
          <CChartBar data={chartData} options={options} />
        </div>
      </CCardBody>
    </CCard>
  );
};

/**
 * Revenue Trend Chart
 */
export const RevenueTrendChart = ({ dailyFlow }) => {
  const chartData = {
    labels: (dailyFlow || []).map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Net Revenue',
        data: (dailyFlow || []).map(item => (item.deposit || 0) - (item.withdraw || 0)),
        borderColor: 'rgb(50, 31, 219)',
        backgroundColor: function(context) {
          const value = context.parsed.y;
          return value >= 0 ? 'rgba(46, 184, 92, 0.1)' : 'rgba(229, 83, 83, 0.1)';
        },
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: function(context) {
          const value = context.parsed.y;
          return value >= 0 ? 'rgb(46, 184, 92)' : 'rgb(229, 83, 83)';
        },
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return 'Net Revenue: ৳ ' + value.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return '৳ ' + value.toLocaleString();
          }
        },
        grid: {
          color: function(context) {
            if (context.tick.value === 0) {
              return 'rgba(0, 0, 0, 0.3)';
            }
            return 'rgba(0, 0, 0, 0.1)';
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Net Revenue Trend (Last 7 Days)</CCardHeader>
      <CCardBody>
        <div style={{ height: '300px' }}>
          <CChartLine data={chartData} options={options} />
        </div>
      </CCardBody>
    </CCard>
  );
};

export default {
  DailyCashFlowChart,
  PaymentBreakdownChart,
  MonthlyGrowthChart,
  UserDistributionChart,
  DepositWithdrawComparisonChart,
  RevenueTrendChart,
};
