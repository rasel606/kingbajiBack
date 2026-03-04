import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CAlert,
  CSpinner,
  CRow,
  CCol,
  CFormLabel,
  CModal,
  CModalBody,
  CModalHeader,
  CModalFooter,
  CFormCheck,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { authService } from '../../../service/authService'

const UserCreationFormModal = ({
  userType = 'SubAdmin',
  show,
  onClose,
  currentUserRole = 'admin',
  ParentUser,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    mobile: '',
    userId: '',
    countryCode: '+880',
    referredBy: '',
    permissions: {},
    commissionRate: '',
    maxUsers: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Define role hierarchy and permissions
  const rolePermissions = {
    admin: {
      creatableRoles: ['SubAdmin', 'Agent', 'SubAgent', 'Affiliate', 'User'],
      defaultPermissions: {
        SubAdmin: {
          user_management: false,
          agent_management: false,
          subagent_management: false,
          affiliate_management: false,
          financial_reports: false,
          content_management: false,
          analytics_view: false,
        },
        Agent: {
          subagent_management: false,
          user_management: false,
          transaction_view: false,
          commission_view: false,
        },
        SubAgent: {
          user_management: false,
          basic_reports: false,
        },
        Affiliate: {
          referral_management: true,
          commission_view: true,
        },
      },
    },
    subadmin: {
      creatableRoles: ['Agent', 'SubAgent', 'Affiliate', 'User'],
      defaultPermissions: {
        Agent: {
          subagent_management: false,
          user_management: false,
          transaction_view: false,
          commission_view: false,
        },
        SubAgent: {
          user_management: false,
          basic_reports: false,
        },
        Affiliate: {
          referral_management: true,
          commission_view: true,
        },
      },
    },
    agent: {
      creatableRoles: ['SubAgent', 'User'],
      defaultPermissions: {
        SubAgent: {
          user_management: false,
          basic_reports: false,
        },
      },
    },
  }

  const getDefaultCommissionRate = () => {
    const defaults = {
      SubAdmin: 0,
      Agent: 5,
      SubAgent: 3,
      Affiliate: 10,
    }
    return defaults[userType] || 0
  }

  // Reset form when modal opens/closes or userType changes
  useEffect(() => {
    if (show) {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        mobile: '',
        userId: '',
        countryCode: '+880',
        referredBy: '',
        permissions: rolePermissions[currentUserRole]?.defaultPermissions[userType] || {},
        commissionRate: '',
        maxUsers: '',
      })
      setMessage({ type: '', text: '' })
    }
  }, [show, userType, currentUserRole])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCountryCodeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: e.target.value,
    }))
  }

  const handlePermissionChange = (permissionKey, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: value,
      },
    }))
  }

  const generateUserId = () => {
    const prefix = userType.charAt(0).toUpperCase()
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const newUserId = `${prefix}${randomNum}`

    setFormData((prev) => ({
      ...prev,
      userId: newUserId,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Access form data from formData state, not via destructuring
    console.log(formData.email, formData.password, formData.userId, formData.permissions)

    setMessage({ type: '', text: '' })

    try {
      // Validation - access from formData state
      if (
        !formData.email ||
        !formData.password ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.mobile ||
        !formData.userId
      ) {
        setMessage({
          type: 'danger',
          text: 'Please fill in all required fields',
        })
        setLoading(false)
        return
      }

      let response
      // Prepare submission data with proper formatting
      const submissionData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        phone: formData.mobile,
        userId: formData.userId,
        countryCode: formData.countryCode,
        commissionRate: formData.commissionRate || getDefaultCommissionRate(),
        maxUsers: formData.maxUsers || undefined,
        permissions: formData.permissions,
      }

      // Remove empty fields
      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key] === '' || submissionData[key] === undefined) {
          delete submissionData[key]
        }
      })

      console.log('Submitting data:', submissionData)

      // Call appropriate API based on user type
      switch (userType) {
        case 'SubAdmin':
          response = await authService.subAdminRegister(submissionData)
          break
        case 'Agent':
          response = await authService.agentRegister(submissionData)
          break
        case 'SubAgent':
          response = await authService.subAgentRegister(submissionData)
          break
        case 'Affiliate':
          response = await authService.AffiliateRegister(submissionData)
          break
        case 'User':
          response = await authService.registerUser(submissionData)
          break
        default:
          throw new Error('Invalid user type')
      }

      setMessage({
        type: 'success',
        text: `${userType} created successfully!`,
      })

      // Reset form and close modal after success
      setTimeout(() => {
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          mobile: '',
          userId: '',
          countryCode: '+880',
          referredBy: '',
          permissions: rolePermissions[currentUserRole]?.defaultPermissions[userType] || {},
          commissionRate: '',
          maxUsers: '',
        })
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error creating user:', error)
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || error.message || `Failed to create ${userType}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const renderPermissionCheckboxes = () => {
    const permissions = formData.permissions
    if (!permissions || Object.keys(permissions).length === 0) {
      return null
    }

    return (
      <div className="mb-3">
        <CFormLabel className="fw-semibold">Permissions</CFormLabel>
        <CCard>
          <CCardBody className="p-3">
            <CRow>
              {Object.entries(permissions).map(([key, value]) => (
                <CCol md={6} key={key} className="mb-2">
                  <CFormCheck
                    id={key}
                    label={key
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                    checked={value}
                    onChange={(e) => handlePermissionChange(key, e.target.checked)}
                  />
                </CCol>
              ))}
            </CRow>
          </CCardBody>
        </CCard>
        <div className="form-text text-muted">
          Select the permissions to grant to this {userType}
        </div>
      </div>
    )
  }

  const countryCodes = [
    { code: '+880', country: 'Bangladesh' },
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+65', country: 'Singapore' },
    { code: '+60', country: 'Malaysia' },
    { code: '+66', country: 'Thailand' },
    { code: '+62', country: 'Indonesia' },
    { code: '+63', country: 'Philippines' },
    { code: '+84', country: 'Vietnam' },
  ]

  return (
    <CModal visible={show} onClose={onClose} size="lg" backdrop="static">
      <CModalHeader closeButton>
        <div>
          <h5 className="mb-1">Create New {userType}</h5>
          <small className="text-muted">
            Logged in as: <span className="text-capitalize fw-semibold">{currentUserRole}</span>
          </small>
        </div>
      </CModalHeader>
      <CModalBody>
        {message.text && (
          <CAlert color={message.type} className="mb-3">
            {message.text}
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit}>
          {/* Personal Information */}
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel htmlFor="firstName" className="fw-semibold">
                  First Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter first name"
                  autoFocus
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel htmlFor="lastName" className="fw-semibold">
                  Last Name
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              </div>
            </CCol>
          </CRow>

          {/* Email */}
          <div className="mb-3">
            <CFormLabel htmlFor="email" className="fw-semibold">
              Email Address <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter email address"
            />
          </div>

          {/* Mobile Number with Country Code */}
          <div className="mb-3">
            <CFormLabel className="fw-semibold">
              Mobile Number <span className="text-danger">*</span>
            </CFormLabel>
            <CRow>
              <CCol md={4}>
                <CFormSelect value={formData.countryCode} onChange={handleCountryCodeChange}>
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code} ({country.country})
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={8}>
                <CFormInput
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter mobile number"
                />
              </CCol>
            </CRow>
            <div className="form-text text-muted">
              Full number: {formData.countryCode} {formData.mobile}
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <CFormLabel htmlFor="password" className="fw-semibold">
              Password <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password (min. 6 characters)"
              minLength={6}
            />
          </div>

          {/* User ID with Generate Button */}
          <div className="mb-3">
            <CFormLabel htmlFor="userId" className="fw-semibold">
              User ID <span className="text-danger">*</span>
            </CFormLabel>
            <CInputGroup>
              <CFormInput
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                required
                placeholder="Enter unique user ID"
              />
              <CInputGroupText>
                <CButton type="button" color="outline-secondary" size="sm" onClick={generateUserId}>
                  Generate
                </CButton>
              </CInputGroupText>
            </CInputGroup>
            <div className="form-text text-muted">
              Must be unique across all users. Use generate button for automatic ID.
            </div>
          </div>

          {/* Referral */}
          <div className="mb-3">
            <CFormLabel htmlFor="referredBy" className="fw-semibold">
              Referred By (Optional)
            </CFormLabel>
            <CFormInput
              type="text"
              id="referredBy"
              name="referredBy"
              value={formData.referredBy}
              onChange={handleInputChange}
              placeholder="Enter referral code or user ID"
            />
          </div>

          {/* Permissions Section */}
          {userType !== 'User' && userType !== 'Affiliate' && renderPermissionCheckboxes()}

          {/* Form Actions */}
          <CModalFooter className="px-0 pt-3">
            <CButton
              type="button"
              color="secondary"
              onClick={onClose}
              disabled={loading}
              variant="outline"
            >
              Cancel
            </CButton>
            <CButton type="submit" color="primary" disabled={loading}>
              {loading ? (
                <>
                  <CSpinner size="sm" />
                  <span className="ms-2">Creating {userType}...</span>
                </>
              ) : (
                `Create ${userType}`
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModalBody>
    </CModal>
  )
}

export default UserCreationFormModal
