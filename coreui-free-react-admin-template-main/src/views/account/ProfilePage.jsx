import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CAlert,
  CSpinner,
  CImage,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { apiService } from '../../service/api'
import { cilAccountLogout, cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/auth/profile')
      const data = response.data || response
      setProfile(data)
      setFormData(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'danger', text: 'Error fetching profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await apiService.put('/auth/profile/update', formData)
      setMessage({ type: 'success', text: 'Profile updated successfully' })
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'danger', text: error.message || 'Error updating profile' })
    }
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12} className="text-center">
          <CSpinner color="primary" />
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow>
      <CCol lg={8}>
        {message.text && <CAlert color={message.type}>{message.text}</CAlert>}

        <CCard className="mb-4">
          <CCardHeader>
            <strong>My Account</strong>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs" role="tablist">
              <CNavItem role="presentation">
                <CNavLink
                  href="#"
                  active={activeTab === 'personal'}
                  onClick={() => setActiveTab('personal')}
                  role="tab"
                  aria-controls="personal"
                  aria-selected={activeTab === 'personal'}
                >
                  <CIcon icon={cilUser} className="me-2" />
                  Personal Information
                </CNavLink>
              </CNavItem>
              <CNavItem role="presentation">
                <CNavLink
                  href="#"
                  active={activeTab === 'security'}
                  onClick={() => setActiveTab('security')}
                  role="tab"
                  aria-controls="security"
                  aria-selected={activeTab === 'security'}
                >
                  <CIcon icon={cilLockLocked} className="me-2" />
                  Security
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              {activeTab === 'personal' && (
                <CTabPane role="tabpanel" aria-labelledby="personal" visible>
                  <div className="mt-4">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                        <CFormInput
                          id="firstName"
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          disabled={!editing}
                        />
                      </div>
                      <div className="col-md-6">
                        <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                        <CFormInput
                          id="lastName"
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          disabled={!editing}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <CFormLabel htmlFor="email">Email</CFormLabel>
                      <CFormInput
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!editing}
                      />
                    </div>

                    <div className="mb-3">
                      <CFormLabel htmlFor="phone">Phone</CFormLabel>
                      <CFormInput
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editing}
                      />
                    </div>

                    <div className="mb-3">
                      <CFormLabel htmlFor="address">Address</CFormLabel>
                      <CFormInput
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={!editing}
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <CFormLabel htmlFor="city">City</CFormLabel>
                        <CFormInput
                          id="city"
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          disabled={!editing}
                        />
                      </div>
                      <div className="col-md-6">
                        <CFormLabel htmlFor="country">Country</CFormLabel>
                        <CFormInput
                          id="country"
                          value={formData.country || ''}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          disabled={!editing}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      {!editing ? (
                        <CButton color="primary" onClick={() => setEditing(true)}>
                          Edit Profile
                        </CButton>
                      ) : (
                        <>
                          <CButton color="success" onClick={handleUpdateProfile} className="me-2">
                            Save Changes
                          </CButton>
                          <CButton
                            color="secondary"
                            onClick={() => {
                              setEditing(false)
                              setFormData(profile)
                            }}
                          >
                            Cancel
                          </CButton>
                        </>
                      )}
                    </div>
                  </div>
                </CTabPane>
              )}

              {activeTab === 'security' && (
                <CTabPane role="tabpanel" aria-labelledby="security" visible>
                  <div className="mt-4">
                    <p>
                      <strong>Two-Factor Authentication:</strong> Disabled
                    </p>
                    <p>
                      <strong>Last Password Change:</strong>{' '}
                      {profile?.lastPasswordChange
                        ? new Date(profile.lastPasswordChange).toLocaleDateString()
                        : 'Never'}
                    </p>
                    <CButton color="warning">
                      <CIcon icon={cilLockLocked} className="me-2" />
                      Change Password
                    </CButton>
                  </div>
                </CTabPane>
              )}
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg={4}>
        <CCard>
          <CCardHeader>
            <strong>Profile Summary</strong>
          </CCardHeader>
          <CCardBody className="text-center">
            {profile?.avatar && (
              <CImage
                src={profile.avatar}
                rounded
                thumbnail
                className="mb-3"
                style={{ maxWidth: '150px' }}
              />
            )}
            <p>
              <strong>
                {profile?.firstName} {profile?.lastName}
              </strong>
            </p>
            <p className="text-muted">{profile?.email}</p>
            <p className="text-muted">
              Member since {new Date(profile?.createdAt).toLocaleDateString()}
            </p>
            <CButton color="info" size="sm" className="me-2">
              View Activity
            </CButton>
            <CButton color="danger" size="sm">
              <CIcon icon={cilAccountLogout} /> Logout
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProfilePage
