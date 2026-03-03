// components/Modal/CreateGameModal.js
import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CFormSwitch,
  CFormLabel,
  CRow,
  CCol,
  CSpinner,
  CAlert,
} from '@coreui/react'

const CreateGameModal = ({ show, onHide, categories, providers, onCreateSuccess }) => {
  const [formData, setFormData] = useState({
    gameName_enus: '',
    category_name: '',
    provider: '',
    g_code: '',
    imgFileName: '',
    description: '',
    is_active: true,
    is_hot: false,
    isFeatured: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (
        !formData.gameName_enus ||
        !formData.category_name ||
        !formData.provider ||
        !formData.g_code
      ) {
        setError('Please fill in all required fields.')
        setLoading(false)
        return
      }

      // Here you would call your API service
      // await gameManagementService.createGame(formData);

      console.log('Creating game:', formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onCreateSuccess()
      handleClose()
    } catch (err) {
      setError(err.message || 'Failed to create game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      gameName_enus: '',
      category_name: '',
      provider: '',
      g_code: '',
      imgFileName: '',
      description: '',
      is_active: true,
      is_hot: false,
      isFeatured: false,
    })
    setError('')
    onHide()
  }

  return (
    <CModal visible={show} onClose={handleClose} size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Add New Game</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError('')}>
              {error}
            </CAlert>
          )}

          <CRow className="g-3">
            <CCol md={12}>
              <CFormInput
                label="Game Name"
                placeholder="Enter game name"
                value={formData.gameName_enus}
                onChange={(e) => handleFormChange('gameName_enus', e.target.value)}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormSelect
                label="Category"
                value={formData.category_name}
                onChange={(e) => handleFormChange('category_name', e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={6}>
              <CFormSelect
                label="Provider"
                value={formData.provider}
                onChange={(e) => handleFormChange('provider', e.target.value)}
                required
              >
                <option value="">Select Provider</option>
                {providers.map((provider) => (
                  <option key={provider._id} value={provider.providercode}>
                    {provider.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Game Code"
                placeholder="Enter unique game code"
                value={formData.g_code}
                onChange={(e) => handleFormChange('g_code', e.target.value)}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                label="Image URL"
                placeholder="Enter image URL"
                value={formData.imgFileName}
                onChange={(e) => handleFormChange('imgFileName', e.target.value)}
                helperText="URL to the game thumbnail image"
              />
            </CCol>

            <CCol md={12}>
              <CFormTextarea
                label="Description"
                placeholder="Enter game description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={3}
              />
            </CCol>

            <CCol md={12}>
              <CRow>
                <CCol md={4}>
                  <div className="d-flex align-items-center">
                    <CFormSwitch
                      id="active-switch"
                      color="success"
                      checked={formData.is_active}
                      onChange={(e) => handleFormChange('is_active', e.target.checked)}
                    />
                    <CFormLabel htmlFor="active-switch" className="mb-0 ms-2">
                      Active
                    </CFormLabel>
                  </div>
                </CCol>

                <CCol md={4}>
                  <div className="d-flex align-items-center">
                    <CFormSwitch
                      id="hot-switch"
                      color="danger"
                      checked={formData.is_hot}
                      onChange={(e) => handleFormChange('is_hot', e.target.checked)}
                    />
                    <CFormLabel htmlFor="hot-switch" className="mb-0 ms-2">
                      Hot Game
                    </CFormLabel>
                  </div>
                </CCol>

                <CCol md={4}>
                  <div className="d-flex align-items-center">
                    <CFormSwitch
                      id="featured-switch"
                      color="warning"
                      checked={formData.isFeatured}
                      onChange={(e) => handleFormChange('isFeatured', e.target.checked)}
                    />
                    <CFormLabel htmlFor="featured-switch" className="mb-0 ms-2">
                      Featured
                    </CFormLabel>
                  </div>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton type="button" color="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </CButton>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading && <CSpinner size="sm" className="me-2" />}
            Create Game
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default CreateGameModal
