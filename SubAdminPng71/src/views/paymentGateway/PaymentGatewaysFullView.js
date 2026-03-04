


import React, { useState, useEffect } from "react";
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CSpinner, CAlert
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPeople, cilFilter, cilFilterX, cilUser } from "@coreui/icons";

import FilterBar from "../base/filtersView/FilterBar";
import DataTable from "../base/DataTable/DataTable";

import { paymentGatewayTableConfig } from "../base/tableConfig/paymentGatewayTableConfig";

import { getWayService } from "../../service/getWayService";
import { useAuth } from "../../context/AuthContext";


const PaymentGatewaysFullView = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ gateway_name: "", payment_type: "" });
  const [gateways, setGateways] = useState([]);
  const [gatewayCount, setGatewayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(null);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await getWayService.TransactionsDepositGetways(filters);
      console.log(" transactions res", res);
      setGateways(res.data || []);
      setGatewayCount(res?.count || 0);
    } catch (err) {
      setError("Failed to load gateways.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (gateway) => {
    try {
      await getWayService.updateDepositGatewayStatus({
        gateway_name: gateway.gateway_name,
        is_active: !gateway.is_active,
        email: user?.email,
        referralCode: user?.referralCode,
      });

      setGateways((prev) =>
        prev.map((g) =>
          g.gateway_name === gateway.gateway_name ? { ...g, is_active: !g.is_active } : g
        )
      );
      toast.success("Gateway status updated!");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleGatewayNumberUpdate = async (gatewayName, newNumber) => {
    try {
      await getWayService.updateDepositGatewayNumber({
        gateway_name: gatewayName,
        gateway_number: newNumber,
        email: user?.email,
        referralCode: user?.referralCode,
      });

      setGateways((prev) =>
        prev.map((g) =>
          g.gateway_name === gatewayName ? { ...g, gateway_number: newNumber } : g
        )
      );
      toast.success("Gateway number updated!");
    } catch {
      toast.error("Failed to update number.");
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  return (
    <>
      {/* Summary Card */}
      <CRow className="mb-4">
        <CCol xs={12} sm={6} xl={3}>
          <CCard className="bg-info text-white mb-3">
            <CCardBody className="d-flex justify-content-between align-items-start pb-0">
              <div>
                <div className="text-value-lg">{gatewayCount}</div>
                <div>Total Gateways</div>
              </div>
              <CIcon width={24} icon={cilPeople} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filter Card */}
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Payment Gateway Management</h5>
          <CButton
            color="link"
            className="p-0"
            onClick={() => setFiltersCollapsed(!filtersCollapsed)}
          >
            <CIcon icon={filtersCollapsed ? cilFilter : cilFilterX} />
          </CButton>
        </CCardHeader>
        <CCardBody className={filtersCollapsed ? "d-none" : ""}>
          <FilterBar
            config={[
              { key: "gateway_name", label: "Gateway Name", type: "text" },
              { key: "payment_type", label: "Payment Type", type: "select", options: ["Send Money", "Cashout", "Payment"] },
            ]}
            filters={filters}
            setFilters={setFilters}
            onSearch={fetchGateways}
            onReset={() => {
              setFilters({ gateway_name: "", payment_type: "" });
              fetchGateways();
            }}
            loading={loading}
          />
        </CCardBody>
      </CCard>

      {/* Table */}
      <CCard>
        <CCardBody className="p-0">
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading gateways...</p>
            </div>
          ) : gateways.length === 0 ? (
            <div className="text-center py-5">
              <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
              <h5>No gateways found</h5>
            </div>
          ) : (
            <DataTable
              data={gateways}
              config={paymentGatewayTableConfig({
                onStatusUpdate: handleStatusUpdate,
                onEdit: setSelectedGateway,
                onGatewayNumberUpdate: handleGatewayNumberUpdate,
              })}
            />
          )}
          {selectedGateway && (
            <GatewayEditModal
              show={!!selectedGateway}
              onHide={() => setSelectedGateway(null)}
              data={selectedGateway}
              onGatewayNumberUpdate={handleGatewayNumberUpdate} // save edited number
            />
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default PaymentGatewaysFullView;
