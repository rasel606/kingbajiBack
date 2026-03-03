import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormLabel,
  CFormSwitch,
  CRow,
  CCol,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CFormTextarea,
} from '@coreui/react'

const ProvidersModal = ({
  show,
  onHide,
  provider,
  onProviderUpdated,
  mode = 'create', // "create" or "edit"
}) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    providercode: '',
    company: '',
    url: '',
    login_url: '',
    image_url: '',
    type: '',
    g_type: [],
    id_active: true,
  })

  useEffect(() => {
    if (show) {
      if (mode === 'edit' && provider) {
        // Pre-fill form for edit mode
        setFormData({
          name: provider.name || '',
          providercode: provider.providercode || '',
          company: provider.company || '',
          url: provider.url || '',
          login_url: provider.login_url || '',
          image_url: provider.image_url || '',
          type: provider.type || '',
          g_type: Array.isArray(provider.g_type) ? provider.g_type : [],
          id_active: provider.id_active !== undefined ? provider.id_active : true,
        })
      } else {
        // Reset form for create mode
        resetForm()
      }
    }
  }, [show, provider, mode])

  const resetForm = () => {
    setFormData({
      name: '',
      providercode: '',
      company: '',
      url: '',
      login_url: '',
      image_url: '',
      type: '',
      g_type: [],
      id_active: true,
    })
  }

  const showToast = (message, color = 'success') => {
    const id = Date.now()
    setToasts([...toasts, { id, message, color }])

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts(toasts.filter((toast) => toast.id !== id))
    }, 5000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.providercode.trim()) {
        showToast('Provider Name and Provider Code are required fields.', 'danger')
        setSaving(false)
        return
      }

      // Prepare data for API call
      const submitData = {
        ...formData,
        g_type: Array.isArray(formData.g_type)
          ? formData.g_type
          : formData.g_type
              .split(',')
              .map((item) => item.trim())
              .filter((item) => item),
      }

      // This would be replaced with your actual API service call
      // For now, we'll simulate success and call the callback
      // await gameManagementService.createProvider(submitData); // for create
      // OR
      // await gameManagementService.updateProvider(provider._id, submitData); // for edit

      showToast(
        mode === 'create' ? 'Provider created successfully!' : 'Provider updated successfully!',
      )

      onProviderUpdated && onProviderUpdated()
      onHide()
      resetForm()
    } catch (err) {
      console.error(err)
      showToast(`Failed to ${mode === 'create' ? 'create' : 'update'} provider.`, 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleGameTypesChange = (value) => {
    // Convert comma-separated string to array
    const gameTypesArray = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item)

    setFormData((prev) => ({
      ...prev,
      g_type: gameTypesArray,
    }))
  }

  const handleClose = () => {
    resetForm()
    onHide()
  }

  return (
    <>
      {/* Toast Container */}
      <CToaster placement="top-end">
        {toasts.map((toast) => (
          <CToast
            key={toast.id}
            autohide={3000}
            visible={true}
            color={toast.color}
            className="text-white"
            onClose={() => setToasts(toasts.filter((t) => t.id !== toast.id))}
          >
            <CToastHeader closeButton>
              {toast.color === 'success' ? '✅ Success' : '⚠️ Error'}
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>

      {/* Modal */}
      <CModal visible={show} onClose={handleClose} size="lg" backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>{mode === 'create' ? 'Add New Provider' : 'Edit Provider'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading provider details...</p>
            </div>
          ) : (
            <CRow className="g-3">
              {/* Provider Name */}
              <CCol xs={12} md={6}>
                <CFormLabel>
                  Provider Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter provider name"
                  required
                />
              </CCol>

              {/* Provider Code */}
              <CCol xs={12} md={6}>
                <CFormLabel>
                  Provider Code <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  value={formData.providercode}
                  onChange={(e) => handleChange('providercode', e.target.value)}
                  placeholder="Enter provider code"
                  required
                />
              </CCol>

              {/* Company */}
              <CCol xs={12} md={6}>
                <CFormLabel>Company</CFormLabel>
                <CFormInput
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Enter company name"
                />
              </CCol>

              {/* Type */}
              <CCol xs={12} md={6}>
                <CFormLabel>Type</CFormLabel>
                <CFormInput
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  placeholder="Enter provider type"
                />
              </CCol>

              {/* URL */}
              <CCol xs={12} md={6}>
                <CFormLabel>URL</CFormLabel>
                <CFormInput
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://example.com"
                />
              </CCol>

              {/* Login URL */}
              <CCol xs={12} md={6}>
                <CFormLabel>Login URL</CFormLabel>
                <CFormInput
                  type="url"
                  value={formData.login_url}
                  onChange={(e) => handleChange('login_url', e.target.value)}
                  placeholder="https://example.com/login"
                />
              </CCol>

              {/* Image URL */}
              <CCol xs={12} md={6}>
                <CFormLabel>Image URL</CFormLabel>
                <CFormInput
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <small className="text-muted">Preview:</small>
                    <img
                      src={formData.image_url}
                      alt="Provider logo preview"
                      className="ms-2"
                      style={{ width: 40, height: 40, objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </CCol>

              {/* Game Types */}
              <CCol xs={12} md={6}>
                <CFormLabel>Game Types</CFormLabel>
                <CFormInput
                  value={
                    Array.isArray(formData.g_type) ? formData.g_type.join(', ') : formData.g_type
                  }
                  onChange={(e) => handleGameTypesChange(e.target.value)}
                  placeholder="slot, live, poker, etc."
                />
                <small className="text-muted">Enter game types separated by commas</small>
              </CCol>

              {/* Status */}
              <CCol xs={12}>
                <CFormSwitch
                  label="Active Provider"
                  checked={formData.id_active}
                  onChange={(e) => handleChange('id_active', e.target.checked)}
                  className="mt-2"
                />
              </CCol>
            </CRow>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : mode === 'create' ? (
              'Create Provider'
            ) : (
              'Update Provider'
            )}
          </CButton>
          <CButton color="secondary" onClick={handleClose}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProvidersModal
