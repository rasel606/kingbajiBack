import React, { useState } from 'react'
import { CCard, CCardBody, CFormInput, CButton, CAlert } from '@coreui/react'

const CRMIntegrationWidget = () => {
  const [crmUrl, setCrmUrl] = useState('')
  const [oauthToken, setOauthToken] = useState('')
  const [crmData, setCrmData] = useState(null)
  const [result, setResult] = useState(null)

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/chat-gpt/crm/salesforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crmUrl, oauthToken }),
      })
      const data = await res.json()
      setCrmData(data)
      setResult('Connected to Salesforce CRM!')
    } catch {
      setResult('CRM connection failed')
    }
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>Salesforce CRM Integration</h5>
        <CFormInput
          placeholder="Salesforce API URL"
          value={crmUrl}
          onChange={(e) => setCrmUrl(e.target.value)}
        />
        <CFormInput
          placeholder="OAuth Token"
          value={oauthToken}
          onChange={(e) => setOauthToken(e.target.value)}
          className="mt-2"
        />
        <CButton color="primary" className="mt-2" onClick={handleConnect}>
          Connect
        </CButton>
        {result && (
          <CAlert color="success" className="mt-2">
            {result}
          </CAlert>
        )}
        {crmData && (
          <pre style={{ background: '#f8f9fa', padding: '1em' }}>
            {JSON.stringify(crmData, null, 2)}
          </pre>
        )}
      </CCardBody>
    </CCard>
  )
}

export default CRMIntegrationWidget
