import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CSpinner,
  CAlert,
  CFormSelect,
  CBadge,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilTransfer } from '@coreui/icons'
import {
  getCategoriesWithProviders,
  moveGamesToAnotherCategoryAndUpdateProviderList,
} from '../../service/gameManagementService'

export default function CategoryProviderTab() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [moveData, setMoveData] = useState({
    fromCategoryName: '',
    toCategoryName: '',
    gamesToMove: [],
  })

  const fetchCategoriesWithProviders = async () => {
    setLoading(true)
    try {
      const res = await getCategoriesWithProviders()
      setCategories(res.data || [])
      console.log(res.data)
    } catch (err) {
      setError('Failed to load categories with providers.')
      toast.error('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoriesWithProviders()
  }, [])

  const selectedCategoryData = categories.find((cat) => cat.category_name === selectedCategory)

  const handleGameSelection = (game, checked) => {
    if (checked) {
      setMoveData((prev) => ({
        ...prev,
        gamesToMove: [...prev.gamesToMove, { g_code: game.g_code, p_code: game.p_code }],
      }))
    } else {
      setMoveData((prev) => ({
        ...prev,
        gamesToMove: prev.gamesToMove.filter(
          (g) => !(g.g_code === game.g_code && g.p_code === game.p_code),
        ),
      }))
    }
  }

  const handleMoveGames = async () => {
    if (
      !moveData.fromCategoryName ||
      !moveData.toCategoryName ||
      moveData.gamesToMove.length === 0
    ) {
      toast.error('Please select source category, target category, and at least one game.')
      return
    }

    try {
      await moveGamesToAnotherCategoryAndUpdateProviderList(moveData)
      toast.success('Games moved successfully!')
      setMoveData({
        fromCategoryName: '',
        toCategoryName: '',
        gamesToMove: [],
      })
      setSelectedCategory('')
      fetchCategoriesWithProviders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move games.')
    }
  }

  return (
    <>
      <CRow>
        {/* Categories List */}
        <CCol md={4}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">Categories & Providers</h5>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="text-center py-3">
                  <CSpinner color="primary" />
                </div>
              ) : (
                <CListGroup>
                  {categories.map((category) => (
                    <CListGroupItem
                      key={category._id}
                      action
                      active={selectedCategory === category.category_name}
                      onClick={() => setSelectedCategory(category.category_name)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{category.category_name}</strong>
                        <br />
                        <small className="text-muted">Type: {category.g_type}</small>
                      </div>
                      <CBadge color="primary">{category.providerCount} providers</CBadge>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Category Details and Game Movement */}
        <CCol md={8}>
          {selectedCategoryData ? (
            <CCard>
              <CCardHeader>
                <h5 className="mb-0">{selectedCategoryData.category_name} - Games & Providers</h5>
              </CCardHeader>
              <CCardBody>
                {/* Providers List */}
                <h6>Associated Providers:</h6>
                <div className="mb-3">
                  {selectedCategoryData.uniqueProviders.map((provider) => (
                    <CBadge key={provider._id} color="success" className="me-2 mb-2">
                      {provider.name} ({provider.providercode})
                    </CBadge>
                  ))}
                </div>

                {/* Game Movement Section */}
                <hr />
                <h6>Move Games to Another Category:</h6>
                <CRow className="g-3 mb-3">
                  <CCol md={5}>
                    <CFormSelect
                      value={moveData.fromCategoryName}
                      onChange={(e) =>
                        setMoveData((prev) => ({
                          ...prev,
                          fromCategoryName: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Source Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.category_name}>
                          {cat.category_name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={2} className="text-center">
                    <CIcon icon={cilArrowRight} size="lg" />
                  </CCol>
                  <CCol md={5}>
                    <CFormSelect
                      value={moveData.toCategoryName}
                      onChange={(e) =>
                        setMoveData((prev) => ({
                          ...prev,
                          toCategoryName: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Target Category</option>
                      {categories
                        .filter((cat) => cat.category_name !== moveData.fromCategoryName)
                        .map((cat) => (
                          <option key={cat._id} value={cat.category_name}>
                            {cat.category_name}
                          </option>
                        ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                {/* Selected Games Count */}
                {moveData.gamesToMove.length > 0 && (
                  <div className="alert alert-info">
                    {moveData.gamesToMove.length} game(s) selected for movement
                  </div>
                )}

                {/* Move Button */}
                <CButton
                  color="primary"
                  onClick={handleMoveGames}
                  disabled={
                    !moveData.fromCategoryName ||
                    !moveData.toCategoryName ||
                    moveData.gamesToMove.length === 0
                  }
                >
                  <CIcon icon={cilTransfer} className="me-2" />
                  Move Selected Games
                </CButton>
              </CCardBody>
            </CCard>
          ) : (
            <CCard>
              <CCardBody className="text-center py-5">
                <h5>Select a category to view details</h5>
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    </>
  )
}
