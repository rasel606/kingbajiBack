import React, { useState } from 'react'
import { CCard, CCardBody, CButton, CFormInput, CAlert } from '@coreui/react'

const QuickActionsWidget = () => {
  const [result, setResult] = useState(null)
  const [username, setUsername] = useState('')

  const handleCreateUser = () => {
    // Replace with actual API call
    setResult(`User '${username}' created!`)
    setUsername('')
  }

  const handleBackup = () => {
    // Replace with actual API call
    setResult('Backup triggered!')
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>Quick Actions</h5>
        <CFormInput
          placeholder="New Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <CButton color="primary" className="mt-2" onClick={handleCreateUser}>
          Create User
        </CButton>
        <CButton color="warning" className="mt-2 ms-2" onClick={handleBackup}>
          Trigger Backup
        </CButton>
        {result && (
          <CAlert color="info" className="mt-2">
            {result}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default QuickActionsWidget
