import React, { useState } from 'react'
import { CCard, CCardBody, CForm, CFormInput, CFormSelect, CButton, CAlert } from '@coreui/react'

const ScheduledReports = () => {
  const [email, setEmail] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [reportType, setReportType] = useState('transactions')
  const [result, setResult] = useState(null)

  const handleSchedule = () => {
    // Replace with actual API call
    setResult(`Scheduled ${reportType} report to ${email} (${frequency})`)
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Scheduled Reports</h2>
        <CForm
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault()
            handleSchedule()
          }}
        >
          <CFormInput
            label="Recipient Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
          <CFormSelect
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { label: 'Transactions', value: 'transactions' },
              { label: 'Users', value: 'users' },
              { label: 'Bonuses', value: 'bonuses' },
            ]}
          />
          <CFormSelect
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
            ]}
          />
          <CButton color="primary" type="submit" className="mt-2">
            Schedule Report
          </CButton>
        </CForm>
        {result && <CAlert color="success">{result}</CAlert>}
      </CCardBody>
    </CCard>
  )
}

export default ScheduledReports
