// import React, { useState, useEffect } from "react";
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CRow,
//   CButton,
//   CSpinner,
//   CAlert,
//   CPagination,
//   CPaginationItem,
// } from "@coreui/react";
// import CIcon from "@coreui/icons-react";
// import { cilPeople, cilFilter, cilFilterX, cilUser } from "@coreui/icons";

// import FilterBar from "../base/filtersView/FilterBar";
// import DataTable from "../base/DataTable/DataTable";
// import DetailModal from "../base/Modal/DetailModal";

// // Import your modal components
// import UserDetailsModal from "../base/Modal/UserDetailsModal";
// import UserTransModal from "../base/Modal/UserTransModal";
// import ChangePasswordModal from "../base/Modal/ChangePasswordModal";
// import ChangeEmailModal from "../base/Modal/ChangeEmailModal";
// import TransferModal from "../base/Modal/TransferModal";

// import filterConfig from "../base/filtersView/filterConfig";
// import { userTableConfig } from "../base/tableConfig/userTableConfig";
// import { useToast } from "../../context/ToastContext";
// import { usePagination } from "../../hooks/usePagination";

// const BaseUserManagementView = ({
//   fetchUsers,            // API function for fetching user list
//   updateUserStatus,      // API function for activating/blocking users
//   title = "User Management",
// }) => {
//   const { addToast } = useToast();
//   const [filters, setFilters] = useState({});
//   const [users, setUsers] = useState([]);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [filtersCollapsed, setFiltersCollapsed] = useState(true);

//   // Modal state variables
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [showTransModal, setShowTransModal] = useState(false);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [showTransferModal, setShowTransferModal] = useState(false);

//   // Pagination hook
//   const {
//     currentPage,
//     itemsPerPage,
//     handlePageChange,
//     handleItemsPerPageChange,
//     resetPagination,
//     getPaginationParams,
//   } = usePagination(1, 10);

//   // Fetch users
//   const fetchData = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const params = getPaginationParams(filters);
//       const res = await fetchUsers(params);
//       console.log(res);
//       setUsers(res || []);
//       setTotalUsers(res || 0);
//     } catch (err) {
//       setError("Failed to fetch user data.");
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update user status
//   const handleStatusUpdate = async (userId, status) => {
//     setLoading(true);
//     try {
//       const res = await updateUserStatus(userId, status);
//       addToast(res.message || "User status updated successfully");
//       fetchData();
//     } catch (err) {
//       addToast(err.message || "Failed to update user status", "danger");
//     } finally {
//       setLoading(false);
//       setModalShow(false);
//     }
//   };

//   const handleSearch = () => {
//     resetPagination();
//     fetchData();
//   };

//   const handleReset = () => {
//     setFilters({});
//     resetPagination();
//     fetchData();
//   };

//   const totalPages = Math.ceil(totalUsers / itemsPerPage);

//   useEffect(() => {
//     fetchData();
//   }, [currentPage, itemsPerPage]);

//   useEffect(() => {
//     fetchData();
//   }, [filters]);

//   return (
//     <>
//       {/* Top Info Card */}
//       <CRow className="mb-4">
//         <CCol xs={12} sm={6} xl={3}>
//           <CCard className="bg-info text-white mb-3">
//             <CCardBody className="d-flex justify-content-between align-items-start pb-0">
//               <div>
//                 <div className="text-value-lg">{users.length}</div>
//                 <div>Total Users</div>
//               </div>
//               <CIcon width={24} icon={cilPeople} />
//             </CCardBody>
//           </CCard>
//         </CCol>
//       </CRow>

//       {/* Filters */}
//       <CCard className="mb-4">
//         <CCardHeader className="d-flex justify-content-between align-items-center">
//           <h5 className="mb-0">{title}</h5>
//           <CButton
//             color="link"
//             className="p-0"
//             onClick={() => setFiltersCollapsed(!filtersCollapsed)}
//           >
//             <CIcon icon={filtersCollapsed ? cilFilter : cilFilterX} />
//           </CButton>
//         </CCardHeader>
//         <CCardBody className={filtersCollapsed ? 'd-none' : ''}>
//           <FilterBar
//             config={[
//               { key: 'userId', label: 'User ID', type: 'text' },
//               { key: 'email', label: 'Email', type: 'text' },
//               { key: 'phone', label: 'Phone', type: 'text' },
//             ]}
//             filters={filters}
//             setFilters={setFilters}
//             onSearch={handleSearch}
//             onReset={handleReset}
//             loading={loading}
//           />
//         </CCardBody>
//       </CCard>

