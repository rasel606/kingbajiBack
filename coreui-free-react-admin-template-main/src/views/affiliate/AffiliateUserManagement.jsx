import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CAlert,
  CForm,
  CFormInput,
} from '@coreui/react'
import { cilSearch, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AffiliateUserManagement = () => {
  const [affiliateUsers, setAffiliateUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchAffiliateUsers()
  }, [])

  useEffect(() => {
    const filtered = affiliateUsers.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().includes(searchTerm),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, affiliateUsers])

  const fetchAffiliateUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_auth_token')
      const response = await fetch('/api/admin/affiliate/management/users?page=1&limit=50', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const result = await response.json()
        setAffiliateUsers(result.data || [])
      } else {
        setMessage({ type: 'danger', text: 'Error fetching users' })
      }
    } catch (error) {
      console.error('Error fetching affiliate users:', error)
      setMessage({ type: 'danger', text: 'Error fetching users' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Affiliate Users Management</strong>
            <CButton color="primary" size="sm" style={{ float: 'right' }}>
              <CIcon icon={cilPlus} /> Add User
            </CButton>
          </CCardHeader>
          <CCardBody>
            {message.text && <CAlert color={message.type}>{message.text}</CAlert>}

            <div className="mb-3">
              <CFormInput
                placeholder="Search by username, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <p>Loading affiliate users...</p>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Username</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Joined Date</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <CTableRow key={user._id}>
                        <CTableDataCell>{user.id}</CTableDataCell>
                        <CTableDataCell>{user.username}</CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>
                          <span
                            className={`badge bg-${user.status === 'active' ? 'success' : 'warning'}`}
                          >
                            {user.status}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton color="info" size="sm">
                            View
                          </CButton>{' '}
                          <CButton color="warning" size="sm">
                            Edit
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center">
                        No affiliate users found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AffiliateUserManagement
