// components/common/StatusBadge/StatusBadge.js
import React from 'react';
import { CBadge } from '@coreui/react';

const StatusBadge = ({ status, size = 'md', showLabel = true, className = '' }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      // Deposit statuses
      pending: { color: "warning", label: "Pending" },
      approved: { color: "success", label: "Approved" },
      rejected: { color: "danger", label: "Rejected" },
      deposited: { color: "info", label: "Deposited" },
      withdrawn: { color: "secondary", label: "Withdrawn" },
      processing: { color: "primary", label: "Processing" },
      
      // User statuses
      active: { color: "success", label: "Active" },
      inactive: { color: "secondary", label: "Inactive" },
      suspended: { color: "danger", label: "Suspended" },
      
      // Transaction statuses
      completed: { color: "success", label: "Completed" },
      failed: { color: "danger", label: "Failed" },
      cancelled: { color: "warning", label: "Cancelled" },
    };
    
    return statusMap[status] || { color: "secondary", label: status };
  };

  const statusConfig = getStatusConfig(status);

  return (
    <CBadge 
      color={statusConfig.color} 
      className={className}
      style={{ 
        fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
        padding: size === 'sm' ? '0.25rem 0.5rem' : '0.375rem 0.75rem'
      }}
    >
      {showLabel ? statusConfig.label : ''}
    </CBadge>
  );
};

export default StatusBadge;