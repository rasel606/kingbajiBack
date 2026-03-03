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
// import { cilPeople, cilCash, cilFilter, cilFilterX, cilUser } from "@coreui/icons";

// import FilterBar from "../base/filtersView/FilterBar";
// import DataTable from "../base/DataTable/DataTable";
// import DetailModal from "../base/Modal/DetailModal";

// import filterConfig from "../base/filtersView/filterConfig";
// import { depositTableConfig } from "../base/tableConfig/depositTableConfig";
// import { useToast } from "../../context/ToastContext";
// import { usePagination } from "../../hooks/usePagination";

// const BaseWidthrawalView = ({
//   fetchTransactions,      // API function for fetching data
//   updateTransactionStatus, // API function for approve/reject
//   title = "Withdrawal Management",
// }) => {
//   const { addToast } = useToast();
//   const [filters, setFilters] = useState({});
//   const [transactions, setTransactions] = useState([]);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [filtersCollapsed, setFiltersCollapsed] = useState(true);
//   const [modalShow, setModalShow] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);

//   // Pagination hook
//   const {
//     currentPage,
//     itemsPerPage,
//     handlePageChange,
//     handleItemsPerPageChange,
//     resetPagination,
//     getPaginationParams,
//   } = usePagination(1, 10);

//   // Fetch withdrawals
//   const fetchData = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const paginationParams = getPaginationParams(filters);
//       const res = await fetchTransactions(paginationParams);
//       setTransactions(res.transactions || []);
//       setTotalAmount(res.totalAmount || 0);
//       setTotalUsers(res.totalUsers || 0);
//     } catch (err) {
//       setError("Failed to fetch withdrawals.");
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Approve / Reject transaction
//   const handleStatusUpdate = async (transactionID, userId, actionType) => {
//     console.log(transactionID, userId, actionType);
//     setLoading(true);
//     try {
//       const res = await updateTransactionStatus(transactionID, userId, actionType);
//       addToast(res.message || "Status updated successfully");
//       fetchData();
//     } catch (err) {
//       addToast(err.message || "Failed to update status", "danger");
//     } finally {
//       setLoading(false);
//       setModalShow(false);
//     }
//   };

//   const handleShowModal = (row) => {
//     setSelectedRow(row);
//     setModalShow(true);
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

//   return (
//     <>
//       {/* Summary Cards */}
//       <CRow className="mb-4">
//         {[
//           { title: "Total Withdrawal Users", value: totalUsers.toLocaleString(), icon: cilPeople, color: "success" },
//           { title: "Total Withdrawal Amount", value: `$${totalAmount.toLocaleString()}`, icon: cilCash, color: "info" },
//         ].map((stat, idx) => (
//           <CCol xs={12} sm={6} xl={3} key={idx}>
//             <CCard className={`bg-${stat.color} text-white mb-3`}>
//               <CCardBody className="d-flex justify-content-between align-items-start pb-0">
//                 <div>
//                   <div className="text-value-lg">{stat.value}</div>
//                   <div>{stat.title}</div>
//                 </div>
//                 <CIcon width={24} icon={stat.icon} />
//               </CCardBody>
//             </CCard>
//           </CCol>
//         ))}
//       </CRow>

//       {/* Filters */}
//       <CCard className="mb-4">
//         <CCardHeader className="d-flex justify-content-between align-items-center">
//           <h5 className="mb-0">{title}</h5>
//           <CButton color="link" className="p-0" onClick={() => setFiltersCollapsed(!filtersCollapsed)}>
//             <CIcon icon={filtersCollapsed ? cilFilter : cilFilterX} />
//           </CButton>
//         </CCardHeader>
//         <CCardBody className={filtersCollapsed ? "d-none" : ""}>
//           <FilterBar
//             config={filterConfig}
//             filters={filters}
//             setFilters={setFilters}
//             onSearch={handleSearch}
//             onReset={handleReset}
//             loading={loading}
//           />
//         </CCardBody>
//       </CCard>