//       {/* Data Table */}
//       <CCard>
//         <CCardBody className="p-0">
//           {error && <CAlert color="danger">{error}</CAlert>}
//           {loading ? (
//             <div className="text-center py-5">
//               <CSpinner color="primary" />
//               <p>Loading users...</p>
//             </div>
//           ) : users.length === 0 ? (
//             <div className="text-center py-5">
//               <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
//               <h5>No users found</h5>
//             </div>
//           ) : (
//             <DataTable
//               data={users}
//               config={userTableConfig({
//                 onView: (row) => {
//                   setSelectedRow(row);
//                   setShowUserModal(true);
//                 },
//                 onTransactions: (row) => {
//                   setSelectedRow(row);
//                   setShowTransModal(true);
//                 },
//                 onChangePassword: (row) => {
//                   setSelectedRow(row);
//                   setShowPasswordModal(true);
//                 },
//                 onChangeEmail: (row) => {
//                   setSelectedRow(row);
//                   setShowEmailModal(true);
//                 },
//                 onChangeTransfer: (row) => {
//                   setSelectedRow(row);
//                   setShowTransferModal(true);
//                 },
//               })}
//             />
//           )}
//         </CCardBody>
//       </CCard>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="d-flex justify-content-center mt-4">
//           <CPagination>
//             <CPaginationItem
//               disabled={currentPage === 1}
//               onClick={() => handlePageChange(currentPage - 1)}
//             >
//               Previous
//             </CPaginationItem>
//             {[...Array(totalPages)].map((_, index) => (
//               <CPaginationItem
//                 key={index + 1}
//                 active={currentPage === index + 1}
//                 onClick={() => handlePageChange(index + 1)}
//               >
//                 {index + 1}
//               </CPaginationItem>
//             ))}
//             <CPaginationItem
//               disabled={currentPage === totalPages}
//               onClick={() => handlePageChange(currentPage + 1)}
//             >
//               Next
//             </CPaginationItem>
//           </CPagination>
//         </div>
//       )}

//       {/* Modals */}
//       {selectedRow && (
//         <>
//           <UserDetailsModal
//             show={showUserModal}
//             userId={selectedRow.userId}
//             onHide={() => setShowUserModal(false)}
//             onUserUpdated={fetchData}
//           />
// {console.log(selectedRow.userId)}
//           <UserTransModal
//             show={showTransModal}
//             userId={selectedRow.userId}
//             onHide={() => setShowTransModal(false)}
//             onUserUpdated={fetchData}
//           />

//           <ChangePasswordModal
//             show={showPasswordModal}
//             userId={selectedRow.userId}
//             onHide={() => setShowPasswordModal(false)}
//             onPasswordChanged={fetchData}
//           />

//           <ChangeEmailModal
//             show={showEmailModal}
//             userId={selectedRow.userId}
//             onHide={() => setShowEmailModal(false)}
//             onEmailChanged={fetchData}
//           />

//           <TransferModal
//             show={showTransferModal}
//             userId={selectedRow.userId}
//             onHide={() => setShowTransferModal(false)}
//             onTransferChanged={fetchData}
//           />
//         </>
//       )}
//     </>
//   );
// };

// export default BaseUserManagementView;import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilFilter, cilFilterX, cilUser } from '@coreui/icons'

import FilterBar from '../base/filtersView/FilterBar'
import DataTable from '../base/DataTable/DataTable'

// Import your modal components
import UserDetailsModal from '../base/Modal/UserDetailsModal'
import UserTransModal from '../base/Modal/UserTransModal'
import ChangePasswordModal from '../base/Modal/ChangePasswordModal'
import ChangeEmailModal from '../base/Modal/ChangeEmailModal'
import TransferModal from '../base/Modal/TransferModal'

import { userTableConfig } from '../base/tableConfig/userTableConfig'
import { useToast } from '../../context/ToastContext'
import { useEffect, useState } from 'react'

