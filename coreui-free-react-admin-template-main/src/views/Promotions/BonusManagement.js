// import React, { useState, useEffect } from "react";
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CButton,
//   CSpinner,
//   CAlert,
// } from "@coreui/react";
// import DataTable from "../base/DataTable/DataTable";
// import { bonusTableConfig } from "../base/tableConfig/bonusTableConfig";
// import BonusFormModal from "../base/Modal/BonusFormModal";
// import { adminServices } from "../../service/adminServices";

// const BonusManagement = () => {
//   const [bonuses, setBonuses] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedBonus, setSelectedBonus] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const fetchBonuses = async () => {
//     setLoading(true);
//     try {
//       const data = await adminServices.getBonuses();
//       setBonuses(data);
//     } catch (err) {
//       setError("Failed to load bonuses.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const data = await adminServices.getCategoriesWithProvidersAndGames();
//       setCategories(data);
//     } catch (err) {
//       console.error("Failed to load categories", err);
//     }
//   };

//   const handleSave = async (bonusData) => {
//     try {
//       if (bonusData._id) {
//         await adminServices.updateBonus(bonusData._id, bonusData);
//       } else {
//         await adminServices.createBonus(bonusData);
//       }
//       fetchBonuses();
//       setShowModal(false);
//     } catch (err) {
//       setError("Failed to save bonus.");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this bonus?")) return;
//     try {
//       await adminServices.deleteBonus(id);
//       fetchBonuses();
//     } catch (err) {
//       setError("Failed to delete bonus.");
//     }
//   };

//   useEffect(() => {
//     fetchBonuses();
//     fetchCategories();
//   }, []);

//   return (
//     <>
//       <CCard>
//         <CCardHeader className="d-flex justify-content-between align-items-center">
//           <h5 className="mb-0">Bonus Management</h5>
//           <CButton
//             color="primary"
//             onClick={() => {
//               setSelectedBonus(null);
//               setShowModal(true);
//             }}
//           >
//             + Add Bonus
//           </CButton>
//         </CCardHeader>
//         <CCardBody>
//           {error && <CAlert color="danger">{error}</CAlert>}
//           {loading ? (
//             <div className="text-center py-5">
//               <CSpinner color="primary" />
//               <p>Loading bonuses...</p>
//             </div>
//           ) : (
//             <DataTable
//               data={bonuses}
//               config={bonusTableConfig({
//                 onEdit: (bonus) => {
//                   setSelectedBonus(bonus);
//                   setShowModal(true);
//                 },
//                 onDelete: handleDelete,
//               })}
//             />
//           )}
//         </CCardBody>
//       </CCard>

//       {showModal && (
//         <BonusFormModal
//           show={showModal}
//           bonus={selectedBonus}
//           cetegorys={categories}
//           onClose={() => setShowModal(false)}
//           onSave={handleSave}
//         />
//       )}
//     </>
//   );
// };

// export default BonusManagement;

// // import React, { useState, useEffect } from "react";
// // import {
// //   CCard,
// //   CCardHeader,
// //   CCardBody,
// //   CButton,
// //   CSpinner,
// //   CAlert,
// // } from "@coreui/react";
// // import DataTable from "../base/DataTable/DataTable";
// // import { bonusTableConfig } from "../base/tableConfig/bonusTableConfig";
// // import BonusFormModal from "../base/Modal/BonusFormModal";
// // import { adminServices } from "../../service/adminServices";

// // const BonusManagement = () => {
// //   const [bonuses, setBonuses] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");
// //   const [selectedBonus, setSelectedBonus] = useState(null);
// //   const [showModal, setShowModal] = useState(false);

// //   const fetchBonuses = async () => {
// //     setLoading(true);
// //     try {
// //       const data = await adminServices.getBonuses();
// //       setBonuses(data);
// //     } catch (err) {
// //       setError("Failed to load bonuses.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSave = async (bonusData) => {
// //     try {
// //       if (bonusData._id) {
// //         console.log(bonusData._id);
// //         await adminServices.updateBonus(bonusData._id, bonusData);
// //       } else {
// //         await adminServices.createBonus(bonusData);
// //       }
// //       fetchBonuses();
// //       setShowModal(false);
// //     } catch (err) {
// //       setError("Failed to save bonus.");
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     if (!window.confirm("Are you sure you want to delete this bonus?")) return;
// //     try {
// //       await adminServices.deleteBonus(id);
// //       fetchBonuses();
// //     } catch (err) {
// //       setError("Failed to delete bonus.");
// //     }
// //   };

