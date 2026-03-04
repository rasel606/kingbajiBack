import React, { useState } from 'react'
import { CCard, CCardBody, CForm, CFormInput, CButton, CAlert } from '@coreui/react'
import { apiService } from '../../service/api'

const AdminImpersonation = () => {
  const [userId, setUserId] = useState('')
  const [impersonationResult, setImpersonationResult] = useState(null)
  const [error, setError] = useState(null)

  const handleImpersonate = async () => {
    setError(null)
    setImpersonationResult(null)
    try {
      // Replace with actual backend endpoint for impersonation
      const result = await apiService.post(`/admin/impersonate`, { userId })
      setImpersonationResult(result)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Admin Impersonation</h2>
        <CForm
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault()
            handleImpersonate()
          }}
        >
          <CFormInput
            label="User ID to Impersonate"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
          />
          <CButton color="primary" type="submit" className="mt-2">
            Impersonate
          </CButton>
        </CForm>
        {impersonationResult && (
          <CAlert color="success">
            Impersonation successful! {JSON.stringify(impersonationResult)}
          </CAlert>
        )}
        {error && <CAlert color="danger">Error: {error}</CAlert>}
      </CCardBody>
    </CCard>
  )
}

export default AdminImpersonation
