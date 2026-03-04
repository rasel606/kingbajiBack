import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormSwitch,
  CRow,
  CCol,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CFormSelect,
} from '@coreui/react'

const CategoriesModal = ({ show, onHide, categoryId, onCategoryUpdated }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState([])
  const [formData, setFormData] = useState({
    category_name: '',
    category_code: '',
    g_type: '',
    image: '',
    id_active: true,
  })

  // Game type options - you can customize these
  const gameTypeOptions = [
    { value: '', label: 'Select Game Type' },
    { value: 'slot', label: 'Slot' },
    { value: 'live', label: 'Live Casino' },
    { value: 'sports', label: 'Sports' },
    { value: 'poker', label: 'Poker' },
    { value: 'arcade', label: 'Arcade' },
  ]

  useEffect(() => {
    if (show && categoryId) {
      fetchCategoryDetails()
    } else if (show) {
      // Reset form for new category
      resetForm()
    }
  }, [show, categoryId])

  const fetchCategoryDetails = async () => {
    setLoading(true)
    try {
      // You'll need to implement this service method
      const response = await gameManagementService.getCategoryById(categoryId)
      setFormData({
        category_name: response.category_name || '',
        category_code: response.category_code || '',
        g_type: response.g_type || '',
        image: response.image || '',
        id_active: response.id_active !== false, // Default to true if undefined
      })
    } catch (err) {
      showToast('Failed to load category details.', 'danger')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, color = 'success') => {
    const newToast = { id: Date.now(), message, color }
    setToasts((prevToasts) => [...prevToasts, newToast])
  }

  const resetForm = () => {
    setFormData({
      category_name: '',
      category_code: '',
      g_type: '',
      image: '',
      id_active: true,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (categoryId) {
        // Update existing category
        await gameManagementService.updateCategory(categoryId, formData)
        showToast('Category updated successfully!')
      } else {
        // Create new category
        await gameManagementService.createCategory(formData)
        showToast('Category created successfully!')
      }

      onCategoryUpdated && onCategoryUpdated()
      handleClose()
    } catch (err) {
      console.error(err)
      const errorMessage = err.response?.data?.message || 'Failed to save category'
      showToast(errorMessage, 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onHide()
  }

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
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
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          >
            <CToastHeader closeButton>
              {toast.color === 'success' ? '✅ Success' : '⚠️ Error'}
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>

      {/* Modal */}
      <CModal visible={show} onClose={handleClose} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>{categoryId ? 'Edit Category' : 'Add New Category'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading category details...</p>
            </div>
          ) : (
            <CRow className="g-3">
              <CCol md={6}>
                <CFormInput
                  label="Category Name"
                  placeholder="Enter category name"
                  value={formData.category_name}
                  onChange={(e) => handleChange('category_name', e.target.value)}
                  required
                />
              </CCol>

              <CCol md={6}>
                <CFormInput
                  label="Category Code"
                  placeholder="Enter category code"
                  value={formData.category_code}
                  onChange={(e) => handleChange('category_code', e.target.value)}
                  required
                />
              </CCol>

              <CCol md={6}>
                <CFormSelect
                  label="Game Type"
                  value={formData.g_type}
                  onChange={(e) => handleChange('g_type', e.target.value)}
                  required
                >
                  {gameTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={6}>
                <CFormInput
                  label="Image URL"
                  placeholder="Enter image URL"
                  value={formData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                />
                {formData.image && (
                  <div className="mt-2">
                    <small className="text-muted">Preview:</small>
                    <div className="mt-1">
                      <img
                        src={formData.image}
                        alt="Category preview"
                        width={50}
                        height={50}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </CCol>

              <CCol md={12}>
                <CFormSwitch
                  label="Active"
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
                {categoryId ? 'Updating...' : 'Creating...'}
              </>
            ) : categoryId ? (
              'Update Category'
            ) : (
              'Create Category'
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

export default CategoriesModal
