// // import React, { useState } from "react";
// // import {
// //   CTable,
// //   CTableHead,
// //   CTableRow,
// //   CTableHeaderCell,
// //   CTableBody,
// //   CTableDataCell,
// //   CButton,
// // } from "@coreui/react";
// // import DetailModal from "../Modal/DetailModal";
// // import GatewayEditModal from "../Modal/GatewayEditModal";

// // const DataTable = ({ data, config, onStatusUpdate, refreshData }) => {
// //   const [selectedRow, setSelectedRow] = useState(null);
// //   const [editModalType, setEditModalType] = useState(null); // 'detail' or 'edit'

// //   const handleActionClick = (row, type) => {
// //     setSelectedRow(row);
// //     setEditModalType(type);
// //   };

// //   const handleCloseModal = () => {
// //     setSelectedRow(null);
// //     setEditModalType(null);
// //   };

// //   return (
// //     <>
// //       <div className="table-responsive">
// //         <CTable hover>
// //           <CTableHead>
// //             <CTableRow>
// //               {config.map((col, idx) => (
// //                 <CTableHeaderCell key={col.key || idx}>{col.label}</CTableHeaderCell>
// //               ))}
// //             </CTableRow>
// //           </CTableHead>
// //           <CTableBody>
// //             {data.map((row, index) => (
// //               <CTableRow key={row.transactionID || index}>
// //                 {config.map((col, idx) => {
// //                   let value = col.key === "index" ? index + 1 : row[col.key];
// //                   return (
// //                     <CTableDataCell key={col.key || idx} className={col.className || ""}>
// //                       {col.render
// //                         ? col.render(value, row, (arg, type = "detail") => {
// //                             if (col.key === "status") {
// //                               onStatusUpdate(arg.transactionID, arg.userId, 1);
// //                             } else {
// //                               handleActionClick(arg, type);
// //                             }
// //                           })
// //                         : value}
// //                     </CTableDataCell>
// //                   );
// //                 })}
// //               </CTableRow>
// //             ))}
// //           </CTableBody>
// //         </CTable>
// //       </div>

// //       {/* Detail Modal */}
// //       {selectedRow && editModalType === "detail" && (
// //         <DetailModal
// //           show={!!selectedRow}
// //           onHide={handleCloseModal}
// //           data={selectedRow}
// //           onStatusUpdate={onStatusUpdate}
// //         />
// //       )}

// //       {/* Gateway Edit Modal */}
// //       {selectedRow && editModalType === "edit" && (
// //         <GatewayEditModal
// //           show={!!selectedRow}
// //           onHide={handleCloseModal}
// //           data={selectedRow}
// //           onStatusUpdate={onStatusUpdate}
// //           refreshData={refreshData}
// //         />
// //       )}
// //     </>
// //   );
// // };

// // export default DataTable;

// // export default DataTable;
// import React, { useState } from "react";
// import {
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
// } from "@coreui/react";
// import DetailModal from "../Modal/DetailModal";
// // import GatewayEditModal from "../Modal/GatewayEditModal";

// const DataTable = ({ data, config, onStatusUpdate, editModal,list,input }) => {
//   const [selectedRow, setSelectedRow] = useState(null);

//   return (
//     <>
//       <div className="table-responsive">
//         <CTable hover>
//           <CTableHead>
//             <CTableRow>
//               {config.map((col, idx) => (
//                 <CTableHeaderCell key={col.key || idx}>{col.label}</CTableHeaderCell>
//               ))}
//             </CTableRow>
//           </CTableHead>
//           <CTableBody>
//             {data.map((row, index) => (
//               <CTableRow key={row.transactionID || index}>
//                 {config.map((col, idx) => {
//                   let value = col.key === "index" ? index + 1 : row[col.key];
//                   return (
//                     <CTableDataCell key={col.key || idx} className={col.className || ""}>
//                       {col.render
//                         ? col.render(value, row, (arg) => {
//                           if (col.key === "status") onStatusUpdate(arg.transactionID, arg.userId, 1);
//                           else setSelectedRow(arg);
//                         })
//                         : value}
//                     </CTableDataCell>
//                   );
//                 })}
//               </CTableRow>
//             ))}
//           </CTableBody>
//         </CTable>
//       </div>

//       {selectedRow && (
//         <DetailModal
//           show={!!selectedRow}
//           onHide={() => setSelectedRow(null)}
//           data={selectedRow}
//           onStatusUpdate={onStatusUpdate}
//         />
//       )}

//     </>
//   );
// };

// export default DataTable;

import React, { useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import DetailModal from '../Modal/DetailModal'

const DataTable = ({ data, config, onStatusUpdate, onShowModal }) => {
  // const [selectedRow, setSelectedRow] = useState(null);
  // onShowModal(selectedRow);

  return (
    <>
      <div className="table-responsive">
        <CTable hover>
          <CTableHead>
            <CTableRow>
              {config.map((col, idx) => (
                <CTableHeaderCell key={`header-${col.key || idx}`}>{col.label}</CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((row, index) => (
              <CTableRow key={row.transactionID || index}>
                {config.map((col, idx) => {
                  let value = col.key === 'index' ? index + 1 : row[col.key]

                  return (
                    <CTableDataCell
                      key={`${index}-${col.key || idx}`}
                      className={col.className || ''}
                    >
                      {col.type === 'image' ? (
                        <img
                          src={value}
                          alt={col.label}
                          style={{
                            width: col.width || 40,
                            height: col.height || 40,
                            borderRadius: col.round ? '50%' : '6px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : col.render ? (
                        col.render(value, row, (arg) => {
                          if (col.key === 'status') onShowModal(arg.transactionID, arg.userId, 1)
                          else onShowModal(arg)
                        })
                      ) : (
                        value
                      )}
                    </CTableDataCell>
                  )
                })}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>
    </>
  )
}

export default DataTable
