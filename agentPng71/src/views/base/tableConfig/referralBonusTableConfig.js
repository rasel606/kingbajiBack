// src/components/base/tableConfig/referredUsersTableConfig.js
import React from "react";
import { CBadge, CButton } from "@coreui/react";

export const referralBonusTableConfig = ({ onEdit, onDelete }) => [
  {
    key: "name",
    label: "User Name",
    render: (value) => value || "-",
  },
  {
    key: "email",
    label: "Email",
    render: (value) => value || "-",
  },
  {
  key: "phone",
  label: "Phone",
  render: (phones) => {
    if (!phones || phones.length === 0) return "-";
    const defaultPhone = phones.find(p => p.isDefault) || phones[0];
    return `+${defaultPhone.countryCode} ${defaultPhone.number}`;
  },
},
,
  {
    key: "referredBy",
    label: "Referred By",
    render: (value) => value || "-",
  },
  {
    key: "affiliateInfo",
    label: "Affiliate Name",
    render: (value) => (value ? value.name : "-"),
  },
  {
    key: "referralCount",
    label: "Referral Count",
    render: (value) => value || 0,
  },
  {
    key: "status",
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
        {onDelete && (
          <CButton size="sm" color="danger" onClick={() => onDelete(row._id)}>
            Delete
          </CButton>
        )}
      </div>
    ),
  },
];