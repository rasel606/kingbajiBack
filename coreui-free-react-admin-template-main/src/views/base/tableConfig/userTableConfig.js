import React from 'react'
import { CBadge, CButton } from '@coreui/react'

export const userTableConfig = ({
  onView,
  onChangeTransfer,
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
    key: 'email',

    render: (_, row) => (
      <div className="d-flex align-items-center gap-2">
        {/* <span>{row.isVerified?.email  ? "Verified" : "Verify"}</span> */}
        {/* <CBadge color={row.isVerified?.email ? "success" : "danger"}>
          {row.isVerified?.email ? row.email || "verified" : "Not Verified"}
        </CBadge> */}

        {row.isVerified?.email ? (
          <CBadge color={row.isVerified?.email ? 'success' : 'danger'}>
            {row.isVerified?.email ? 'verified' : 'Not Verified'}
          </CBadge>
        ) : (
          <CButton
            size="sm"
            color={row.isVerified?.email ? 'success' : 'warning'}
            onClick={() => onVerifyEmail?.(row)}
            disabled={row.isVerified?.email ? 'Verified' : 'Verify'}
          >
            {row.isVerified?.email ? 'Verified' : 'Verify'}
          </CButton>
        )}
      </div>
    ),
  },
  {
    key: 'phone',
    label: 'Phone',
    render: (_, row) => {
      const phone = Array.isArray(row.phone) && row.phone.length > 0 ? row.phone[0].number : '-'
      return (
        <div className="d-flex align-items-center gap-2">
          <span>{phone}</span>
          {/* <CBadge color={row.isVerified?.phone ? "success" : "danger"}>
            {row.isVerified?.phone ? "Verified" : "Not Verified"}
          </CBadge> */}
          {/* <CButton
              size="sm"
              color={row.isVerified?.phone ? "success" : "warning"}
              onClick={() => onVerifyPhone?.(row)}
              disabled={row.isVerified?.phone}
            >
              {row.isVerified?.phone ? "Verified" : "Verify"}
            </CButton> */}
        </div>
      )
    },
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
    key: 'onView',
    label: 'Details',
    render: (_, row) => (
      <div className="d-flex gap-2">
        <CButton size="sm" color="info" onClick={() => onView?.(row)}>
          View
        </CButton>
      </div>
    ),
  },
  {
    key: 'Transfer',
    label: 'Transfer',
    render: (_, row) => (
      <div className="d-flex gap-2">
        <CButton size="sm" color="primary" onClick={() => onChangeTransfer?.(row)}>
          Transfer
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

//   // src/components/base/tableConfig/userTableConfig.js
// import React from 'react';
// import { CBadge, CButton } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import {
//   cilPencil,
//   cilTrash,
//   cilLockLocked,
//   cilLockUnlocked,
//   cilEye,
//   cilMoney,
//   cilEnvelope,
//   cilCopy,
// } from '@coreui/icons';

// export const userTableConfig = (actions) => [
//   {
//     key: 'userId',
//     label: 'User ID',
//     render: (value) => (
//       <div className="d-flex align-items-center gap-2">
//         <span>{value}</span>
//         <CButton
//           color="link"
//           size="sm"
//           onClick={() => {
//             navigator.clipboard.writeText(value);
//             // Show toast notification
//           }}
//         >
//           <CIcon icon={cilCopy} size="sm" />
//         </CButton>
//       </div>
//     ),
//   },
//   {
//     key: 'name',
//     label: 'Name',
//     sortable: true,
//   },
//   {
//     key: 'email',
//     label: 'Email',
//   },
//   {
//     key: 'phone',
//     label: 'Phone',
//     render: (value, row) => (
//       <span>{row.phone?.[0]?.number || 'N/A'}</span>
//     ),
//   },
//   {
//     key: 'balance',
//     label: 'Balance',
//     render: (value) => `৳${parseFloat(value || 0).toLocaleString()}`,
//     sortable: true,
//   },
//   {
//     key: 'role',
//     label: 'Role',
//     render: (value) => (
//       <CBadge color={value === 'vip' ? 'warning' : 'secondary'}>
//         {value.toUpperCase()}
//       </CBadge>
//     ),
//   },
//   {
//     key: 'isActive',
//     label: 'Status',
//     render: (value, row) => {
//       const isLocked = row.lockUntil && new Date(row.lockUntil) > new Date();

//       if (isLocked) {
//         return <CBadge color="danger">LOCKED</CBadge>;
//       }

//       return value ? (
//         <CBadge color="success">ACTIVE</CBadge>
//       ) : (
//         <CBadge color="secondary">INACTIVE</CBadge>
//       );
//     },
//   },
//   {
//     key: 'referralCode',
//     label: 'Referral Code',
//     render: (value) => value || 'N/A',
//   },
//   {
//     key: 'createdAt',
//     label: 'Registered',
//     render: (value) => new Date(value).toLocaleDateString(),
//     sortable: true,
//   },
//   {
//     key: 'actions',
//     label: 'Actions',
//     render: (_, row) => (
//       <div className="d-flex gap-1">
//         <CButton
//           color="info"
//           size="sm"
//           onClick={() => actions.onView(row)}
//           title="View Details"
//         >
//           <CIcon icon={cilEye} />
//         </CButton>

//         <CButton
//           color="warning"
//           size="sm"
//           onClick={() => actions.onAdjustBalance(row)}
//           title="Adjust Balance"
//         >
//           <CIcon icon={cilMoney} />
//         </CButton>

//         <CButton
//           color={row.isActive ? 'secondary' : 'success'}
//           size="sm"
//           onClick={() => actions.onToggleStatus(row)}
//           title={row.isActive ? 'Deactivate' : 'Activate'}
//         >
//           <CIcon icon={row.isActive ? cilLockLocked : cilLockUnlocked} />
//         </CButton>

//         <CButton
//           color="danger"
//           size="sm"
//           onClick={() => actions.onDelete(row)}
//           title="Delete User"
//         >
//           <CIcon icon={cilTrash} />
//         </CButton>
//       </div>
//     ),
//   },
// ];
