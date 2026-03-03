import React, { useEffect, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'

const UserTransModal = ({ show, onHide, userId }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTransactions = async () => {
    setLoading(true)
    // fake API
    setTimeout(() => {
      setTransactions([
        { transactionID: 'T001', amount: 100, status: 'Success', date: '2025-09-17' },
        { transactionID: 'T002', amount: 50, status: 'Pending', date: '2025-09-16' },
      ])
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    if (show && userId) fetchTransactions()
  }, [show, userId])

  return (
    <CModal visible={show} onClose={onHide} size="lg">
      <CModalHeader closeButton>
        <CModalTitle>Transaction History</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {loading ? (
          <div className="text-center py-3">
            <CSpinner />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center">No transactions found</p>
        ) : (
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Transaction ID</CTableHeaderCell>
                <CTableHeaderCell>Amount</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {transactions.map((t, idx) => (
                <CTableRow key={t.transactionID || idx}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell>{t.transactionID}</CTableDataCell>
                  <CTableDataCell>{t.amount}</CTableDataCell>
                  <CTableDataCell>{t.status}</CTableDataCell>
                  <CTableDataCell>{t.date}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onHide}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default UserTransModal
