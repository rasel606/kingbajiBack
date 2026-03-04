// import React from "react";
// import { CBadge, CButton } from "@coreui/react";

// export const bonusTableConfig = ({ onEdit }) => [
//   {
//     key: "index",
//     label: "#",
//     render: (value) => value ?? "-",
//   },
//   {
//     key: "name",
//     label: "Bonus Name",
//     render: (value) => value || "-",
//   },
//   {
//     key: "bonusType",
//     label: "Type",
//     render: (value) => value || "-",
//   },
//   {
//     key: "percentage",
//     label: "Percentage",
//     render: (value) => (value ? `${value}%` : "-"),
//   },
//   {
//     key: "fixedAmount",
//     label: "Fixed Amount",
//     render: (value) => (value ? `$${value}` : "-"),
//   },
//   {
//     key: "isActive",
//     label: "Status",
//     render: (value) => (
//       <CBadge color={value ? "success" : "secondary"}>
//         {value ? "Active" : "Inactive"}
//       </CBadge>
//     ),
//   },
//   {
//     key: "actions",
//     label: "Actions",
//     render: (_, row) => (
//       <CButton size="sm" color="primary" onClick={() => onEdit(row)}>
//         Edit
//       </CButton>
//     ),
//   },
// ];


import React from "react";
import { CBadge, CButton } from "@coreui/react";

export const bonusTableConfig = ({ onEdit, onDelete }) => [
//   {
//     key: "index",
//     label: "#",
//     render: (_, __, index) => index + 1,
//   },
  {
    key: "name",
    label: "Bonus Name",
    render: (value) => value || "-",
  },
  {
    key: "bonusType",
    label: "Type",
    render: (value) => value || "-",
  },
  {
    key: "percentage",
    label: "Percentage",
    render: (value) => (value ? `${value}%` : "-"),
  },
  {
    key: "wageringRequirement",
    label: "Wagering Requirement",
    render: (value) => (value ? `${value} X` : "-"),
  },
  {
    key: "fixedAmount",
    label: "Fixed Amount",
    render: (value) => (value ? `$${value}` : "-"),
  },
  {
    key: "validDays",
    label: "Valid Days",
    render: (value) => (value ? `${value}` : "-"),
  },
  {
    key: "isActive",
    label: "Status",
    render: (value) => (
      <CBadge color={value ? "success" : "secondary"}>
        {value ? "Active" : "Inactive"}
      </CBadge>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (_, row) => (
      <div className="d-flex gap-2">
        <CButton size="sm" color="primary" onClick={() => onEdit(row)}>
          Edit
        </CButton>
        <CButton size="sm" color="danger" onClick={() => onDelete(row._id)}>
          Delete
        </CButton>
      </div>
    ),
  },
];
