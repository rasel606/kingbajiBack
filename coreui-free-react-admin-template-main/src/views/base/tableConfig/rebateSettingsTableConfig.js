// tableConfig/rebateSettingsTableConfig.js
import React from 'react'
import { CButton, CBadge } from '@coreui/react'

export const rebateSettingsTableConfig = ({ onEdit }) => [
  // { key: "index", label: "#", render: (_, __, idx) => idx + 1 },
  { key: 'name', label: 'Name', render: (value) => value || '-' },
  { key: 'minTurnover', label: 'Min Turnover', render: (v) => (v != null ? v : '-') },
  { key: 'maxTurnover', label: 'Max Turnover', render: (v) => (v != null ? v : '-') },
  { key: 'rebatePercentage', label: 'Rebate %', render: (v) => (v != null ? `${v}%` : '-') },
  {
    key: 'rebateTurnoverPercentage',
    label: 'Turnover %',
    render: (v) => (v != null ? `${v}%` : '-'),
  },

  {
    key: 'active',
    label: 'Status',
    render: (v) => <CBadge color={v ? 'success' : 'secondary'}>{v ? 'Active' : 'Inactive'}</CBadge>,
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (_, row) => (
      <>
        <CButton size="sm" color="info" onClick={() => onEdit(row)}>
          Edit
        </CButton>
      </>
    ),
  },
]
