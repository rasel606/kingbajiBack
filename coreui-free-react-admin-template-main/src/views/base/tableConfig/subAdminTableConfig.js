import React from 'react'
import { CBadge, CButton } from '@coreui/react'

export const subAdminTableConfig = ({
  onView,
  onTransactions,
  onChangePassword,
  onChangeEmail,
} = {}) => [
  {
    key: 'index',
    label: '#',
    render: (value) => (value != null ? value : '-'),
  },
  {
    key: 'userId',
    label: 'User ID',
    render: (value) => value || '-',
  },
  {
    key: 'name',
    label: 'Name',
    render: (value) => value || '-',
  },
  {
    key: 'email',
    label: 'Email',
    render: (value) => value || '-',
  },
  {
    key: 'emailVerified',
    label: 'Email Verified',
    render: (_, row) => {
      const verified = row.isVerified?.email === true
      return (
        <CBadge
          color={verified ? 'success' : 'danger'}
          shape="rounded-pill"
          className="px-2 py-1"
          size="sm"
        >
          {verified ? 'Verified' : 'Not Verified'}
        </CBadge>
      )
    },
  },
  {
    key: 'phone',
    label: 'Phone',
    render: (value) => value || '-',

    //     {
    //   // Handle array of phone objects
    // //   if (value && Array.isArray(value) && value.length > 0) {
    // //     return value
    // //       .map((p) => `${p.countryCode || ""}${p.number || ""}`)
    // //       .join(", ");
    // //   }
    // //   // If value is an object with phone array (legacy handling)
    // //   if (value && typeof value === "object" && Array.isArray(value.phone)) {
    // //     return value.phone
    // //       .map((p) => `${p.countryCode || ""}${p.number || ""}`)
    // //       .join(", ");
    // //   }
    //   return "-";
    // },
  },
  {
    render: (_, row) => {
      const verified = row.isVerified?.phone === true
      return (
        <CBadge color={verified ? 'success' : 'danger'}>
          {verified ? 'Verified' : 'Not Verified'}
        </CBadge>
      )
    },
  },
  {
    key: 'balance',
    label: 'Balance',
    render: (value) => (value != null ? value : 0),
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (value) => {
      const isActive = value === true || value === 'active' || value === 1
      return (
        <CBadge color={isActive ? 'success' : 'danger'}>{isActive ? 'Active' : 'Suspended'}</CBadge>
      )
    },
  },
  {
    key: 'Details',
    label: 'Details',
    render: (_, row) => (
      <div className="d-flex gap-2">
        <CButton size="sm" color="info" onClick={() => onView?.(row)}>
          View
        </CButton>
        {/* <CButton size="sm" color="primary" onClick={() => onTransactions?.(row)}>
          Transactions
        </CButton>
        <CButton size="sm" color="warning" onClick={() => onChangePassword?.(row)}>
          Password
        </CButton>
        <CButton size="sm" color="secondary" onClick={() => onChangeEmail?.(row)}>
          Email
        </CButton> */}
      </div>
    ),
  },
  {
    key: 'Transactions',
    label: 'Transactions',
    render: (_, row) => (
      <div className="d-flex gap-2">
        <CButton size="sm" color="primary" onClick={() => onTransactions?.(row)}>
          Transactions
        </CButton>
      </div>
    ),
  },
  {
    key: 'Password',
    label: 'Password',
    render: (_, row) => (
      <div className="d-flex gap-2">
        <CButton size="sm" color="warning" onClick={() => onChangePassword?.(row)}>
          Password
        </CButton>
      </div>
    ),
  },
  {
    key: 'Email',
    label: 'Email',
    render: (_, row) => (
      <div className="d-flex gap-2">
        <CButton size="sm" color="secondary" onClick={() => onChangeEmail?.(row)}>
          Email
        </CButton>
      </div>
    ),
  },
]
