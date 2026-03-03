// import React from "react"
// import { CFormInput, CFormSelect, CCol, CRow, CButton } from "@coreui/react"

// // export default ({ config, filters, setFilters }) => {





// //     return (

// //                 <CRow className="g-3">
// //                     {config.map(({ key, label, type, options }) => (
// //                         <CCol md={6} lg={3} key={key}>
// //                             {type === "select" ? (
// //                                 <CFormSelect
// //                                     value={filters[key] || ""}
// //                                     onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
// //                                     label={label}
// //                                 >
// //                                     {options.map((opt) =>
// //                                         typeof opt === "string" ? (
// //                                             <option key={opt} value={opt}>
// //                                                 {opt}
// //                                             </option>
// //                                         ) : (
// //                                             <option key={opt.value} value={opt.value}>
// //                                                 {opt.label}
// //                                             </option>
// //                                         )
// //                                     )}
// //                                 </CFormSelect>
// //                             ) : (
// //                                 <CFormInput
// //                                     type={type}
// //                                     value={filters[key] || ""}
// //                                     onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
// //                                     label={label}
// //                                 />
// //                             )}
// //                         </CCol>
// //                     ))}
// //                 </CRow>

// //     )

// // }


// import classNames from 'classnames'
// // import {
// //   CAvatar,
// //   CButton,
// //   CButtonGroup,
// //   CCard,
// //   CCardBody,
// //   CCardFooter,
// //   CCardHeader,
// //   CCol,
// //   CProgress,
// //   CRow,
// //   CTable,
// //   CTableBody,
// //   CTableDataCell,
// //   CTableHead,
// //   CTableHeaderCell,
// //   CTableRow,
// //   CModal,
// //   CModalBody,
// //   CModalFooter,
// //   CModalHeader,
// //   CModalTitle,
// //   CForm,
// //   CFormInput,
// //   CFormSelect,
// //   CSpinner,
// //   CAlert,
// //   CBadge,
// //   CInputGroup,
// //   CFormCheck
// // } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import {
//   cilCloudDownload,
//   cilPeople,
//   cilUser,
//   cilUserFemale,
//   cilCash,
//   cilSearch,
//   cilFilter,
//   cilFilterX,
//   cilCalendar
// } from '@coreui/icons'


// export default  ({ config, filters, setFilters, onSearch, onReset, loading }) => {
//   return (
//     <CRow className="g-3">
//       {config.map((field) => (
//         <CCol md={6} lg={3} key={field.key}>
//           {field.type === "select" ? (
//             <CFormSelect
//               value={filters[field.key] || ""}
//               onChange={(e) => setFilters({ ...filters, [field.key]: e.target.value })}
//               label={field.label}
//             >
//               <option value="">All</option>
//               {field.options.map((opt, idx) =>
//                 typeof opt === "string" ? (
//                   <option key={idx} value={opt}>{opt}</option>
//                 ) : (
//                   <option key={idx} value={opt.value}>{opt.label}</option>
//                 )
//               )}
//             </CFormSelect>
//           ) : (
//             <CFormInput
//               type={field.type}
//               value={filters[field.key] || ""}
//               onChange={(e) => setFilters({ ...filters, [field.key]: e.target.value })}
//               placeholder={field.placeholder || ""}
//               label={field.label}
//             />
//           )}
//         </CCol>
//       ))}

//       <CCol xs={12} className="d-flex justify-content-end gap-2">
//         <CButton
//           color="outline-secondary"
//           onClick={onReset}
//         >
//           Reset
//         </CButton>
//         <CButton
//           color="primary"
//           onClick={onSearch}
//           disabled={loading}
//         >
//           {loading ? "Searching..." : "Search"}
//         </CButton>
//       </CCol>
//     </CRow>
//   )
// }




import React from "react";
import { CFormInput, CFormSelect, CCol, CRow, CButton } from "@coreui/react";

const FilterBar = ({ config, filters, setFilters, onSearch, onReset }) => {
  return (
    <CRow className="g-3">
      {config.map((field) => (
        <CCol md={6} lg={3} key={field.key}>
          {field.type === "select" ? (
            <CFormSelect
              value={filters[field.key] || ""}
              onChange={(e) =>
                setFilters({ ...filters, [field.key]: e.target.value })
              }
              label={field.label}
            >
              <option value="">All</option>
              {field.options.map((opt, idx) =>
                typeof opt === "string" ? (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ) : (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                )
              )}
            </CFormSelect>
          ) : (
            <CFormInput
              type={field.type}
              value={filters[field.key] || ""}
              onChange={(e) =>
                setFilters({ ...filters, [field.key]: e.target.value })
              }
              placeholder={field.placeholder || ""}
              label={field.label}
            />
          )}
        </CCol>
      ))}

      <CCol xs={12} className="d-flex gap-2 mt-2">
        <CButton color="primary" onClick={onSearch}>
          Search
        </CButton>
        <CButton color="secondary" onClick={onReset}>
          Reset
        </CButton>
      </CCol>
    </CRow>
  );
};

export default FilterBar;
