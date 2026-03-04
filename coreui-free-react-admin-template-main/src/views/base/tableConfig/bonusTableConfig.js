// // import React from "react";
// // import { CBadge, CButton } from "@coreui/react";

// // export const bonusTableConfig = ({ onEdit }) => [
// //   {
// //     key: "index",
// //     label: "#",
// //     render: (value) => value ?? "-",
// //   },
// //   {
// //     key: "name",
// //     label: "Bonus Name",
// //     render: (value) => value || "-",
// //   },
// //   {
// //     key: "bonusType",
// //     label: "Type",
// //     render: (value) => value || "-",
// //   },
// //   {
// //     key: "percentage",
// //     label: "Percentage",
// //     render: (value) => (value ? `${value}%` : "-"),
// //   },
// //   {
// //     key: "fixedAmount",
// //     label: "Fixed Amount",
// //     render: (value) => (value ? `$${value}` : "-"),
// //   },
// //   {
// //     key: "isActive",
// //     label: "Status",
// //     render: (value) => (
// //       <CBadge color={value ? "success" : "secondary"}>
// //         {value ? "Active" : "Inactive"}
// //       </CBadge>
// //     ),
// //   },
// //   {
// //     key: "actions",
// //     label: "Actions",
// //     render: (_, row) => (
// //       <CButton size="sm" color="primary" onClick={() => onEdit(row)}>
// //         Edit
// //       </CButton>
// //     ),
// //   },
// // ];

// import React from "react";
// import { CBadge, CButton } from "@coreui/react";

// export const bonusTableConfig = ({ onEdit, onDelete }) => [
// //   {
// //     key: "index",
// //     label: "#",
// //     render: (_, __, index) => index + 1,
// //   },
//   {
//     key: "name",
//     label: "Bonus Name",
//     render: (value) => value || "-",
//   },
//   {
//     key: "bonusType",
//     label: "Type",
//     render: (value) => value || "-",
//   },
//   {
//     key: "percentage",
//     label: "Percentage",
//     render: (value) => (value ? `${value}%` : "-"),
//   },
//   {
//     key: "wageringRequirement",
//     label: "Wagering Requirement",
//     render: (value) => (value ? `${value} X` : "-"),
//   },
//   {
//     key: "fixedAmount",
//     label: "Fixed Amount",
//     render: (value) => (value ? `$${value}` : "-"),
//   },
//   {
//     key: "validDays",
//     label: "Valid Days",
//     render: (value) => (value ? `${value}` : "-"),
//   },
//   {
//     key: "isActive",
//     label: "Status",
//     render: (value) => (
//       <CBadge color={value ? "success" : "secondary"}>
//         {value ? "Active" : "Inactive"}
//       </CBadge>
//     ),
//   },
//   {
//     key: "actions",
//     label: "Actions",
//     render: (_, row) => (
//       <div className="d-flex gap-2">
//         <CButton size="sm" color="primary" onClick={() => onEdit(row)}>
//           Edit
//         </CButton>
//         <CButton size="sm" color="danger" onClick={() => onDelete(row._id)}>
//           Delete
//         </CButton>
//       </div>
//     ),
//   },
// ];

import React from 'react'
import { CBadge, CButton } from '@coreui/react'

export const bonusTableConfig = ({ onEdit, onDelete, onView }) => [
  {
    key: 'name',
    label: 'Bonus Name',
    render: (value) => <strong>{value || '-'}</strong>,
  },
  {
    key: 'bonusType',
    label: 'Type',
    render: (value) => {
      const typeColors = {
        deposit: 'info',
        dailyRebate: 'success',
        weeklyBonus: 'primary',
        vip: 'warning',
        referral: 'secondary',
        referralRebate: 'dark',
        signup: 'info',
        birthday: 'danger',
        welcomeBonus: 'success',
        firstDeposit: 'primary',
        other: 'secondary',
      }
      return <CBadge color={typeColors[value] || 'secondary'}>{value || '-'}</CBadge>
    },
  },
  {
    key: 'percentage',
    label: 'Percentage',
    render: (value, row) => {
      if (value) return `${value}%`
      if (row.fixedAmount) return `$${row.fixedAmount}`
      return '-'
    },
  },
  {
    key: 'minDeposit',
    label: 'Min Deposit',
    render: (value) => (value ? `$${value}` : '-'),
  },
  {
    key: 'maxBonus',
    label: 'Max Bonus',
    render: (value) => (value ? `$${value}` : '-'),
  },
  {
    key: 'wageringRequirement',
    label: 'Wagering',
    render: (value) => (value ? `${value}x` : '-'),
  },
  {
    key: 'validDays',
    label: 'Valid Days',
    render: (value) => value || '-',
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (value) => (
      <CBadge color={value ? 'success' : 'secondary'}>{value ? 'Active' : 'Inactive'}</CBadge>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (_, row) => (
      <div className="d-flex gap-2">
        <CButton
          size="sm"
          color="info"
          variant="outline"
          onClick={() => onView && onView(row)}
          title="View Details"
        >
          <i className="bi bi-eye"></i>
        </CButton>
        <CButton size="sm" color="primary" onClick={() => onEdit(row)} title="Edit">
          <i className="bi bi-pencil"></i>
        </CButton>
        <CButton size="sm" color="danger" onClick={() => onDelete(row._id)} title="Delete">
          <i className="bi bi-trash"></i>
        </CButton>
      </div>
    ),
  },
]
