// import React, { useState } from "react";
// import { CFormSwitch, CButton, CFormInput } from "@coreui/react";
// import CIcon from "@coreui/icons-react";
// import { cilPencil, cilSave } from "@coreui/icons";

// export const paymentGatewayTableConfig = ({ onStatusUpdate, onEdit, onGatewayNumberUpdate }) => [
//   {
//     key: "gateway_name",
//     label: "Gateway Name",
//     render: (val) => `${val}` || "-",
//   },
//   {
//     key: "payment_type",
//     label: "Payment Type",
//    render: (val) => `${val}` || "-",
//   },
//   // {
//   //   key: "charge",
//   //   label: "Charge",
//   //   render: (row) => `${row.charge ?? 0}%`,
//   // },
//   {
//     key: "gateway_Number",
//     label: "Gateway Number",
//     render: (row) => (
//       <GatewayNumberEditor row={row} onGatewayNumberUpdate={onGatewayNumberUpdate} />
//     ),
//   },
//   {
//     key: "is_active",
//     label: "Status",
//     render: (row) => (
//       <CFormSwitch
//         color="success"
//         checked={row.is_active}
//         onChange={() => onStatusUpdate(row)}
//       />
//     ),
//   },
//   // {
//   //   key: "actions",
//   //   label: "Actions",
//   //   render: (row) => (
//   //     <CButton
//   //       size="sm"
//   //       color="info"
//   //       variant="outline"
//   //       className="text-white"
//   //       onClick={() => onEdit(row)}
//   //     >
//   //       <CIcon icon={cilPencil} /> Edit
//   //     </CButton>
//   //   ),
//   // },
// ];

// const GatewayNumberEditor = ({ row, onGatewayNumberUpdate }) => {
//   const [editing, setEditing] = useState(false);
//   const [value, setValue] = useState(row.gateway_number || "");

//   const handleSave = () => {
//     if (value !== row.gateway_number) {
//       onGatewayNumberUpdate(row.gateway_name, value);
//     }
//     setEditing(false);
//   };

//   return editing ? (
//     <div className="d-flex align-items-center">
//       <CFormInput
//         size="sm"
//         value={value}
//         onChange={(e) => setValue(e.target.value)}
//         style={{ maxWidth: "120px" }}
//       />
//       <CButton size="sm" color="success" className="ms-2" onClick={handleSave}>
//         <CIcon icon={cilSave} />
//       </CButton>
//     </div>
//   ) : (
//     <span
//       style={{ cursor: "pointer", textDecoration: "underline" }}
//       onClick={() => setEditing(true)}
//     >
//       {value || "-"}
//     </span>
//   );
// };

// import React, { useState } from "react";
// import { CFormSwitch, CButton, CFormInput, CFormSelect, CRow } from "@coreui/react";
// import CIcon from "@coreui/icons-react";
// import { cilSave } from "@coreui/icons";

// /**
//  * Dynamic payment gateway table configuration
//  * Handles inline editing for gateway_number and payment_type
//  */
// export const paymentGatewayTableConfig = ({
//   onStatusUpdate,
//   onGatewayNumberUpdate,
//   onPaymentTypeUpdate,
//   paymentTypeOptions = ["Send Money", "Cashout", "Payment"], // dynamic options
// }) => [
//   {
//     key: "gateway_name",
//     label: "Gateway Name",
//     render: (val) => `${val}` || "-",
//   },
//   {
//     key: "payment_type",
//     label: "Payment Type",
//     render: (val,row) => (
//       <PaymentTypeEditor
//         row={row}
//         options={paymentTypeOptions}
//         onPaymentTypeUpdate={onPaymentTypeUpdate}
//       />
//     ),
//   },
//     {
//     key: "gateway_Number",
//     label: "Gateway Number",
//     render: (val,row) => (
//       <GatewayNumberEditor row={row} onGatewayNumberUpdate={onGatewayNumberUpdate} />
//     ),
//   },
//   {
//     key: "is_active",
//     label: "Status",
//     render: (row) => (
//       <CFormSwitch
//         color="success"
//         checked={row.is_active}
//         onChange={() => onStatusUpdate(row)}
//       />
//     ),
//   },
// ];

// /** Inline editor for gateway number */
// // const GatewayNumberEditor = ({ row, onGatewayNumberUpdate }) => {
// //   const [editing, setEditing] = useState(false);
// //   const [value, setValue] = useState( "");
// // console.log(row)
// //   const handleSave = () => {
// //     // if (value !== row.gateway_number) {
// //       onGatewayNumberUpdate(row.gateway_name, value);
// //     // }
// //     setEditing(false);
// //   };

// //   return editing ? (
// //     <div className="d-flex align-items-center">
// //       <CFormInput
// //         size="sm"
// //         value={value}
// //         onChange={(e) => setValue(e.target.value)}
// //         style={{ maxWidth: "120px" }}
// //       />
// //       <CButton size="sm" color="success" className="ms-2" onClick={handleSave}>
// //         <CIcon icon={cilSave} />
// //       </CButton>
// //     </div>
// //   ) : (
// //     <span
// //       style={{ cursor: "pointer", textDecoration: "underline" }}
// //       onClick={() => setEditing(true)}
// //     >
// //       {value || "-"}
// //     </span>
// //   );
// // };

// /** Inline editor for payment type */
// const PaymentTypeEditor = ({ row, options, onPaymentTypeUpdate }) => {
//   const [editing, setEditing] = useState(false);
//   const [value, setValue] = useState(row.payment_type || "");
// console.log(row)
//   const handleSave = () => {
//     if (value !== row.payment_type) {
//       onPaymentTypeUpdate(row.gateway_name, value);
//     }
//     setEditing(false);
//   };

