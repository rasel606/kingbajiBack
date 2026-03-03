// // import React, { useState, useEffect } from "react";
// // import {
// //   CCard,
// //   CCardBody,
// //   CCardHeader,
// //   CCol,
// //   CRow,
// //   CButton,
// //   CSpinner,
// //   CAlert,
// // } from "@coreui/react";
// // import CIcon from "@coreui/icons-react";
// // import { cilPeople, cilCash, cilFilter, cilFilterX, cilUser } from "@coreui/icons";

// // import FilterBar from "../base/filtersView/FilterBar";
// // import DataTable from "../base/DataTable/DataTable";
// // import DetailModal from "../base/Modal/DetailModal";

// // import filterConfig from "../base/filtersView/filterConfig";
// // import { depositTableConfig } from "../base/tableConfig/depositTableConfig";
// // import { getWayService } from "../../service/getWayService";
// // import { adminServices } from "../../service/adminServices";
// // import { useToast } from "../../context/ToastContext";
// // const WidthrawalView = () => {

// //     const { addToast } = useToast();
// //   const [filters, setFilters] = useState({});
// //   const [deposits, setDeposits] = useState([]);
// //   const [totalDeposits, setTotalDeposits] = useState(0);
// //   const [totalDepositUser, setTotalDepositUser] = useState(0);
// //   const [depositLoading, setDepositLoading] = useState(false);
// //   const [error, setError] = useState("");
// //   const [filtersCollapsed, setFiltersCollapsed] = useState(true);
// //   const [modalShow, setModalShow] = useState(false);
// //   const [selectedRow, setSelectedRow] = useState(null);

// //   // Fetch deposits from backend
// //   const fetchDeposits = async () => {
// //     setDepositLoading(true);
// //     setError("");
// //     try {
// //       const res = await getWayService.searchTransactionsWidthrawal(filters);
// //       setDeposits(res.transactions || []);
// //       setTotalDeposits(res.total || 0);
// //       setTotalDepositUser(res.transactions?.length || 0);
// //     } catch (err) {
// //       setError("Failed to fetch deposits.");
// //     } finally {
// //       setDepositLoading(false);
// //     }
// //   };

// //   // Approve or Reject transaction
// //   const handleStatusUpdate = async (transactionID, userId, actionType) => {
// //     setDepositLoading(true);
// //     try {
// //       const res = await adminServices.updateDepositwidthrowalStatus(transactionID, userId, actionType);
// //       addToast(res.message); // success message from backend
// //       fetchDeposits(); // refresh table after update
// //     } catch (err) {
// //       addToast(res.message , "danger");
// //     } finally {
// //       setDepositLoading(false);
// //       setModalShow(false);
// //     }
// //   };

// //   const handleShowModal = (row) => {
// //     setSelectedRow(row);
// //     setModalShow(true);
// //   };

// //   useEffect(() => {
// //     fetchDeposits();
// //   }, []);

// //   return (
// //     <>
// //       {/* Summary Cards */}
// //       <CRow className="mb-4">
// //         {[
// //           { title: "Total Deposit User", value: totalDepositUser, icon: cilPeople, color: "success" },
// //           { title: "Total Deposit Money", value: `$${totalDeposits.toLocaleString()}`, icon: cilCash, color: "info" },
// //         ].map((stat, idx) => (
// //           <CCol xs={12} sm={6} xl={3} key={idx}>
// //             <CCard className={`bg-${stat.color} text-white mb-3`}>
// //               <CCardBody className="d-flex justify-content-between align-items-start pb-0">
// //                 <div>
// //                   <div className="text-value-lg">{stat.value}</div>
// //                   <div>{stat.title}</div>
// //                 </div>
// //                 <CIcon width={24} icon={stat.icon} />
// //               </CCardBody>
// //             </CCard>
// //           </CCol>
// //         ))}
// //       </CRow>

// //       {/* Filters */}
// //       <CCard className="mb-4">
// //         <CCardHeader className="d-flex justify-content-between align-items-center">
// //           <h5 className="mb-0">Deposit Management</h5>
// //           <CButton color="link" className="p-0" onClick={() => setFiltersCollapsed(!filtersCollapsed)}>
// //             <CIcon icon={filtersCollapsed ? cilFilter : cilFilterX} />
// //           </CButton>
// //         </CCardHeader>
// //         <CCardBody className={filtersCollapsed ? "d-none" : ""}>
// //           <FilterBar
// //             config={filterConfig}
// //             filters={filters}
// //             setFilters={setFilters}
// //             onSearch={fetchDeposits}
// //             onReset={() => { setFilters({}); fetchDeposits(); }}
// //             loading={depositLoading}
// //           />
// //         </CCardBody>
// //       </CCard>

