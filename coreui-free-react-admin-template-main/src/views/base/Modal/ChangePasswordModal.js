import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { adminServices } from '../../../service/adminServices'
import { cilLockLocked, cilLockUnlocked } from '@coreui/icons'
import { useToast } from '../../../context/ToastContext'
const ChangePasswordModal = ({ show, onHide, userId, onPasswordChanged }) => {
  const { addToast } = useToast()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const validatePassword = () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return false
    }
    setError('')
    return true
  }
  console.log(userId)
  console.log(password)
  const handleChange = async () => {
    if (!validatePassword()) return
    setSaving(true)
    try {
      const data = await adminServices.changeUserPassword(userId, password)
      console.log('Password changed successfully!', data)
      addToast('Password changed successfully!', 'success')
      onPasswordChanged && onPasswordChanged()
      setPassword('')
      onHide()
    } catch (err) {
      console.error('Failed to update password:', err)
      setError('Failed to update password. Please try again.')
      addToast('Failed to update password.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <CModal visible={show} onClose={onHide}>
      <CModalHeader closeButton>
        <CModalTitle>Change Password</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="position-relative">
          <CFormInput
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validatePassword}
          />{' '}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="position-absolute top-50 end-0 translate-middle-y me-2 bg-transparent border-0"
            style={{ cursor: 'pointer' }}
          >
            <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} size="lg" />
          </button>
        </div>
        {error && <p className="text-danger mt-2">{error}</p>}
      </CModalBody>
      <CModalFooter>
        <CButton color="success" onClick={handleChange} disabled={saving || !password}>
          {saving ? <CSpinner size="sm" /> : 'Change Password'}
        </CButton>
        <CButton color="secondary" onClick={onHide}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ChangePasswordModal
