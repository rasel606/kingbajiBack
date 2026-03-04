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
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { cilCheckAlt, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AffiliateUserWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchWithdrawals()
  }, [statusFilter])

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_auth_token')
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}&page=1&limit=50`
      const response = await fetch(`/api/admin/affiliate/management/user-withdrawals${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const result = await response.json()
        setWithdrawals(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      setMessage({ type: 'danger', text: 'Error fetching withdrawals' })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveWithdrawal = async (id) => {
    try {
      const token = localStorage.getItem('admin_auth_token')
      const response = await fetch(
        `/api/admin/affiliate/management/user-withdrawals/${id}/approve`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactionId: '' }),
        },
      )
      if (response.ok) {
        setMessage({ type: 'success', text: 'Withdrawal approved successfully' })
        fetchWithdrawals()
        setShowModal(false)
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error approving withdrawal' })
    }
  }

  const handleRejectWithdrawal = async (id) => {
    try {
      const token = localStorage.getItem('admin_auth_token')
      const response = await fetch(
        `/api/admin/affiliate/management/user-withdrawals/${id}/reject`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: 'Rejected by admin' }),
        },
      )
      if (response.ok) {
        setMessage({ type: 'success', text: 'Withdrawal rejected' })
        fetchWithdrawals()
        setShowModal(false)
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error rejecting withdrawal' })
    }
  }

  const filteredWithdrawals = withdrawals.filter(
    (withdrawal) =>
      withdrawal.userId?.toString().includes(searchTerm) ||
      withdrawal.userName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Affiliate User Withdrawals</strong>
          </CCardHeader>
          <CCardBody>
            {message.text && <CAlert color={message.type}>{message.text}</CAlert>}

            <div className="row mb-3">
              <div className="col-md-6">
                <CFormInput
                  placeholder="Search by user ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <CFormSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </CFormSelect>
              </div>
            </div>

            {loading ? (
              <p>Loading withdrawals...</p>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">User ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">User Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredWithdrawals.length > 0 ? (
                    filteredWithdrawals.map((withdrawal) => (
                      <CTableRow key={withdrawal._id}>
                        <CTableDataCell>{withdrawal.userId}</CTableDataCell>
                        <CTableDataCell>{withdrawal.userName}</CTableDataCell>
                        <CTableDataCell>${withdrawal.amount}</CTableDataCell>
                        <CTableDataCell>
                          <span
                            className={`badge bg-${withdrawal.status === 'approved' ? 'success' : withdrawal.status === 'rejected' ? 'danger' : 'warning'}`}
                          >
                            {withdrawal.status}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setShowModal(true)
                            }}
                          >
                            View
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center">
                        No withdrawals found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>Withdrawal Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedWithdrawal && (
            <div>
              <p>
                <strong>User:</strong> {selectedWithdrawal.userName}
              </p>
              <p>
                <strong>Amount:</strong> ${selectedWithdrawal.amount}
              </p>
              <p>
                <strong>Status:</strong> {selectedWithdrawal.status}
              </p>
              <p>
                <strong>Date:</strong> {new Date(selectedWithdrawal.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          {selectedWithdrawal?.status === 'pending' && (
            <>
              <CButton
                color="success"
                onClick={() => handleApproveWithdrawal(selectedWithdrawal._id)}
              >
                <CIcon icon={cilCheckAlt} /> Approve
              </CButton>
              <CButton
                color="danger"
                onClick={() => handleRejectWithdrawal(selectedWithdrawal._id)}
              >
                <CIcon icon={cilX} /> Reject
              </CButton>
            </>
          )}
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AffiliateUserWithdrawals
