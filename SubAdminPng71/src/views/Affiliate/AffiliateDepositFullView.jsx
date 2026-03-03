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
import { cilPeople, cilCash, cilFilter, cilFilterX, cilUser } from "@coreui/icons";

import FilterBar from "../base/filtersView/FilterBar";
import DataTable from "../base/DataTable/DataTable";
import DetailModal from "../base/Modal/DetailModal";

import filterConfig from "../base/filtersView/filterConfig";
import { depositTableConfig } from "../base/tableConfig/depositTableConfig";

import { SubAdminServices } from "../../service/SubAdminServices";
import { useToast } from "../../context/ToastContext";
const DepositFullView = () => {
    const { addToast } = useToast();
  const [filters, setFilters] = useState({});
  const [deposits, setDeposits] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalDepositUser, setTotalDepositUser] = useState(0);
  const [depositLoading, setDepositLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Fetch deposits from backend
  const fetchDeposits = async () => {
    setDepositLoading(true);
    setError("");
    try {
      const res = await SubAdminServices.GetAffiliatePendingDepositList(filters);
      setDeposits(res.transactions || []);
      setTotalDeposits(res.total || 0);
      setTotalDepositUser(res.transactions?.length || 0);
    } catch (err) {
      setError("Failed to fetch deposits.");
    } finally {
      setDepositLoading(false);
    }
  };

  // Approve or Reject transaction
  const handleStatusUpdate = async (transactionID, userId, actionType) => {
    console.log(transactionID, userId, actionType);
    setDepositLoading(true);
    try {
      const res = await getWayService.updateDepositStatus(transactionID, userId, actionType);
      addToast(res.message); // success message from backend
      fetchDeposits(); // refresh table after update
    } catch (err) {
      addToast(res.message , "danger");
    } finally {
      setDepositLoading(false);
      setModalShow(false);
    }
  };

  const handleShowModal = (row) => {
    console.log(row);
    setSelectedRow(row);
    setModalShow(true);
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  return (
    <>
      {/* Summary Cards */}
      <CRow className="mb-4">
        {[
          { title: "Total Deposit User", value: totalDepositUser, icon: cilPeople, color: "success" },
          { title: "Total Deposit Money", value: `$${totalDeposits.toLocaleString()}`, icon: cilCash, color: "info" },
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
          <h5 className="mb-0">Deposit Management</h5>
          <CButton color="link" className="p-0" onClick={() => setFiltersCollapsed(!filtersCollapsed)}>
            <CIcon icon={filtersCollapsed ? cilFilter : cilFilterX} />
          </CButton>
        </CCardHeader>
        <CCardBody className={filtersCollapsed ? "d-none" : ""}>
          <FilterBar
            config={filterConfig}
            filters={filters}
            setFilters={setFilters}
            onSearch={fetchDeposits}
            onReset={() => { setFilters({}); fetchDeposits(); }}
            loading={depositLoading}
          />
        </CCardBody>
      </CCard>

      {/* Deposits Table */}
      <CCard>
        <CCardBody className="p-0">
          {error && <CAlert color="danger" className="m-3">{error}</CAlert>}
          {depositLoading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading deposits...</p>
            </div>
          ) : deposits.length === 0 ? (
            <div className="text-center py-5">
              <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
              <h5>No deposits found</h5>
            </div>
          ) : (
            <DataTable
              data={deposits}
              config={depositTableConfig}
              onShowModal={handleShowModal}
              setSelectedRow={handleShowModal}
            />
          )}
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
