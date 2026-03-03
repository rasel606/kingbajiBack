

import React from "react";
import { CButton } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilSearch } from "@coreui/icons";
import StatusBadge from "../StatusBadge/StatusBadge";

export const depositTableConfig = [
  { key: "index", label: "#", type: "index" },
  { key: "amount", label: "Amount", render: (val) => `$${val}` },
  { key: "base_amount", label: "Base Amount", render: (val) => `$${val}` },
  { key: "bonus_amount", label: "Bonus", render: (val) => `$${val || 0}` },
  { key: "gateway_name", label: "Gateway" },
  { key: "transactionID", label: "Transaction ID", className: "text-monospace" },
  {
    key: "status",
    label: "Status",
    render: (val, row, onStatusUpdate) => (
      <StatusBadge status={val} onUpdate={() => onStatusUpdate(row.transactionID, row.userId, 1)} />
    ),
  },
  { key: "userId", label: "User ID" },
  {
    key: "datetime",
    label: "Date",
    render: (val) => new Date(val).toLocaleString(),
  },
  {
    key: "actions",
    label: "Actions",
    render: (val, row, onShowModal) => (
      <CButton color="outline-primary" size="sm" onClick={() => onShowModal(row)}>
        <CIcon icon={cilSearch} />
      </CButton>
    ),
  },
];
