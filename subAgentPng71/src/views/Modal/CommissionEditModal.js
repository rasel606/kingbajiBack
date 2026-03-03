import React, { useState } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CFormInput,
} from "@coreui/react";
import { adminServices } from "../../../service/adminServices";

const CommissionEditModal = ({ show, data, onHide, onSave }) => {
  const [commissionRate, setCommissionRate] = useState(data.settings?.commissionRate || 0);
  const [platformFee, setPlatformFee] = useState(data.settings?.platformFee || 0);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await adminServices.updateCommissionSettings({
        affiliateId: data._id,
        commissionRate,
        platformFee,
      });
      onSave();
      onHide();
    } catch (err) {
      console.error("Failed to update commission settings", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CModal visible={show} onClose={onHide}>
      <CModalHeader>Update Commission Settings</CModalHeader>
      <CModalBody>
        <CFormInput
          type="number"
          label="Commission Rate (%)"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
        />
        <CFormInput
          type="number"
          label="Platform Fee (%)"
          value={platformFee}
          onChange={(e) => setPlatformFee(e.target.value)}
          className="mt-3"
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onHide}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default CommissionEditModal;
