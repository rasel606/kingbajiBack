import React from 'react'
import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CButton,
} from '@coreui/react'

const DetailModal = ({ show, onHide, data, onStatusUpdate }) => {
  if (!data) return null
  console.log(
    '🚀 ~ file: DetailModal.js ~ line 11 ~ DetailModal ~ data',
    data.userId,
    ' DetailModal ~ data',
    data.transactionID,
  )
  const isPending = String(data.status) === '0' || data.status === 'pending'

  return (
    <CModal visible={show} onClose={onHide}>
      <CModalHeader closeButton>
        <CModalTitle>Deposit Details</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow className="g-3">
          {Object.keys(data).map((key, idx) => (
            <CCol key={idx} md={6}>
              <p className="mb-1 text-muted">{key}</p>
              <p className="fw-bold">{String(data[key])}</p>
            </CCol>
          ))}
        </CRow>
      </CModalBody>
      <CModalFooter>
        {isPending && (
          <>
            <CButton
              color="success"
              onClick={() => onStatusUpdate(data.transactionID, data.userId, 1)}
            >
              Approve
            </CButton>
            <CButton
              color="danger"
              onClick={() => onStatusUpdate(data.transactionID, data.userId, 2)}
            >
              Reject
            </CButton>
          </>
        )}
        <CButton color="secondary" onClick={onHide}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default DetailModal