const BaseUserManagementView = ({ fetchUsers, updateUserStatus, title = 'User Management' }) => {
  const { addToast } = useToast()
  const [filters, setFilters] = useState({})
  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Modal state variables
  const [selectedRow, setSelectedRow] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showTransModal, setShowTransModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)

  // Fetch users with pagination
  const fetchData = async (page = currentPage, limit = itemsPerPage) => {
    setLoading(true)
    setError('')
    try {
      // Build query parameters
      const params = {
        page,
        limit,
        ...filters, // Include search filters
      }

      const response = await fetchUsers(params)

      // Assuming response structure:
      // { data: [], total: number, page: number, limit: number }
      if (response && response.data) {
        setUsers(response.data)
        setTotalUsers(response.total || response.data.length)

        // Calculate total pages
        const calculatedTotalPages = Math.ceil((response.total || response.data.length) / limit)
        setTotalPages(calculatedTotalPages)
      } else {
        // Fallback if API doesn't return structured response
        setUsers(response || [])
        setTotalUsers(response?.length || 0)
        setTotalPages(Math.ceil((response?.length || 0) / limit))
      }
    } catch (err) {
      setError('Failed to fetch user data.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    fetchData(1, itemsPerPage)
  }

  const handleReset = () => {
    setFilters({})
    setCurrentPage(1)
    fetchData(1, itemsPerPage)
  }

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    fetchData(page, itemsPerPage)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value)
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Reset to first page when changing items per page
    fetchData(1, newLimit)
  }

  // Update user status
  const handleStatusUpdate = async (userId, status) => {
    setLoading(true)
    try {
      const res = await updateUserStatus(userId, status)
      addToast(res.message || 'User status updated successfully')
      fetchData(currentPage, itemsPerPage) // Refresh current page
    } catch (err) {
      addToast(err.message || 'Failed to update user status', 'danger')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and when filters change
  useEffect(() => {
    fetchData(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage])

  // Generate pagination items
  const getPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      items.push(
        <CPaginationItem key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>
          1
        </CPaginationItem>,
      )
      if (startPage > 2) {
        items.push(<CPaginationItem key="ellipsis1">...</CPaginationItem>)
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <CPaginationItem key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
          {i}
        </CPaginationItem>,
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<CPaginationItem key="ellipsis2">...</CPaginationItem>)
      }
      items.push(
        <CPaginationItem
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </CPaginationItem>,
      )
    }

    return items
  }

  return (
    <>
      {/* Top Info Card */}
      <CRow className="mb-4">
        <CCol xs={12} sm={6} xl={3}>
          <CCard className="bg-info text-white mb-3">
            <CCardBody className="d-flex justify-content-between align-items-start pb-0">
              <div>
                <div className="text-value-lg">{totalUsers}</div>
                <div>Total Users</div>
              </div>
              <CIcon width={24} icon={cilPeople} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{title}</h5>
          <CButton
            color="link"
            className="p-0"
            onClick={() => setFiltersCollapsed(!filtersCollapsed)}
          >
            <CIcon icon={filtersCollapsed ? cilFilter : cilFilterX} />
          </CButton>
        </CCardHeader>
        <CCardBody className={filtersCollapsed ? 'd-none' : ''}>
          <FilterBar
            config={[
              { key: 'userId', label: 'User ID', type: 'text' },
              { key: 'email', label: 'Email', type: 'text' },
              { key: 'phone', label: 'Phone', type: 'text' },
            ]}
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            onReset={handleReset}
            loading={loading}
          />
        </CCardBody>
      </CCard>

      {/* Data Table */}
      <CCard>
        <CCardBody className="p-0">
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
              <h5>No users found</h5>
            </div>
          ) : (
            <DataTable
              data={users}
              config={userTableConfig({
                onView: (row) => {
                  setSelectedRow(row)
                  setShowUserModal(true)
                },
                onTransactions: (row) => {
                  setSelectedRow(row)
                  setShowTransModal(true)
                },
                onChangePassword: (row) => {
                  setSelectedRow(row)
                  setShowPasswordModal(true)
                },
                onChangeEmail: (row) => {
                  setSelectedRow(row)
                  setShowEmailModal(true)
                },
                onChangeTransfer: (row) => {
                  setSelectedRow(row)
                  setShowTransferModal(true)
                },
              })}
            />
          )}
        </CCardBody>
      </CCard>

      {/* Pagination Controls */}
      {users.length > 0 && (
        <CRow className="mt-4 align-items-center">
          <CCol xs={12} md={6} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <span className="me-2">Show</span>
              <CFormSelect
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                style={{ width: '80px' }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </CFormSelect>
              <span className="ms-2">entries per page</span>
            </div>
          </CCol>

          <CCol xs={12} md={6}>
            <div className="d-flex justify-content-md-end">
              <div className="d-flex align-items-center">
                <span className="me-3">
                  Page {currentPage} of {totalPages} ({totalUsers} total users)
                </span>
                <CPagination aria-label="Page navigation">
                  <CPaginationItem
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </CPaginationItem>
                  {getPaginationItems()}
                  <CPaginationItem
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              </div>
            </div>
          </CCol>
        </CRow>
      )}

      {/* Modals */}
      {selectedRow && (
        <>
          <UserDetailsModal
            show={showUserModal}
            userId={selectedRow.userId}
            onHide={() => setShowUserModal(false)}
            onUserUpdated={() => fetchData(currentPage, itemsPerPage)}
          />

          <UserTransModal
            show={showTransModal}
            userId={selectedRow.userId}
            onHide={() => setShowTransModal(false)}
            onUserUpdated={() => fetchData(currentPage, itemsPerPage)}
          />

          <ChangePasswordModal
            show={showPasswordModal}
            userId={selectedRow.userId}
            onHide={() => setShowPasswordModal(false)}
            onPasswordChanged={() => fetchData(currentPage, itemsPerPage)}
          />

          <ChangeEmailModal
            show={showEmailModal}
            userId={selectedRow.userId}
            onHide={() => setShowEmailModal(false)}
            onEmailChanged={() => fetchData(currentPage, itemsPerPage)}
          />

          <TransferModal
            show={showTransferModal}
            userId={selectedRow.userId}
            onHide={() => setShowTransferModal(false)}
            onTransferChanged={() => fetchData(currentPage, itemsPerPage)}
          />
        </>
      )}
    </>
  )
}

export default BaseUserManagementView
