import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CSpinner, CContainer, CRow, CCol } from '@coreui/react'
import { apiService } from '../../service/api'

const LogoutPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call logout API endpoint
        await apiService.post('/auth/logout')
      } catch (error) {
        console.error('Error logging out:', error)
      } finally {
        // Clear storage and redirect regardless of API result
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        apiService.setToken(null)

        // Redirect to login page
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      }
    }

    handleLogout()
  }, [navigate])

  return (
    <CContainer className="px-4">
      <CRow className="justify-content-center" style={{ minHeight: '100vh' }}>
        <CCol md={6} className="my-auto text-center">
          <h2>Logging out...</h2>
          <CSpinner color="primary" />
          <p className="mt-3">You are being logged out. Please wait...</p>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default LogoutPage
