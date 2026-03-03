// components/views/DepositFullView/DepositFullView.js
import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CSpinner,
  CAlert,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { 
  cilPeople, 
  cilCash, 
  cilFilter, 
  cilFilterX, 
  cilUser, 
  cilDollar,
  cilCheckCircle,
  cilArrowThickFromBottom,
  cilArrowThickToBottom,
  cilReload
} from "@coreui/icons";

import FilterBar from "../base/filtersView/FilterBar";
import DataTable from "../base/DataTable/DataTable";
import StatCard from "../base/StatCard/StatCard";
import ActionDropdown, { depositActions } from "../base/ActionDropdown/ActionDropdown";
import StatusBadge from "../base/StatusBadge/StatusBadgeNew";
import DetailModal from "../base/Modal/DetailModal";

import filterConfig from "../base/filtersView/filterConfig";
import { getWayService } from "../../service/getWayService";
import { useToast } from "../../context/ToastContext";

// Table configuration using reusable components
export const depositTableConfig = [
  { key: "index", label: "#", type: "index" },
  { 
    key: "amount", 
    label: "Amount", 
    render: (val) => `$${val?.toLocaleString() || '0'}` 
  },
  { 
    key: "base_amount", 
    label: "Base Amount", 
    render: (val) => `$${val?.toLocaleString() || '0'}` 
  },
  { 
    key: "bonus_amount", 
    label: "Bonus", 
    render: (val) => `$${val?.toLocaleString() || '0'}` 
  },
  { key: "gateway_name", label: "Gateway" },
  { 
    key: "transactionID", 
    label: "Transaction ID", 
    className: "text-monospace font-monospace" 
  },
  {
    key: "status",
    label: "Status",
    render: (val) => <StatusBadge status={val} />
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
    render: (val, row) => {
      const actions = depositActions[row.status] || depositActions.default;
      return (
        <ActionDropdown
          item={row}
          availableActions={actions}
          onAction={async (actionType, item) => {
            if (actionType === 'view') {
              // Handle view action
              return;
            }
            // Handle other actions
            await handleStatusUpdate(item.transactionID, item.userId, actionType);
          }}
        />
      );
    },
  },
];

const DepositFullView = () => {
  const { addToast } = useToast();
  const [filters, setFilters] = useState({});
  const [deposits, setDeposits] = useState([]);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalDepositUser: 0,
    pendingCount: 0,
    approvedCount: 0,
    depositedCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Fetch deposits
  const fetchDeposits = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWayService.GetAllTransactions(filters);
      setDeposits(res.transactions || []);
      
      const transactions = res.transactions || [];
      setStats({
        totalDeposits: res.total || 0,
        totalDepositUser: transactions.length,
        pendingCount: transactions.filter(t => t.status === 'pending').length,
        approvedCount: transactions.filter(t => t.status === 'approved').length,
        depositedCount: transactions.filter(t => t.status === 'deposited').length
      });
    } catch (err) {
      setError("Failed to fetch deposits.");
      addToast("Failed to fetch deposits", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Handle status updates
  const handleStatusUpdate = async (transactionID, userId, actionType) => {
    try {
      let res;
      switch (actionType) {
        case 'accept':
          res = await getWayService.approveDeposit(transactionID, userId);
          break;
        case 'reject':
          res = await getWayService.rejectDeposit(transactionID, userId);
          break;
        case 'deposit':
          res = await getWayService.markAsDeposited(transactionID, userId);
          break;
        case 'withdraw':
          res = await getWayService.markAsWithdrawn(transactionID, userId);
          break;
        default:
          throw new Error('Invalid action type');
      }

      addToast(res.message || "Action completed successfully", "success");
      fetchDeposits();
    } catch (err) {
      addToast(err.message || "Action failed", "danger");
    }
  };

  const handleShowModal = (row) => {
    setSelectedRow(row);
    setModalShow(true);
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const statCards = [
    { 
      title: "Total Deposit Users", 
      value: stats.totalDepositUser, 
      icon: cilPeople, 
      color: "success",
      subtitle: "Unique users" 
    },
    { 
      title: "Total Deposit Amount", 
      value: `$${stats.totalDeposits.toLocaleString()}`, 
      icon: cilCash, 
      color: "info",
      subtitle: "All time" 
    },
    { 
      title: "Pending Deposits", 
      value: stats.pendingCount, 
      icon: cilCheckCircle, 
      color: "warning",
      subtitle: "Awaiting approval" 
    },
    { 
      title: "Approved Deposits", 
      value: stats.approvedCount, 
      icon: cilDollar, 
      color: "primary",
      subtitle: "Ready for deposit" 
    },
    { 
      title: "Deposited Funds", 
      value: stats.depositedCount, 
      icon: cilArrowThickToBottom, 
      color: "success",
      subtitle: "Successfully deposited" 
    },
  ];

  return (
    <>
      {/* Statistics Cards */}
      <CRow className="mb-4">
        {statCards.map((stat, idx) => (
          <CCol xs={12} sm={6} xl={3} key={idx}>
            <StatCard {...stat} />
          </CCol>
        ))}
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Deposit Management</h5>
          <div>
            <CButton 
              color="primary" 
              size="sm" 
              className="me-2"
              onClick={fetchDeposits}
              disabled={loading}
            >
              <CIcon icon={cilReload} className="me-1" />
              Refresh
            </CButton>
            <CButton 
              color="link" 
              className="p-0" 
              onClick={() => setFiltersCollapsed(!filtersCollapsed)}
            >
              <CIcon icon={filtersCollapsed ? cilFilter : cilFilterX} />
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody className={filtersCollapsed ? "d-none" : ""}>
          <FilterBar
            config={filterConfig}
            filters={filters}
            setFilters={setFilters}
            onSearch={fetchDeposits}
            onReset={() => { 
              setFilters({}); 
              fetchDeposits(); 
            }}
            loading={loading}
          />
        </CCardBody>
      </CCard>

      {/* Data Table */}
      <CCard>
        <CCardHeader>
          <h5 className="mb-0">Deposit Transactions</h5>
          <small className="text-muted">
            Showing {deposits.length} transactions
            {stats.pendingCount > 0 && ` • ${stats.pendingCount} pending approval`}
          </small>
        </CCardHeader>
        <CCardBody className="p-0">
          <DataTable
            data={deposits}
            config={depositTableConfig}
            loading={loading}
            error={error}
            emptyMessage="No deposits found"
            onRowClick={handleShowModal}
          />
        </CCardBody>
      </CCard>

      {/* Detail Modal */}
      <DetailModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        data={selectedRow}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default DepositFullView;