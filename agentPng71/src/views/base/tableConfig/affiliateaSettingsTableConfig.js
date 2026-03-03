import React from "react";
import { CBadge, CButton } from "@coreui/react";

export const affiliateaSettingsTableConfig = ({ onEdit }) => [
  {
    key: "index",
    label: "#",
    render: (value) => (value != null ? value : "-"),
  },
  {
    key: "userId",
    label: "Affiliate ID",
    render: (value) => value || "-",
  },
  {
    key: "email",
    label: "Email",
    render: (value) => value || "-",
  },
  {
    key: "commissionRate",
    label: "Commission %",
    render: (value, row) => row.settings?.commissionRate ?? "-",
  },
  {
    key: "platformFee",
    label: "Platform Fee %",
    render: (value, row) => row.settings?.platformFee ?? "-",
  },
  {
    key: "Actions",
    label: "Actions",
    render: (_, row) => (
      <CButton size="sm" color="primary" onClick={() => onEdit(row)}>
        Edit
      </CButton>
    ),
  },
];
