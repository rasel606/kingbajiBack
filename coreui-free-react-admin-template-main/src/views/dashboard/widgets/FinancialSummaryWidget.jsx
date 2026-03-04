import React from 'react'
import { CCard, CCardBody } from '@coreui/react'

const mockFinancial = {
  revenue: 120000,
  payouts: 45000,
  bonuses: 8000,
}

const FinancialSummaryWidget = () => (
  <CCard className="mb-4">
    <CCardBody>
      <h5>Financial Summary</h5>
      <div>Revenue: ${mockFinancial.revenue.toLocaleString()}</div>
      <div>Payouts: ${mockFinancial.payouts.toLocaleString()}</div>
      <div>Bonuses: ${mockFinancial.bonuses.toLocaleString()}</div>
    </CCardBody>
  </CCard>
)

export default FinancialSummaryWidget
