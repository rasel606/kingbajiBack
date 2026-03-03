// components/InfoRow.jsx
import React from 'react'
import { CCol } from '@coreui/react'

const InfoRow = ({ label, value, children }) => {
  return (
    <CCol md={6}>
      <p className="info-label">{label}</p>
      <p className="info-value">{children ?? value}</p>
    </CCol>
  )
}

export default InfoRow