//   return editing ? (
//     <div className="d-flex align-items-center">
//       <CRow className="g-3">
//                 {Object.keys(data).map((key, idx) => (
//                   <CCol key={idx} md={6}>
//                     <p className="mb-1 text-muted">{key}</p>
//                     <p className="fw-bold">{String(data[key])}</p>
//                   </CCol>
//                 ))}
//               </CRow>
//       <CFormSelect
//         size="sm"
//         value={value}
//         onChange={(e) => setValue(e.target.value)}
//         style={{ maxWidth: "140px" }}
//       >
//         {options.map((opt, idx) => (
//           <option key={idx} value={opt}>
//             {opt}
//           </option>
//         ))}
//       </CFormSelect>
//       <CButton size="sm" color="success" className="ms-2" onClick={handleSave}>
//         <CIcon icon={cilSave} />
//       </CButton>
//     </div>
//   ) : (
//     <span
//       style={{ cursor: "pointer", textDecoration: "underline" }}
//       onClick={() => setEditing(true)}
//     >
//       {value || "-"}
//     </span>
//   );
// };

// const GatewayNumberEditor = ({ row, onGatewayNumberUpdate }) => {
//   const [editing, setEditing] = useState(false);
//   const [value, setValue] = useState(row.gateway_number || "");

//   const handleSave = () => {
//     if (value !== row.gateway_number) {
//       onGatewayNumberUpdate(row.gateway_name, value);
//     }
//     setEditing(false);
//   };

//   return editing ? (
//     <div className="d-flex align-items-center">
//       <CFormInput
//         size="sm"
//         value={value}
//         onChange={(e) => setValue(e.target.value)}
//         style={{ maxWidth: "120px" }}
//       />
//       <CButton size="sm" color="success" className="ms-2" onClick={handleSave}>
//         <CIcon icon={cilSave} />
//       </CButton>
//     </div>
//   ) : (
//     <span
//       style={{ cursor: "pointer", textDecoration: "underline" }}
//       onClick={() => setEditing(true)}
//     >
//       {value || "-"}
//     </span>
//   );
// };

import React, { useState } from 'react'
import { CFormSwitch, CButton, CFormInput, CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave } from '@coreui/icons'

/**
 * Dynamic payment gateway table configuration
 * Handles inline editing for gateway_number and payment_type
 */
export const paymentWidthralTableConfig = ({
  onStatusUpdate,
  onGatewayNumberUpdate,
  onPaymentTypeUpdate,
  paymentTypeOptions = ['Send Money', 'Cashout', 'Payment'], // dynamic options
}) => [
  {
    key: 'gateway_name',
    label: 'Gateway Name',
    render: (val) => `${val}` || '-',
  },
  { key: 'image_url', label: 'image_url', type: 'image', round: true, width: 40, height: 40 },
  {
    key: 'payment_type',
    label: 'Payment Type',
    render: (val, row) => (
      <PaymentTypeEditor
        row={row}
        options={paymentTypeOptions}
        onPaymentTypeUpdate={onPaymentTypeUpdate}
      />
    ),
  },
  // {
  //   key: "gateway_number", // ✅ fixed key name (was gateway_Number)
  //   label: "Gateway Number",
  //   render: (val, row) => (
  //     <GatewayNumberEditor row={row} onGatewayNumberUpdate={onGatewayNumberUpdate} />
  //   ),
  // },
  {
    key: 'is_active',
    label: 'Status',
    render: (row) => (
      <CFormSwitch color="success" checked={row.is_active} onChange={() => onStatusUpdate(row)} />
    ),
  },
]

/**
 * Inline editor for payment type
 */
const PaymentTypeEditor = ({ row, options, onPaymentTypeUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(row.payment_type || '')

  const handleSave = () => {
    if (value !== row.payment_type) {
      onPaymentTypeUpdate(row.gateway_name, value)
    }
    setEditing(false)
  }

  return editing ? (
    <div className="d-flex align-items-center">
      <CFormSelect
        size="sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ maxWidth: '140px' }}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </CFormSelect>
      <CButton size="sm" color="success" className="ms-2" onClick={handleSave}>
        <CIcon icon={cilSave} />
      </CButton>
    </div>
  ) : (
    <span
      style={{ cursor: 'pointer', textDecoration: 'underline' }}
      onClick={() => setEditing(true)}
    >
      {value || '-'}
    </span>
  )
}

/**
 * Inline editor for gateway number
 */
// const GatewayNumberEditor = ({ row, onGatewayNumberUpdate }) => {
//   const [editing, setEditing] = useState(false);
//   const [value, setValue] = useState(row.gateway_Number || "");

//   const handleSave = () => {
//     if (value !== row.gateway_number) {
//       onGatewayNumberUpdate(row.gateway_name, value);
//     }
//     setEditing(false);
//   };

//   return editing ? (
//     <div className="d-flex align-items-center">
//       <CFormInput
//         size="sm"
//         value={value}
//         onChange={(e) => setValue(e.target.value)}
//         style={{ maxWidth: "120px" }}
//       />
//       <CButton size="sm" color="success" className="ms-2" onClick={handleSave}>
//         <CIcon icon={cilSave} />
//       </CButton>
//     </div>
//   ) : (
//     <span
//       style={{ cursor: "pointer", textDecoration: "underline" }}
//       onClick={() => setEditing(true)}
//     >
//       {value || "-"}
//     </span>
//   );
// };
