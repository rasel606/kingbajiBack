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
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const SocialLinksManagement = () => {
  const [socialLinks, setSocialLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [formData, setFormData] = useState({ platform: '', url: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchSocialLinks()
  }, [])

  const fetchSocialLinks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_auth_token')
      const response = await fetch('/api/social-links', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSocialLinks(data.data || data)
      } else {
        setMessage({ type: 'danger', text: 'Error fetching social links' })
      }
    } catch (error) {
      console.error('Error fetching social links:', error)
      setMessage({ type: 'danger', text: 'Error fetching social links' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (link = null) => {
    if (link) {
      setEditingLink(link)
      setFormData({ platform: link.platform, url: link.url })
    } else {
      setEditingLink(null)
      setFormData({ platform: '', url: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingLink(null)
    setFormData({ platform: '', url: '' })
  }

  const handleSaveLink = async () => {
    try {
      if (!formData.platform || !formData.url) {
        setMessage({ type: 'warning', text: 'Please fill in all fields' })
        return
      }

      const method = editingLink ? 'PUT' : 'POST'
      const endpoint = editingLink ? `/api/social-links/${editingLink._id}` : '/api/social-links'
      const token = localStorage.getItem('admin_auth_token')

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingLink ? 'Social link updated successfully' : 'Social link added successfully',
        })
        handleCloseModal()
        fetchSocialLinks()
      } else {
        const error = await response.json()
        setMessage({ type: 'danger', text: error.message || 'Error saving social link' })
      }
    } catch (error) {
      console.error('Error saving social link:', error)
      setMessage({ type: 'danger', text: 'Error saving social link' })
    }
  }

  const handleDeleteLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      try {
        const token = localStorage.getItem('admin_auth_token')
        const response = await fetch(`/api/social-links/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          setMessage({ type: 'success', text: 'Social link deleted successfully' })
          fetchSocialLinks()
        } else {
          const error = await response.json()
          setMessage({ type: 'danger', text: error.message || 'Error deleting social link' })
        }
      } catch (error) {
        console.error('Error deleting social link:', error)
        setMessage({ type: 'danger', text: 'Error deleting social link' })
      }
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Social Links Management</strong>
            <CButton
              color="primary"
              size="sm"
              onClick={() => handleOpenModal()}
              style={{ float: 'right' }}
            >
              <CIcon icon={cilPlus} /> Add Social Link
            </CButton>
          </CCardHeader>
          <CCardBody>
            {message.text && (
              <CAlert color={message.type} className="mb-3">
                {message.text}
              </CAlert>
            )}

            {loading ? (
              <p>Loading social links...</p>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Platform</CTableHeaderCell>
                    <CTableHeaderCell scope="col">URL</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {socialLinks.length > 0 ? (
                    socialLinks.map((link) => (
                      <CTableRow key={link._id}>
                        <CTableDataCell>{link.platform}</CTableDataCell>
                        <CTableDataCell>{link.url}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleOpenModal(link)}
                            className="me-2"
                          >
                            <CIcon icon={cilPencil} /> Edit
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDeleteLink(link._id)}
                          >
                            <CIcon icon={cilTrash} /> Delete
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={3} className="text-center">
                        No social links found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={showModal} onClose={handleCloseModal}>
        <CModalHeader closeButton>
          <CModalTitle>{editingLink ? 'Edit Social Link' : 'Add Social Link'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="platform">Platform</CFormLabel>
              <CFormInput
                id="platform"
                placeholder="e.g., Facebook, Twitter, Instagram"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="url">URL</CFormLabel>
              <CFormInput
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSaveLink}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default SocialLinksManagement
