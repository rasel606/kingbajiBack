import React, { useState } from 'react'
import { CCard, CCardBody, CForm, CFormInput, CButton, CAlert } from '@coreui/react'

const IntegrationHooks = () => {
  const [service, setService] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [result, setResult] = useState(null)

  const handleConnect = () => {
    // Replace with actual API call
    setResult(`Connected to ${service} with API key ${apiKey}`)
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Integration Hooks</h2>
        <CForm
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault()
            handleConnect()
          }}
        >
          <CFormInput
            label="Service Name"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Stripe, Twilio"
          />
          <CFormInput
            label="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key"
          />
          <CButton color="primary" type="submit" className="mt-2">
            Connect
          </CButton>
        </CForm>
        {result && <CAlert color="success">{result}</CAlert>}
      </CCardBody>
    </CCard>
  )
}

export default IntegrationHooks
