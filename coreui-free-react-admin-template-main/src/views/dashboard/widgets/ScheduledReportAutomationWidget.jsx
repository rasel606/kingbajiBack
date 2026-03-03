import React, { useState } from 'react'
import { CCard, CCardBody, CFormInput, CFormSelect, CButton, CAlert } from '@coreui/react'

const ScheduledReportAutomationWidget = () => {
  const [email, setEmail] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [result, setResult] = useState(null)

  const handleSchedule = async () => {
    // Replace with real backend call
    setResult(`Scheduled report to ${email} (${frequency})`)
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>Scheduled Report Automation</h5>
        <CFormInput
          placeholder="Recipient Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CFormSelect
          className="mt-2"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          options={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
        />
        <CButton color="primary" className="mt-2" onClick={handleSchedule}>
          Schedule Report
        </CButton>
        {result && (
          <CAlert color="success" className="mt-2">
            {result}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ScheduledReportAutomationWidget
