import React, { useEffect, useMemo, useState } from "react";
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from "@coreui/react";
import { gameManagementService } from "../../../service/gameManagementService";

const getInitialForm = () => ({
  name: "",
  providercode: "",
  company: "",
  url: "",
  login_url: "",
  image_url: "",
  type: "",
  g_type: "",
  id_active: true,
});

const ProvidersModal = ({
  show,
  onHide,
  provider = null,
  mode = "create",
  onProviderUpdated,
}) => {
  const [formData, setFormData] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);

  const isEditMode = mode === "edit" && provider?._id;

  useEffect(() => {
    if (!show) return;

    if (provider) {
      setFormData({
        name: provider.name || "",
        providercode: provider.providercode || "",
        company: provider.company || "",
        url: provider.url || "",
        login_url: provider.login_url || "",
        image_url: provider.image_url || "",
        type: provider.type || "",
        g_type: Array.isArray(provider.g_type) ? provider.g_type.join(", ") : "",
        id_active: Boolean(provider.id_active),
      });
      return;
    }

    setFormData(getInitialForm());
  }, [show, provider]);

  const title = useMemo(() => (isEditMode ? "Edit Provider" : "Add Provider"), [isEditMode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (saving) return;
    onHide?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        g_type: formData.g_type
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (isEditMode) {
        await gameManagementService.updateProvider(provider._id, payload);
      } else {
        await gameManagementService.createProvider(payload);
      }

      onProviderUpdated?.();
      onHide?.();
    } catch (error) {
      // Keep existing UX behavior (console logs in this area)
      console.error("Failed to save provider:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CModal visible={show} onClose={handleClose} size="lg">
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormInput
                label="Provider Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Provider Code"
                value={formData.providercode}
                onChange={(e) => handleChange("providercode", e.target.value)}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Type"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="URL"
                value={formData.url}
                onChange={(e) => handleChange("url", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Login URL"
                value={formData.login_url}
                onChange={(e) => handleChange("login_url", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Image URL"
                value={formData.image_url}
                onChange={(e) => handleChange("image_url", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Game Types (comma separated)"
                value={formData.g_type}
                onChange={(e) => handleChange("g_type", e.target.value)}
                placeholder="slot, sports, live"
              />
            </CCol>
            <CCol md={12}>
              <CFormSwitch
                label="Active"
                checked={formData.id_active}
                onChange={(e) => handleChange("id_active", e.target.checked)}
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </CButton>
          <CButton color="primary" type="submit" disabled={saving}>
            {saving ? <CSpinner size="sm" /> : isEditMode ? "Update" : "Create"}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
};

export default ProvidersModal;