// //   useEffect(() => {
// //     fetchBonuses();
// //   }, []);

// //   return (
// //     <>
// //       <CCard>
// //         <CCardHeader className="d-flex justify-content-between align-items-center">
// //           <h5 className="mb-0">Bonus Management</h5>
// //           <CButton
// //             color="primary"
// //             onClick={() => {
// //               setSelectedBonus(null);
// //               setShowModal(true);
// //             }}
// //           >
// //             + Add Bonus
// //           </CButton>
// //         </CCardHeader>
// //         <CCardBody>
// //           {error && <CAlert color="danger">{error}</CAlert>}
// //           {loading ? (
// //             <div className="text-center py-5">
// //               <CSpinner color="primary" />
// //               <p>Loading bonuses...</p>
// //             </div>
// //           ) : (
// //             <DataTable
// //               data={bonuses}
// //               config={bonusTableConfig({
// //                 onEdit: (bonus) => {
// //                   setSelectedBonus(bonus);
// //                   setShowModal(true);
// //                 },
// //                 onDelete: handleDelete,
// //               })}
// //             />
// //           )}
// //         </CCardBody>
// //       </CCard>

// //       {showModal && (
// //         <BonusFormModal
// //           show={showModal}
// //           bonus={selectedBonus}
// //           onClose={() => setShowModal(false)}
// //           onSave={handleSave}
// //         />
// //       )}
// //     </>
// //   );
// // };

// // export default BonusManagement;

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CSpinner,
  CAlert,
  CForm,
  CFormInput,
  CFormSelect,
  CCol,
  CRow,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilSearch,
  cilFilter,
  cilReload,
  cilOptions,
  cilTrash,
  cilPencil,
  // cilEye
} from '@coreui/icons'
import BonusFormModal from '../../views/base/Modal/BonusFormModal'
import BonusDetailsModal from '../../views/base/Modal/BonusDetailsModal'
import { adminServices } from '../../service/adminServices'

