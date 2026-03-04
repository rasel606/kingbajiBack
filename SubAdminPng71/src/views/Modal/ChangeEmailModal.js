import React, { useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CSpinner,
} from "@coreui/react";
import { adminServices } from "../../../service/adminServices";
import { useToast } from "../../../context/ToastContext";
const ChangeEmailModal = ({ show, onHide, userId, onEmailChanged }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast,refresh, setRefresh } = useToast();
  useEffect(() => {
    if (show && userId) {
      fetchUserDetails();
    }
  }, [show, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await adminServices.getUserById(userId);
      setEmail(response.email || "");
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async () => {
    setSaving(true);
    try {
      await adminServices.updateUserProfileById(userId, { email });
       onEmailChanged(); // ✅ Refresh parent
      addToast("Email changed successfully!", "success");
      setRefresh(true)
      onHide();
    } catch (err) {
      console.error("Failed to update email:", err);
      addToast("Failed to update email.", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CModal visible={show} onClose={onHide}>
      <CModalHeader closeButton>
        <CModalTitle>Change Email</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {loading ? (
          <div className="text-center py-3">
            <CSpinner color="primary" />
            <p>Loading user email...</p>
          </div>
        ) : (
          <CFormInput
            type="email"
            placeholder="New email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}
      </CModalBody>
      <CModalFooter>
        <CButton
          color="success"
          onClick={handleChange}
          disabled={saving || loading || !email}
        >
          {saving ? <CSpinner size="sm" /> : "Change Email"}
        </CButton>
        <CButton color="secondary" onClick={onHide}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ChangeEmailModal;