//       {/* Table */}
//       <CCard>
//         <CCardBody className="p-0">
//           {error && <CAlert color="danger" className="m-3">{error}</CAlert>}
//           {loading ? (
//             <div className="text-center py-5">
//               <CSpinner color="primary" />
//               <p>Loading withdrawals...</p>
//             </div>
//           ) : transactions.length === 0 ? (
//             <div className="text-center py-5">
//               <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
//               <h5>No withdrawals found</h5>
//             </div>
//           ) : (
//             <>
//               <DataTable
//                 data={transactions}
//                 config={depositTableConfig}
//                 onShowModal={handleShowModal}
//                 onStatusUpdate={handleStatusUpdate}
//               />

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="d-flex justify-content-between align-items-center p-3 border-top">
//                   <div className="text-muted">
//                     Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} entries
//                   </div>
//                   <CPagination aria-label="Pagination">
//                     <CPaginationItem disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
//                       Previous
//                     </CPaginationItem>
//                     {[...Array(totalPages)].map((_, i) => {
//                       const page = i + 1;
//                       if (
//                         page === 1 ||
//                         page === totalPages ||
//                         (page >= currentPage - 1 && page <= currentPage + 1)
//                       ) {
//                         return (
//                           <CPaginationItem key={page} active={currentPage === page} onClick={() => handlePageChange(page)}>
//                             {page}
//                           </CPaginationItem>
//                         );
//                       } else if (page === currentPage - 2 || page === currentPage + 2) {
//                         return <CPaginationItem key={page}>...</CPaginationItem>;
//                       }
//                       return null;
//                     })}
//                     <CPaginationItem disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
//                       Next
//                     </CPaginationItem>
//                   </CPagination>

//                   <div className="d-flex align-items-center">
//                     <span className="me-2">Show:</span>
//                     <select
//                       className="form-select form-select-sm w-auto"
//                       value={itemsPerPage}
//                       onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//                     >
//                       {[10, 25, 50, 100].map((size) => (
//                         <option key={size} value={size}>{size}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </CCardBody>
//       </CCard>

//       {/* Modal */}
//       <DetailModal
//         show={modalShow}
//         onHide={() => setModalShow(false)}
//         data={selectedRow}
//         setSelectedRow={setSelectedRow}
//         onStatusUpdate={handleStatusUpdate}
//       />
//     </>
//   );
// };

// export default BaseWidthrawalView;
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
  CPagination,
  CPaginationItem,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilCash, cilFilter, cilFilterX, cilUser } from '@coreui/icons'

import FilterBar from '../base/filtersView/FilterBar'
import DataTable from '../base/DataTable/DataTable'
import DetailModal from '../base/Modal/DetailModal'

import filterConfig from '../base/filtersView/filterConfig'
import { depositTableConfig } from '../base/tableConfig/depositTableConfig'
import { useToast } from '../../context/ToastContext'

