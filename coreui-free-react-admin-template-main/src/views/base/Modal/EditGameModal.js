// components/Modal/EditGameModal.js
import React, { useState, useEffect } from 'react'
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
  CBadge,
} from '@coreui/react'

const EditGameModal = ({ show, onHide, game, categories, providers, onUpdateSuccess }) => {
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

  // Update form when game data changes
  useEffect(() => {
    if (game) {
      setFormData({
        gameName_enus: game.gameName_enus || '',
        category_name: game.category_name || '',
        provider: game.provider || '',
        g_code: game.g_code || '',
        imgFileName: game.imgFileName || '',
        description: game.description || '',
        is_active: game.is_active !== undefined ? game.is_active : true,
        is_hot: game.is_hot || false,
        isFeatured: game.isFeatured || false,
      })
    }
  }, [game])

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
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
      // await gameManagementService.updateGame(game._id, formData);

      console.log('Updating game:', game._id, formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onUpdateSuccess()
      handleClose()
    } catch (err) {
      setError(err.message || 'Failed to update game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onHide()
  }

  if (!game) return null

  return (
    <CModal visible={show} onClose={handleClose} size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>
          Edit Game
          <div className="mt-1">
            <CBadge color="secondary" className="me-2">
              ID: {game._id}
            </CBadge>
            <CBadge color="info">Code: {game.g_code}</CBadge>
          </div>
        </CModalTitle>
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
              {formData.imgFileName && (
                <div className="mb-2">
                  <CFormLabel>Image Preview</CFormLabel>
                  <div>
                    <img
                      src={formData.imgFileName}
                      alt="Game preview"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
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
                      id="edit-active-switch"
                      color="success"
                      checked={formData.is_active}
                      onChange={(e) => handleFormChange('is_active', e.target.checked)}
                    />
                    <CFormLabel htmlFor="edit-active-switch" className="mb-0 ms-2">
                      Active{' '}
                      {formData.is_active ? (
                        <CBadge color="success" className="ms-1">
                          Live
                        </CBadge>
                      ) : (
                        <CBadge color="secondary" className="ms-1">
                          Disabled
                        </CBadge>
                      )}
                    </CFormLabel>
                  </div>
                </CCol>

                <CCol md={4}>
                  <div className="d-flex align-items-center">
                    <CFormSwitch
                      id="edit-hot-switch"
                      color="danger"
                      checked={formData.is_hot}
                      onChange={(e) => handleFormChange('is_hot', e.target.checked)}
                    />
                    <CFormLabel htmlFor="edit-hot-switch" className="mb-0 ms-2">
                      Hot Game{' '}
                      {formData.is_hot && (
                        <CBadge color="danger" className="ms-1">
                          HOT
                        </CBadge>
                      )}
                    </CFormLabel>
                  </div>
                </CCol>

                <CCol md={4}>
                  <div className="d-flex align-items-center">
                    <CFormSwitch
                      id="edit-featured-switch"
                      color="warning"
                      checked={formData.isFeatured}
                      onChange={(e) => handleFormChange('isFeatured', e.target.checked)}
                    />
                    <CFormLabel htmlFor="edit-featured-switch" className="mb-0 ms-2">
                      Featured{' '}
                      {formData.isFeatured && (
                        <CBadge color="warning" className="ms-1">
                          FEATURED
                        </CBadge>
                      )}
                    </CFormLabel>
                  </div>
                </CCol>
              </CRow>
            </CCol>

            <CCol md={12}>
              <div className="p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Game Statistics:</strong> Last updated: {new Date().toLocaleDateString()}
                </small>
              </div>
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton type="button" color="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </CButton>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading && <CSpinner size="sm" className="me-2" />}
            Update Game
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default EditGameModal
