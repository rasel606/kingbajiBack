import React, { useState } from 'react'
import { CCard, CCardBody, CFormSelect, CButton, CAlert } from '@coreui/react'

const providers = [
  { label: 'GPT', value: 'gpt' },
  { label: 'Claude', value: 'claude' },
  { label: 'Gemini', value: 'gemini' },
]

const MultiProviderChatSelector = ({ onProviderChange }) => {
  const [selected, setSelected] = useState('gpt')

  const handleChange = (e) => {
    setSelected(e.target.value)
    onProviderChange(e.target.value)
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>AI Provider Selector</h5>
        <CFormSelect value={selected} onChange={handleChange} options={providers} />
      </CCardBody>
    </CCard>
  )
}

export default MultiProviderChatSelector