const BaseWidthrawalView = ({
  fetchTransactions, // API function for fetching data
  updateTransactionStatus, // API function for approve/reject
  title = 'Withdrawal Management',
}) => {
  const { addToast } = useToast()
  const [filters, setFilters] = useState({})
  const [transactions, setTransactions] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)
  const [modalShow, setModalShow] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch withdrawals with pagination
  const fetchData = async (page = currentPage, limit = itemsPerPage) => {
    setLoading(true)
    setError('')
    try {
      // Build query parameters with pagination
      const params = {
        page,
        limit,
        ...filters,
      }

      const res = await fetchTransactions(params)

      // Assuming API returns structured response
      if (res && (res.transactions || res.data)) {
        setTransactions(res.transactions || res.data || [])
        setTotalAmount(res.totalAmount || 0)
        setTotalTransactions(
          res.total || res.count || (res.transactions ? res.transactions.length : 0) || 0,
        )

        // Calculate total pages
        const calculatedTotalPages = Math.ceil(
          (res.total || res.count || (res.transactions ? res.transactions.length : 0) || 0) / limit,
        )
        setTotalPages(calculatedTotalPages)
      } else {
        // Fallback for non-structured response
        setTransactions(res || [])
        setTotalAmount(0)
        setTotalTransactions(res?.length || 0)
        setTotalPages(Math.ceil((res?.length || 0) / limit))
      }
    } catch (err) {
      setError('Failed to fetch withdrawals.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    fetchData(1, itemsPerPage)
  }

  // Handle reset filters
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

  // Approve / Reject transaction
  const handleStatusUpdate = async (transactionID, userId, actionType) => {
    console.log(transactionID, userId, actionType)
    setLoading(true)
    try {
      const res = await updateTransactionStatus(transactionID, userId, actionType)
      addToast(res.message || 'Status updated successfully')
      fetchData(currentPage, itemsPerPage) // Refresh current page
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'danger')
    } finally {
      setLoading(false)
      setModalShow(false)
    }
  }

  const handleShowModal = (row) => {
    setSelectedRow(row)
    setModalShow(true)
  }

  // Generate pagination items with ellipsis
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

  // Calculate showing range
  const getShowingRange = () => {
    const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalTransactions)
    const end = Math.min(currentPage * itemsPerPage, totalTransactions)
    return { start, end }
  }

  // Initial fetch
  useEffect(() => {
    fetchData(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage])

  const { start, end } = getShowingRange()

  return (
    <>
      {/* Summary Cards */}
      <CRow className="mb-4">
        {[
          {
            title: 'Total Withdrawals',
            value: totalTransactions.toLocaleString(),
            icon: cilPeople,
            color: 'success',
          },
          {
            title: 'Total Withdrawal Amount',
            value: `$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: cilCash,
            color: 'info',
          },
        ].map((stat, idx) => (
          <CCol xs={12} sm={6} xl={3} key={idx}>
            <CCard className={`bg-${stat.color} text-white mb-3`}>
              <CCardBody className="d-flex justify-content-between align-items-start pb-0">
                <div>
                  <div className="text-value-lg">{stat.value}</div>
                  <div>{stat.title}</div>
                </div>
                <CIcon width={24} icon={stat.icon} />
              </CCardBody>
            </CCard>
          </CCol>
        ))}
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
            config={filterConfig}
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
            onReset={handleReset}
            loading={loading}
          />
        </CCardBody>
      </CCard>

      {/* Table */}
      <CCard>
        <CCardBody className="p-0">
          {error && (
            <CAlert color="danger" className="m-3">
              {error}
            </CAlert>
          )}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading withdrawals...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5">
              <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
              <h5>No withdrawals found</h5>
              {Object.keys(filters).length > 0 && (
                <p className="text-muted">Try changing your search filters</p>
              )}
            </div>
          ) : (
            <>
              <DataTable
                data={transactions}
                config={depositTableConfig}
                onShowModal={handleShowModal}
                onStatusUpdate={handleStatusUpdate}
              />

              {/* Pagination Controls */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top">
                {/* Items per page selector and showing info */}
                <div className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <span className="me-2 text-muted">Show:</span>
                    <CFormSelect
                      size="sm"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      style={{ width: '80px' }}
                    >
                      {[5, 10, 20, 30, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </CFormSelect>
                    <span className="ms-2 text-muted">entries</span>
                  </div>
                  <div className="mt-1 text-muted small">
                    Showing {start} to {end} of {totalTransactions} entries
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mb-3 mb-md-0">
                    <CPagination aria-label="Pagination">
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
                )}

                {/* Page info */}
                <div className="text-muted">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Modal */}
      <DetailModal
        show={modalShow}
        onHide={() => {
          setModalShow(false)
          setSelectedRow(null)
        }}
        data={selectedRow}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  )
}

export default BaseWidthrawalView
