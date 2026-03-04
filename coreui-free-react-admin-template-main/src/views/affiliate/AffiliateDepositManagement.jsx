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
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { cilPlus, cilCheckAlt, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AffiliateDepositManagement = () => {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchDeposits()
  }, [statusFilter])

  const fetchDeposits = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_auth_token')
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}&page=1&limit=50`
      const response = await fetch(`/api/admin/affiliate/management/deposits${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const result = await response.json()
        setDeposits(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching deposits:', error)
      setMessage({ type: 'danger', text: 'Error fetching deposits' })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDeposit = async (id) => {
    try {
      const token = localStorage.getItem('admin_auth_token')
      const response = await fetch(`/api/admin/affiliate/management/deposits/${id}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks: 'Approved by admin' }),
      })
      if (response.ok) {
        setMessage({ type: 'success', text: 'Deposit approved successfully' })
        fetchDeposits()
        setShowModal(false)
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error approving deposit' })
    }
  }

  const handleRejectDeposit = async (id) => {
    try {
      const token = localStorage.getItem('admin_auth_token')
      const response = await fetch(`/api/admin/affiliate/management/deposits/${id}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Rejected by admin' }),
      })
      if (response.ok) {
        setMessage({ type: 'success', text: 'Deposit rejected' })
        fetchDeposits()
        setShowModal(false)
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error rejecting deposit' })
    }
  }

  const filteredDeposits = deposits.filter(
    (deposit) =>
      deposit.affiliateId?.toString().includes(searchTerm) ||
      deposit.affiliateName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Affiliate Deposits Management</strong>
          </CCardHeader>
          <CCardBody>
            {message.text && <CAlert color={message.type}>{message.text}</CAlert>}

            <div className="row mb-3">
              <div className="col-md-6">
                <CFormInput
                  placeholder="Search by affiliate ID or name..."
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
              <p>Loading deposits...</p>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Affiliate ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Affiliate Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredDeposits.length > 0 ? (
                    filteredDeposits.map((deposit) => (
                      <CTableRow key={deposit._id}>
                        <CTableDataCell>{deposit.affiliateId}</CTableDataCell>
                        <CTableDataCell>{deposit.affiliateName}</CTableDataCell>
                        <CTableDataCell>${deposit.amount}</CTableDataCell>
                        <CTableDataCell>
                          <span
                            className={`badge bg-${deposit.status === 'approved' ? 'success' : deposit.status === 'rejected' ? 'danger' : 'warning'}`}
                          >
                            {deposit.status}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          {new Date(deposit.createdAt).toLocaleDateString()}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => {
                              setSelectedDeposit(deposit)
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
                        No deposits found
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
          <CModalTitle>Deposit Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedDeposit && (
            <div>
              <p>
                <strong>Affiliate:</strong> {selectedDeposit.affiliateName}
              </p>
              <p>
                <strong>Amount:</strong> ${selectedDeposit.amount}
              </p>
              <p>
                <strong>Status:</strong> {selectedDeposit.status}
              </p>
              <p>
                <strong>Date:</strong> {new Date(selectedDeposit.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Description:</strong> {selectedDeposit.description}
              </p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          {selectedDeposit?.status === 'pending' && (
            <>
              <CButton color="success" onClick={() => handleApproveDeposit(selectedDeposit._id)}>
                <CIcon icon={cilCheckAlt} /> Approve
              </CButton>
              <CButton color="danger" onClick={() => handleRejectDeposit(selectedDeposit._id)}>
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

export default AffiliateDepositManagement
