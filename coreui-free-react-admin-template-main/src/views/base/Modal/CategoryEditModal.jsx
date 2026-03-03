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
  CFormSelect,
  CFormText,
  CCard,
  CCardBody,
} from '@coreui/react'
import { gameManagementService } from '../../../service/gameManagementService'

const CategoryEditModal = ({ show, onHide, categoryId, onCategoryUpdated }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState([])
  console.log('categoryId', categoryId)
  const [formData, setFormData] = useState({
    category_name: '',
    category_code: '',
    g_type: '',
    image: '',
    id_active: true,
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Game type options
  const gameTypeOptions = [
    { value: '', label: 'Select Game Type' },
    { value: 'slot', label: 'Slot Games' },
    { value: 'live', label: 'Live Casino' },
    { value: 'sports', label: 'Sports Betting' },
    { value: 'poker', label: 'Poker' },
    { value: 'arcade', label: 'Arcade' },
    { value: 'virtual', label: 'Virtual Sports' },
    { value: 'lottery', label: 'Lottery' },
    { value: 'bingo', label: 'Bingo' },
  ]

  useEffect(() => {
    if (show && categoryId) {
      fetchCategoryDetails()
    } else if (show) {
      resetForm()
    }
  }, [show, categoryId])

  const fetchCategoryDetails = async () => {
    setLoading(true)
    try {
      // Assuming you have a service method to get category by ID
      const response = await gameManagementService.getCategoryById(categoryId)
      setFormData({
        category_name: response.category_name || '',
        category_code: response.category_code || '',
        g_type: response.g_type || '',
        image: response.image || '',
        id_active: response.id_active !== false,
      })
    } catch (err) {
      showToast('Failed to load category details.', 'danger')
      console.error('Error fetching category:', err)
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
    setErrors({})
    setTouched({})
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.category_name?.trim()) {
      newErrors.category_name = 'Category name is required'
    }

    if (!formData.category_code?.trim()) {
      newErrors.category_code = 'Category code is required'
    }

    if (!formData.g_type) {
      newErrors.g_type = 'Game type is required'
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    validateForm()
  }

  const handleSave = async () => {
    // Mark all fields as touched
    setTouched({
      category_name: true,
      category_code: true,
      g_type: true,
      image: true,
    })

    if (!validateForm()) {
      showToast('Please fix the errors before saving.', 'warning')
      return
    }

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
      console.error('Error saving category:', err)
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

    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }))
    }
  }

  const handleImageError = (e) => {
    e.target.style.display = 'none'
    const previewContainer = e.target.parentElement
    const errorMsg = document.createElement('div')
    errorMsg.className = 'text-danger small mt-1'
    errorMsg.textContent = 'Failed to load image'
    previewContainer.appendChild(errorMsg)
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
      <CModal visible={show} onClose={handleClose} size="lg" backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>{categoryId ? 'Edit Category' : 'Create New Category'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading category details...</p>
            </div>
          ) : (
            <CRow className="g-3">
              {/* Category Name */}
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-semibold">
                  Category Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  placeholder="Enter category name"
                  value={formData.category_name}
                  onChange={(e) => handleChange('category_name', e.target.value)}
                  onBlur={() => handleFieldBlur('category_name')}
                  invalid={touched.category_name && !!errors.category_name}
                />
                {touched.category_name && errors.category_name && (
                  <div className="text-danger small mt-1">{errors.category_name}</div>
                )}
              </CCol>

              {/* Category Code */}
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-semibold">
                  Category Code <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  placeholder="Enter category code"
                  value={formData.category_code}
                  onChange={(e) => handleChange('category_code', e.target.value)}
                  onBlur={() => handleFieldBlur('category_code')}
                  invalid={touched.category_code && !!errors.category_code}
                />
                {touched.category_code && errors.category_code && (
                  <div className="text-danger small mt-1">{errors.category_code}</div>
                )}
                <CFormText>Unique identifier for the category</CFormText>
              </CCol>

              {/* Game Type */}
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-semibold">
                  Game Type <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  value={formData.g_type}
                  onChange={(e) => handleChange('g_type', e.target.value)}
                  onBlur={() => handleFieldBlur('g_type')}
                  invalid={touched.g_type && !!errors.g_type}
                >
                  {/* {gameTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))} */}
                </CFormSelect>
                {touched.g_type && errors.g_type && (
                  <div className="text-danger small mt-1">{errors.g_type}</div>
                )}
              </CCol>

              {/* Image URL */}
              <CCol xs={12} md={6}>
                <CFormLabel className="fw-semibold">Image URL</CFormLabel>
                <CFormInput
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  onBlur={() => handleFieldBlur('image')}
                  invalid={touched.image && !!errors.image}
                />
                {touched.image && errors.image && (
                  <div className="text-danger small mt-1">{errors.image}</div>
                )}
                <CFormText>Optional: URL for category icon/image</CFormText>
              </CCol>

              {/* Image Preview */}
              {formData.image && (
                <CCol xs={12}>
                  <CCard>
                    <CCardBody>
                      <CFormLabel className="fw-semibold">Image Preview</CFormLabel>
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="Category preview"
                          width={80}
                          height={80}
                          className="rounded border"
                          style={{ objectFit: 'cover' }}
                          onError={handleImageError}
                          onLoad={(e) => {
                            e.target.style.display = 'block'
                            const container = e.target.parentElement
                            const errorMsg = container.querySelector('.text-danger')
                            if (errorMsg) errorMsg.remove()
                          }}
                        />
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              )}

              {/* Status Switch */}
              <CCol xs={12}>
                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                  <div>
                    <CFormLabel className="fw-semibold mb-0">Category Status</CFormLabel>
                    <CFormText className="d-block">
                      {formData.id_active
                        ? 'Category is active and visible'
                        : 'Category is inactive and hidden'}
                    </CFormText>
                  </div>
                  <CFormSwitch
                    label="Active"
                    checked={formData.id_active}
                    onChange={(e) => handleChange('id_active', e.target.checked)}
                    color="success"
                    size="xl"
                  />
                </div>
              </CCol>
            </CRow>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton
            color="primary"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4"
          >
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
          <CButton color="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CategoryEditModal
