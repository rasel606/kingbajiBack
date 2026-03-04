// Updated GamesTab.js with correct DataTable props
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
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CBadge,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus } from '@coreui/icons'
import DataTable from '../base/DataTable/DataTable'
import CreateGameModal from '../base/Modal/CreateGameModal'
import EditGameModal from '../base/Modal/EditGameModal'
import { gameManagementService } from '../../service/gameManagementService'

export default function GamesTab() {
  const [games, setGames] = useState([])
  const [categories, setCategories] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    category_name: '',
    provider: '',
    gameName: '',
    sortBy: 'recommend',
  })

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 24,
    hasMore: false,
    total: 0,
  })

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)

  const fetchGames = async (page = 0) => {
    setLoading(true)
    try {
      const res = await gameManagementService.getGamesWithProvidersByCategory({
        ...filters,
        page,
        limit: pagination.limit,
      })

      setGames(res.data || [])
      setPagination({
        ...pagination,
        page,
        hasMore: res.pagination?.hasMore || false,
        total: res.pagination?.total || 0,
      })
    } catch (err) {
      setError('Failed to load games.')
      console.error('Failed to load games:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await gameManagementService.getCategories()
      setCategories(res.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProviders = async () => {
    try {
      const res = await gameManagementService.getProviders({ category_name: filters.category_name })
      setProviders(res.data || [])
    } catch (err) {
      setError('Failed to load providers.')
      console.error('Failed to load providers:', err)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchProviders()
    fetchGames()
  }, [])

  useEffect(() => {
    fetchGames(0)
  }, [filters])

  useEffect(() => {
    fetchProviders()
  }, [filters.category_name])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleStatusUpdate = async (game) => {
    try {
      await gameManagementService.updateGame(game._id, {
        is_active: !game.is_active,
      })
      console.log('Game status updated!')
      fetchGames(pagination.page)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleFeaturedUpdate = async (game) => {
    try {
      await gameManagementService.updateGame(game._id, {
        isFeatured: !game.isFeatured,
      })
      console.log('Game featured status updated!')
      fetchGames(pagination.page)
    } catch (error) {
      console.error('Failed to update featured status:', error)
    }
  }

  const handleHotUpdate = async (game) => {
    try {
      await gameManagementService.updateGame(game._id, {
        is_hot: !game.is_hot,
      })
      console.log('Game hot status updated!')
      fetchGames(pagination.page)
    } catch (error) {
      console.error('Failed to update hot status:', error)
    }
  }

  // Modal handlers
  const handleShowCreateModal = () => {
    setShowCreateModal(true)
  }

  const handleShowEditModal = (game) => {
    setSelectedGame(game)
    setShowEditModal(true)
  }

  const handleCreateSuccess = () => {
    fetchGames(pagination.page)
    setShowCreateModal(false)
  }

  const handleUpdateSuccess = () => {
    fetchGames(pagination.page)
    setShowEditModal(false)
    setSelectedGame(null)
  }

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await gameManagementService.deleteGame(gameId)
        console.log('Game deleted successfully!')
        fetchGames(pagination.page)
      } catch (error) {
        console.error('Failed to delete game:', error)
        setError('Failed to delete game.')
      }
    }
  }

  // FIXED: Correct table configuration that works with your DataTable component
  const gamesTableConfig = [
    {
      key: 'gameName_enus',
      label: 'Game Name',
      render: (val, row, onAction) => <strong>{val || 'Unknown Game'}</strong>,
    },
    {
      key: 'imgFileName',
      label: 'Image',
      type: 'image',
      render: (val, row, onAction) =>
        val ? (
          <img src={val} alt="game" width={60} height={60} style={{ borderRadius: '6px' }} />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6c757d',
              fontSize: '12px',
            }}
          >
            No Image
          </div>
        ),
    },
    {
      key: 'category_name',
      label: 'Category',
      render: (val, row, onAction) => <CBadge color="info">{val || '-'}</CBadge>,
    },
    {
      key: 'provider',
      label: 'Provider',
      render: (val, row, onAction) => <CBadge color="primary">{val || '-'}</CBadge>,
    },
    {
      key: 'g_code',
      label: 'Game Code',
      render: (val, row, onAction) => val || '-',
    },
    {
      key: 'is_hot',
      label: 'Hot',
      render: (val, row, onAction) => (
        <CFormSwitch
          color="danger"
          checked={val || false}
          onChange={() => onAction(row, 'status')} // Pass action type
        />
      ),
    },
    {
      key: 'isFeatured',
      label: 'Featured',
      render: (val, row, onAction) => (
        <CFormSwitch
          color="warning"
          checked={val || false}
          onChange={() => onAction(row, 'status')} // Pass action type
        />
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val, row, onAction) => (
        <CFormSwitch
          color="success"
          checked={val || false}
          onChange={() => onAction(row, 'status')} // Pass action type
        />
      ),
    },
    {
      key: 'action',
      label: 'Actions',
      render: (val, row, onAction) => (
        <div className="d-flex gap-2">
          <CButton color="info" size="sm" onClick={() => onAction(row)}>
            Edit
          </CButton>
          <CButton color="danger" size="sm" onClick={() => handleDeleteGame(row._id)}>
            Delete
          </CButton>
        </div>
      ),
    },
  ]

  // Handler for DataTable actions
  const handleTableAction = (game, actionType) => {
    if (actionType === 'status') {
      // Handle status updates for switches
      handleStatusUpdate(game)
    } else {
      // Handle edit modal opening
      handleShowEditModal(game)
    }
  }

  return (
    <>
      {/* Header with Create Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Game Management</h4>
        <CButton color="primary" onClick={handleShowCreateModal}>
          <CIcon icon={cilPlus} className="me-2" />
          Add New Game
        </CButton>
      </div>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardHeader>
          <h5 className="mb-0">Game Filters</h5>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormSelect
                label="Category"
                value={filters.category_name}
                onChange={(e) => handleFilterChange('category_name', e.target.value)}
              >
                <option key="all-categories" value="">
                  All Categories
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                label="Provider"
                value={filters.provider}
                onChange={(e) => handleFilterChange('provider', e.target.value)}
              >
                <option key="all-providers" value="">
                  All Providers
                </option>
                {providers.map((provider) => (
                  <option key={provider._id} value={provider.providercode}>
                    {provider.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormInput
                label="Game Name"
                placeholder="Search game..."
                value={filters.gameName}
                onChange={(e) => handleFilterChange('gameName', e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormSelect
                label="Sort By"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="recommend">Recommended</option>
                <option value="latest">Latest</option>
                <option value="favorite">Favorite</option>
                <option value="aZ">A-Z</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Games Table */}
      <CCard>
        <CCardBody className="p-0">
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError('')}>
              {error}
            </CAlert>
          )}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading games...</p>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-5">
              <h5>No games found</h5>
              <CButton color="primary" onClick={handleShowCreateModal}>
                Add Your First Game
              </CButton>
            </div>
          ) : (
            <>
              {/* FIXED: Pass the correct props to DataTable */}
              <DataTable
                data={games}
                config={gamesTableConfig}
                onStatusUpdate={handleTableAction} // Handles both status updates and modal opening
                setSelectedRow={handleShowEditModal} // Alternative way to handle modal opening
              />

              {/* Pagination */}
              {pagination.total > 0 && (
                <div className="d-flex justify-content-between align-items-center p-3">
                  <div>
                    Showing {games.length} of {pagination.total} games
                  </div>
                  <CPagination>
                    <CPaginationItem
                      disabled={pagination.page === 0}
                      onClick={() => fetchGames(pagination.page - 1)}
                    >
                      Previous
                    </CPaginationItem>
                    <CPaginationItem active>{pagination.page + 1}</CPaginationItem>
                    <CPaginationItem
                      disabled={!pagination.hasMore}
                      onClick={() => fetchGames(pagination.page + 1)}
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Create Game Modal */}
      <CreateGameModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        categories={categories}
        providers={providers}
        onCreateSuccess={handleCreateSuccess}
      />

      {/* Edit Game Modal */}
      <EditGameModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false)
          setSelectedGame(null)
        }}
        game={selectedGame}
        categories={categories}
        providers={providers}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </>
  )
}
