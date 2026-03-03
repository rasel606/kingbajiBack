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
import { cilUser, cilPeople, cilFilter, cilFilterX } from "@coreui/icons";

import FilterBar from "../base/filtersView/FilterBar";
import DataTable from "../base/DataTable/DataTable";
import DetailModal from "../base/Modal/DetailModal";
import ChangePasswordModal from "../base/Modal/ChangePasswordModal";
import ChangeEmailModal from "../base/Modal/ChangeEmailModal";
import { subAdminTableConfig } from "../base/tableConfig/subAdminTableConfig";
import { subAdminServices } from "../../service/subAdminServices";

const SubAdminManagement = () => {
  const [filters, setFilters] = useState({ userId: "", email: "", phone: "" });
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);

  const [selectedRow, setSelectedRow] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const fetchSubAdmins = async () => {
    setLoading(true);
    try {
      const response = await subAdminServices.SubAdminList(filters);
      console.log("response subadmins", response);
      setSubAdmins(response || []);
    } catch (err) {
      setError("Failed to load sub-admins.");
      console.log("error",err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (subAdminId, status) => {
    console.log("Updating sub-admin:", { subAdminId, status });
    await new Promise((res) => setTimeout(res, 500));
    fetchSubAdmins();
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  return (
    <>
      {/* Top Info Card */}
      <CRow className="mb-4">
        <CCol xs={12} sm={6} xl={3}>
          <CCard className="bg-primary text-white mb-3">
            <CCardBody className="d-flex justify-content-between align-items-start pb-0">
              <div>
                <div className="text-value-lg">{subAdmins.length}</div>
                <div>Total Sub-Admins</div>
              </div>
              <CIcon width={24} icon={cilPeople} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Sub-Admin Management</h5>
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
              { key: "subAdminId", label: "SubAdmin ID", type: "text" },
              { key: "email", label: "Email", type: "text" },
              { key: "phone", label: "Phone", type: "text" },
            ]}
            filters={filters}
            setFilters={setFilters}
            onSearch={fetchSubAdmins}
            onReset={() => {
              setFilters({ subAdminId: "", email: "", phone: "" });
              fetchSubAdmins();
            }}
            loading={loading}
          />
        </CCardBody>
      </CCard>

      {/* Data Table */}
      <CCard>
        <CCardBody className="p-0">
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading sub-admins...</p>
            </div>
          ) : subAdmins.length === 0 ? (
            <div className="text-center py-5">
              <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
              <h5>No sub-admins found</h5>
            </div>
          ) : (
            <DataTable
              data={subAdmins}
              config={subAdminTableConfig({
                onView: (row) => setSelectedRow(row),
                onChangePassword: (row) => {
                  setSelectedRow(row);
                  setShowPasswordModal(true);
                },
                onChangeEmail: (row) => {
                  setSelectedRow(row);
                  setShowEmailModal(true);
                },
              })}
            />
          )}
        </CCardBody>
      </CCard>

      {/* Modals */}
      {selectedRow && (
        <>
          <DetailModal
            show={!!selectedRow}
            title="Sub-Admin Details"
            data={selectedRow}
            fields={[
              { key: "subAdminId", label: "SubAdmin ID" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "role", label: "Role" },
              { key: "status", label: "Status" },
            ]}
            onHide={() => setSelectedRow(null)}
            onStatusUpdate={handleStatusUpdate}
          />

          <ChangePasswordModal
            show={showPasswordModal}
            userId={selectedRow.subAdminId}
            onHide={() => setShowPasswordModal(false)}
            onPasswordChanged={fetchSubAdmins}
          />

          <ChangeEmailModal
            show={showEmailModal}
            userId={selectedRow.subAdminId}
            onHide={() => setShowEmailModal(false)}
            onEmailChanged={fetchSubAdmins}
          />
        </>
      )}
    </>
  );
};

export default SubAdminManagement;
