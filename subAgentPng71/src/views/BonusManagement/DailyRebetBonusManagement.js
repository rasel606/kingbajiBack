import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCardHeader, CSpinner, CAlert, CButton } from "@coreui/react";
import DataTable from "../base/DataTable/DataTable";
import { rebateSettingsTableConfig } from "../base/tableConfig/rebateSettingsTableConfig";
import RebateEditModal from "../base/Modal/RebateEditModal";
import { adminServices } from "../../service/adminServices";

const DailyRebetBonusManagement = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminServices.getRebateSettings();
      console.log("response", response);
      setSettings(response || []);
    } catch (err) {
      setError("Failed to fetch rebate settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Are you sure you want to delete this setting?")) return;
    try {
      await adminServices.deleteRebateSetting(row._id);
      fetchSettings();
    } catch (err) {
      alert("Failed to delete setting");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
     <>
      <CCard className="mb-4">
        <CCardHeader>
          <h5 className="mb-0">Commission & Platform Fee Settings</h5>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner />
              <p>Loading...</p>
            </div>
          ) : (
            <DataTable
              data={settings}
              config={rebateSettingsTableConfig({
                onEdit: (row) => setSelectedRow(row),
              })}
            />
          )}
        </CCardBody>
      </CCard>

      {selectedRow && (
        <RebateEditModal
          show={!!selectedRow}
          data={selectedRow}
          onHide={() => setSelectedRow(null)}
          onSave={fetchSettings}
        />
      )}
    </>
  );
};

export default DailyRebetBonusManagement;