const BonusManagement = () => {
  const [bonuses, setBonuses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedBonus, setSelectedBonus] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const debugShapeLoggedRef = useRef({ bonuses: false, categories: false })

  // Filters and pagination
  const [filters, setFilters] = useState({
    q: '',
    bonusType: '',
    isActive: '',
    cetegory: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  const bonusTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'deposit', label: 'Deposit Bonus' },
    { value: 'dailyRebate', label: 'Daily Rebate' },
    { value: 'weeklyBonus', label: 'Weekly Bonus' },
    { value: 'vip', label: 'VIP Bonus' },
    { value: 'referral', label: 'Referral Bonus' },
    { value: 'referralRebate', label: 'Referral Rebate' },
    { value: 'signup', label: 'Signup Bonus' },
    { value: 'birthday', label: 'Birthday Bonus' },
    { value: 'welcomeBonus', label: 'Welcome Bonus' },
    { value: 'firstDeposit', label: 'First Deposit' },
    { value: 'freeSpins', label: 'Free Spins' },
    { value: 'normalDeposit', label: 'Normal Deposit' },
    { value: 'other', label: 'Other' },
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  const limitOptions = [5, 10, 25, 50, 100]

  const isExplicitFailure = (response) => {
    return response?.success === false || response?.status === false
  }

  const extractArray = (response, keys = []) => {
    if (Array.isArray(response)) return response

    for (const key of keys) {
      const value = response?.[key]
      if (Array.isArray(value)) return value
    }

    const nestedData = response?.data
    if (Array.isArray(nestedData)) return nestedData

    for (const key of keys) {
      const nestedValue = nestedData?.[key]
      if (Array.isArray(nestedValue)) return nestedValue
    }

    return []
  }

  const logResponseShapeOnce = (target, response) => {
    if (!import.meta.env.DEV) return
    if (debugShapeLoggedRef.current[target]) return

    debugShapeLoggedRef.current[target] = true

    const topLevelKeys =
      response && typeof response === 'object' && !Array.isArray(response)
        ? Object.keys(response)
        : []

    const dataKeys =
      response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
        ? Object.keys(response.data)
        : []

    const sample = Array.isArray(response)
      ? response[0]
      : Array.isArray(response?.items)
        ? response.items[0]
        : Array.isArray(response?.bonuses)
          ? response.bonuses[0]
          : Array.isArray(response?.data)
            ? response.data[0]
            : Array.isArray(response?.data?.items)
              ? response.data.items[0]
              : undefined

    console.info(`[BonusManagement][debug] ${target} response shape`, {
      isArray: Array.isArray(response),
      topLevelKeys,
      dataKeys,
      sample,
    })
  }

  const getCategoryLabel = (category) => {
    if (!category) return ''
    if (typeof category === 'string') return category
    return category.name || category.categoryName || category.title || category.label || ''
  }

  const getCategoryKey = (category, index) => {
    if (!category) return `category-${index}`
    if (typeof category === 'string') return `category-${category}-${index}`
    return category._id || category.id || category.slug || category.name || `category-${index}`
  }

  const fetchBonuses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }

      if (filters.q) params.q = filters.q
      if (filters.bonusType) params.bonusType = filters.bonusType
      if (filters.isActive !== '') params.isActive = filters.isActive
      if (filters.cetegory) params.cetegory = filters.cetegory

      const response = await adminServices.getBonuses(params)
      logResponseShapeOnce('bonuses', response)

      if (isExplicitFailure(response)) {
        throw new Error(response.message || 'Failed to fetch bonuses')
      }

      const items = extractArray(response, ['items', 'bonuses', 'results', 'rows'])
      const page = Number(response?.page ?? response?.data?.page ?? filters.page) || 1
      const totalPages =
        Number(
          response?.pages ??
            response?.totalPages ??
            response?.data?.pages ??
            response?.data?.totalPages ??
            1,
        ) || 1
      const total =
        Number(
          response?.total ??
            response?.count ??
            response?.data?.total ??
            response?.data?.count ??
            items.length,
        ) || 0

      setBonuses(items)
      setPagination({
        currentPage: page,
        totalPages,
        total,
      })
    } catch (err) {
      setError(err.message || 'Failed to load bonuses. Please try again.')
      console.error('Error fetching bonuses:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await adminServices.getCategories()
      logResponseShapeOnce('categories', response)

      if (isExplicitFailure(response)) {
        throw new Error(response.message || 'Failed to load categories')
      }

      const categoryList = extractArray(response, ['categories', 'items', 'results', 'data'])
      setCategories(categoryList)
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  const handleSave = async (bonusData) => {
    console.log('Saving bonus:', bonusData)
    try {
      setLoading(true)
      setError('')

      let response
      if (bonusData._id) {
        response = await adminServices.updateBonus(bonusData._id, bonusData)
      } else {
        response = await adminServices.createBonus(bonusData)
      }

      if (!isExplicitFailure(response)) {
        setSuccess(bonusData._id ? 'Bonus updated successfully!' : 'Bonus created successfully!')
        fetchBonuses()
        setShowFormModal(false)
        setSelectedBonus(null)

        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error(response.message || 'Failed to save bonus')
      }
    } catch (err) {
      setError(err.message || 'Failed to save bonus. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (
      !window.confirm('Are you sure you want to delete this bonus? This action cannot be undone.')
    ) {
      return
    }

    try {
      setLoading(true)
      const response = await adminServices.deleteBonus(id)

      if (!isExplicitFailure(response)) {
        setSuccess('Bonus deleted successfully!')
        fetchBonuses()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error(response.message || 'Failed to delete bonus')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete bonus. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleViewDetails = (bonus) => {
    setSelectedBonus(bonus)
    setShowDetailsModal(true)
  }

  const handleEdit = (bonus) => {
    setSelectedBonus(bonus)
    setShowFormModal(true)
  }

  const handleClearFilters = () => {
    setFilters({
      q: '',
      bonusType: '',
      isActive: '',
      cetegory: '',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }

  const handleSort = (sortBy) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (err) {
      return '-'
    }
  }

  const getBonusTypeLabel = (type) => {
    const typeMap = {
      deposit: 'Deposit Bonus',
      dailyRebate: 'Daily Rebate',
      weeklyBonus: 'Weekly Bonus',
      vip: 'VIP Bonus',
      referral: 'Referral Bonus',
      referralRebate: 'Referral Rebate',
      signup: 'Signup Bonus',
      birthday: 'Birthday Bonus',
      welcomeBonus: 'Welcome Bonus',
      firstDeposit: 'First Deposit',
      freeSpins: 'Free Spins',
      normalDeposit: 'Normal Deposit',
      other: 'Other',
    }
    return typeMap[type] || type
  }

  useEffect(() => {
    fetchBonuses()
  }, [fetchBonuses])

  useEffect(() => {
    fetchCategories()
  }, [])

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (filters.page === 1) {
        fetchBonuses()
      } else {
        setFilters((prev) => ({ ...prev, page: 1 }))
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [filters.q, filters.bonusType, filters.isActive, filters.cetegory, filters.limit])

  const hasActiveFilters =
    filters.q || filters.bonusType || filters.isActive !== '' || filters.cetegory

  return (
    <div className="bonus-management">
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 d-flex align-items-center">
              <span>Bonus Management</span>
              {loading && <CSpinner size="sm" className="ms-2" />}
            </h5>
            <small className="text-muted">Create, manage, and track all bonus offers</small>
          </div>
          <div className="d-flex gap-2">
            {hasActiveFilters && (
              <CButton
                color="secondary"
                size="sm"
                variant="outline"
                onClick={handleClearFilters}
                disabled={loading}
              >
                <CIcon icon={cilReload} className="me-1" />
                Clear Filters
              </CButton>
            )}
            <CButton
              color="primary"
              onClick={() => {
                setSelectedBonus(null)
                setShowFormModal(true)
              }}
              disabled={loading}
            >
              <CIcon icon={cilPlus} className="me-1" />
              Create New Bonus
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {/* Success and Error Messages */}
          {success && (
            <CAlert color="success" dismissible onClose={() => setSuccess('')}>
              <strong>Success!</strong> {success}
            </CAlert>
          )}

          {error && (
            <CAlert color="danger" dismissible onClose={() => setError('')}>
              <strong>Error!</strong> {error}
            </CAlert>
          )}

          {/* Filters */}
          <CCard className="mb-4">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Filters</h6>
                <CDropdown>
                  <CDropdownToggle color="secondary" size="sm" variant="outline">
                    <CIcon icon={cilOptions} className="me-1" />
                    More Options
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={() => handleSort('createdAt')}>
                      Sort by Date
                    </CDropdownItem>
                    <CDropdownItem onClick={() => handleSort('name')}>Sort by Name</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </div>

              <CForm>
                <CRow className="g-3">
                  <CCol md={3}>
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilSearch} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Search by name or description..."
                        value={filters.q}
                        onChange={(e) => handleFilterChange('q', e.target.value)}
                        disabled={loading}
                      />
                    </CInputGroup>
                  </CCol>

                  <CCol md={2}>
                    <CFormSelect
                      value={filters.bonusType}
                      onChange={(e) => handleFilterChange('bonusType', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">All Types</option>
                      {bonusTypeOptions.slice(1).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={2}>
                    <CFormSelect
                      value={filters.isActive}
                      onChange={(e) => handleFilterChange('isActive', e.target.value)}
                      disabled={loading}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={2}>
                    <CFormSelect
                      value={filters.cetegory}
                      onChange={(e) => handleFilterChange('cetegory', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category, index) => {
                        const label = getCategoryLabel(category)
                        if (!label) return null

                        return (
                          <option key={getCategoryKey(category, index)} value={label}>
                            {label}
                          </option>
                        )
                      })}
                    </CFormSelect>
                  </CCol>

                  <CCol md={2}>
                    <CFormSelect
                      value={filters.limit}
                      onChange={(e) => handleFilterChange('limit', e.target.value)}
                      disabled={loading}
                    >
                      {limitOptions.map((option) => (
                        <option key={option} value={option}>
                          {option} per page
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>
              </CForm>

              {hasActiveFilters && (
                <div className="mt-3">
                  <small className="text-muted">
                    Active filters:
                    {filters.q && ` Search: "${filters.q}"`}
                    {filters.bonusType &&
                      ` Type: ${bonusTypeOptions.find((o) => o.value === filters.bonusType)?.label}`}
                    {filters.isActive &&
                      ` Status: ${statusOptions.find((o) => o.value === filters.isActive)?.label}`}
                    {filters.cetegory && ` Category: ${filters.cetegory}`}
                  </small>
                </div>
              )}
            </CCardBody>
          </CCard>

          {/* Results Summary */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <strong>Total Bonuses:</strong> <CBadge color="primary">{pagination.total}</CBadge>
              {filters.q && (
                <span className="ms-2">
                  <small className="text-muted">
                    Found {bonuses.length} result{bonuses.length !== 1 ? 's' : ''}
                  </small>
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">
                Page {pagination.currentPage} of {pagination.totalPages}
              </small>
            </div>
          </div>

          {/* Data Table */}
          {loading && bonuses.length === 0 ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p className="mt-2">Loading bonuses...</p>
            </div>
          ) : bonuses.length > 0 ? (
            <>
              <div className="table-responsive">
                <CTable hover striped>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Bonus Name</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Value</CTableHeaderCell>
                      <CTableHeaderCell>Wagering</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Created</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {bonuses.map((bonus) => (
                      <CTableRow key={bonus._id}>
                        <CTableDataCell>
                          <div className="fw-semibold">{bonus.name}</div>
                          <small className="text-muted">
                            {bonus.description?.substring(0, 50)}...
                          </small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge
                            color={
                              bonus.bonusType === 'deposit'
                                ? 'primary'
                                : bonus.bonusType === 'vip'
                                  ? 'warning'
                                  : bonus.bonusType === 'referral'
                                    ? 'secondary'
                                    : 'info'
                            }
                          >
                            {getBonusTypeLabel(bonus.bonusType)}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {bonus.percentage ? (
                            <span className="text-success">{bonus.percentage}%</span>
                          ) : bonus.fixedAmount ? (
                            <span className="text-success">${bonus.fixedAmount}</span>
                          ) : (
                            '-'
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {bonus.wageringRequirement ? `${bonus.wageringRequirement}x` : '-'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={bonus.isActive ? 'success' : 'secondary'}>
                            {bonus.isActive ? 'Active' : 'Inactive'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(bonus.createdAt)}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CButton
                              size="sm"
                              color="info"
                              variant="outline"
                              onClick={() => handleViewDetails(bonus)}
                              title="View Details"
                              disabled={loading}
                            >
                              {/* <CIcon icon={cilEye} /> */}
                            </CButton>
                            <CButton
                              size="sm"
                              color="primary"
                              variant="outline"
                              onClick={() => handleEdit(bonus)}
                              title="Edit"
                              disabled={loading}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              size="sm"
                              color="danger"
                              variant="outline"
                              onClick={() => handleDelete(bonus._id)}
                              title="Delete"
                              disabled={loading}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <CPagination>
                    <CPaginationItem
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                      Previous
                    </CPaginationItem>

                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.currentPage - 2 + i
                      }

                      return (
                        <CPaginationItem
                          key={pageNum}
                          active={pageNum === pagination.currentPage}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </CPaginationItem>
                      )
                    })}

                    <CPaginationItem
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <div className="mb-3">
                <i
                  className="bi bi-gift"
                  style={{ fontSize: '4rem', color: '#6c757d', opacity: 0.5 }}
                ></i>
              </div>
              <h5 className="mb-2">No bonuses found</h5>
              <p className="text-muted mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search term'
                  : 'Get started by creating your first bonus'}
              </p>
              {!hasActiveFilters && (
                <CButton
                  color="primary"
                  onClick={() => {
                    setSelectedBonus(null)
                    setShowFormModal(true)
                  }}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Create Your First Bonus
                </CButton>
              )}
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Form Modal */}
      {showFormModal && (
        <BonusFormModal
          show={showFormModal}
          bonus={selectedBonus}
          categories={categories}
          onClose={() => {
            setShowFormModal(false)
            setSelectedBonus(null)
          }}
          onSave={handleSave}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <BonusDetailsModal
          show={showDetailsModal}
          bonus={selectedBonus}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedBonus(null)
          }}
        />
      )}
    </div>
  )
}

export default BonusManagement
