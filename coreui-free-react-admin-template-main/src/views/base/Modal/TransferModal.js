// src/components/modals/TransferModal.js
import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { adminServices } from '../../../service/adminServices'

const TransferModal = ({ show, onHide, userId, onTransferChanged }) => {
  const [amount, setAmount] = useState('')
  const [mobile, setMobile] = useState('')
  const [type, setType] = useState('0') // 0 = Deposit, 1 = Withdrawal
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      setMessage({ type: 'danger', text: 'Please enter a valid amount' })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      const res = await adminServices.depositAndWidthraw_ByAdmin(userId, type, amount)

      setMessage({ type: 'success', text: res?.message || 'Transaction successful' })

      // Notify parent to refresh data (balances, referrals)
      if (onTransferChanged) onTransferChanged(res)

      // Clear modal after 1s
      setTimeout(() => {
        setMessage(null)
        setAmount('')
        setType('0')
        onHide()
      }, 1000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message || 'Transaction failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={show} onClose={onHide}>
      <CModalHeader closeButton>
        <CModalTitle>Deposit / Withdrawal</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {message && <CAlert color={message.type}>{message.text}</CAlert>}

        <CFormSelect
          label="Transaction Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mb-3"
        >
          <option value="0">Deposit</option>
          <option value="1">Withdrawal</option>
        </CFormSelect>

        <CFormInput
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="mb-3"
        />
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onHide} disabled={loading}>
          Close
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={loading || !amount}>
          {loading ? <CSpinner size="sm" /> : 'Submit'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default TransferModal