// //       {/* Deposits Table */}
// //       <CCard>
// //         <CCardBody className="p-0">
// //           {error && <CAlert color="danger" className="m-3">{error}</CAlert>}
// //           {depositLoading ? (
// //             <div className="text-center py-5">
// //               <CSpinner color="primary" />
// //               <p>Loading deposits...</p>
// //             </div>
// //           ) : deposits.length === 0 ? (
// //             <div className="text-center py-5">
// //               <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
// //               <h5>No deposits found</h5>
// //             </div>
// //           ) : (
// //             <DataTable
// //               data={deposits}
// //               config={depositTableConfig}
// //               onShowModal={handleShowModal}
// //             />
// //           )}
// //         </CCardBody>
// //       </CCard>

// //       {/* Detail Modal */}
// //       <DetailModal
// //         show={modalShow}
// //         onHide={() => setModalShow(false)}
// //         data={selectedRow}
// //         setSelectedRow={setSelectedRow}
// //         onStatusUpdate={handleStatusUpdate}
// //       />
// //     </>
// //   );
// // };

// // export default WidthrawalView;

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
//           { title: "Total Withdrawal Users", value: totalDepositUser.toLocaleString(), icon: cilPeople, color: "success" },
//           { title: "Total Withdrawal Amount", value: `$${totalDeposits.toLocaleString()}`, icon: cilCash, color: "info" },
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
//           <h5 className="mb-0">Withdrawal Management</h5>
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
//             loading={depositLoading}
//           />
//         </CCardBody>
//       </CCard>

//       {/* Deposits Table */}
//       <CCard>
//         <CCardBody className="p-0">
//           {error && <CAlert color="danger" className="m-3">{error}</CAlert>}
//           {depositLoading ? (
//             <div className="text-center py-5">
//               <CSpinner color="primary" />
//               <p>Loading withdrawals...</p>
//             </div>
//           ) : deposits.length === 0 ? (
//             <div className="text-center py-5">
//               <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
//               <h5>No withdrawals found</h5>
//             </div>
//           ) : (
//             <>
//               <DataTable
//                 data={deposits}
//                 config={depositTableConfig}
//                 onShowModal={handleShowModal}
//                 onStatusUpdate={handleStatusUpdate}
//               />

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="d-flex justify-content-between align-items-center p-3 border-top">
//                   <div className="text-muted">
//                     Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalDepositUser)} of {totalDepositUser} entries
//                   </div>

//                   <CPagination aria-label="Withdrawal pagination">
//                     <CPaginationItem
//                       disabled={currentPage === 1}
//                       onClick={() => handlePageChange(currentPage - 1)}
//                     >
//                       Previous
//                     </CPaginationItem>

//                     {[...Array(totalPages)].map((_, index) => {
//                       const pageNumber = index + 1;
//                       // Show first page, last page, and pages around current page
//                       if (
//                         pageNumber === 1 ||
//                         pageNumber === totalPages ||
//                         (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
//                       ) {
//                         return (
//                           <CPaginationItem
//                             key={pageNumber}
//                             active={currentPage === pageNumber}
//                             onClick={() => handlePageChange(pageNumber)}
//                           >
//                             {pageNumber}
//                           </CPaginationItem>
//                         );
//                       } else if (
//                         pageNumber === currentPage - 2 ||
//                         pageNumber === currentPage + 2
//                       ) {
//                         return <CPaginationItem key={pageNumber}>...</CPaginationItem>;
//                       }
//                       return null;
//                     })}

//                     <CPaginationItem
//                       disabled={currentPage === totalPages}
//                       onClick={() => handlePageChange(currentPage + 1)}
//                     >
//                       Next
//                     </CPaginationItem>
//                   </CPagination>

//                   {/* Items per page selector */}
//                   <div className="d-flex align-items-center">
//                     <span className="me-2">Show:</span>
//                     <select
//                       className="form-select form-select-sm w-auto"
//                       value={itemsPerPage}
//                       onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//                     >
//                       {[10, 25, 50, 100].map(size => (
//                         <option key={size} value={size}>
//                           {size}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </CCardBody>
//       </CCard>

//       {/* Detail Modal */}
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

// export default WidthrawalView;

import React from 'react'
import BaseWidthrawalView from './BaseWidthrawalView'
import { getWayService } from '../../service/getWayService'
import { adminServices } from '../../service/adminServices'

const AdminWidthrawalView = () => (
  <BaseWidthrawalView
    title="Admin Withdrawal Management"
    fetchTransactions={getWayService.searchTransactionsWidthrawal}
    updateTransactionStatus={adminServices.updateDepositwidthrowalStatus}
  />
)

export default AdminWidthrawalView
