import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CFormInput,
} from '@coreui/react'
import { adminServices } from '../../../service/adminServices'

const RebateEditModal = ({ show, data, onHide, onSave }) => {
  const [minTurnover, setMinTurnover] = useState(data.minTurnover || 0)
  const [maxTurnover, setMaxTurnover] = useState(data.maxTurnover || 0)
  const [rebatePercentage, setRebatePercentage] = useState(data.rebatePercentage || 0)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await adminServices.updateCommissionSettings({
        commissionRate,
        platformFee,
      })
      onSave()
      onHide()
    } catch (err) {
      console.error('Failed to update commission settings', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={show} onClose={onHide}>
      <CModalHeader>Update Commission Settings</CModalHeader>
      <CModalBody>
        <CFormInput
          type="number"
          label="rebatePercentage (%)"
          value={rebatePercentage}
          onChange={(e) => setCommissionRate(e.target.value)}
        />
        <CFormInput
          type="number"
          label="Min Turnover"
          value={minTurnover}
          onChange={(e) => setPlatformFee(e.target.value)}
          className="mt-3"
        />
        <CFormInput
          type="number"
          label="Max Turnover"
          value={minTurnover}
          onChange={(e) => setPlatformFee(e.target.value)}
          className="mt-3"
        />
        <CFormInput
          type="number"
          label="Turnover(%)"
          value={maxTurnover}
          onChange={(e) => setPlatformFee(e.target.value)}
          className="mt-3"
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onHide}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default RebateEditModal
