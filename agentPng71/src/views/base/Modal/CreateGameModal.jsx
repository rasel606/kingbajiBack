import React, { useMemo, useState } from "react";
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
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

const initialForm = {
  gameName_enus: "",
  category_name: "",
  provider: "",
  g_code: "",
  p_code: "",
  imgFileName: "",
  is_active: true,
  is_hot: false,
  isFeatured: false,
};

const CreateGameModal = ({ show, onHide, categories = [], providers = [], onCreateSuccess }) => {
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const providerOptions = useMemo(() => providers || [], [providers]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (saving) return;
    setFormData(initialForm);
    onHide?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      await gameManagementService.createGame(formData);
      onCreateSuccess?.();
      setFormData(initialForm);
      onHide?.();
    } catch (error) {
      console.error("Failed to create game:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CModal visible={show} onClose={handleClose} size="lg">
      <CModalHeader>
        <CModalTitle>Create Game</CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormInput
                label="Game Name"
                value={formData.gameName_enus}
                onChange={(e) => handleChange("gameName_enus", e.target.value)}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Game Code"
                value={formData.g_code}
                onChange={(e) => handleChange("g_code", e.target.value)}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label="Category"
                value={formData.category_name}
                onChange={(e) => handleChange("category_name", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id || category.category_code} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label="Provider"
                value={formData.provider}
                onChange={(e) => {
                  const value = e.target.value;
                  const selectedProvider = providerOptions.find((provider) => provider.providercode === value || provider.name === value);
                  handleChange("provider", value);
                  handleChange("p_code", selectedProvider?.providercode || "");
                }}
              >
                <option value="">Select Provider</option>
                {providerOptions.map((provider) => (
                  <option key={provider._id || provider.providercode} value={provider.providercode || provider.name}>
                    {provider.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={12}>
              <CFormInput
                label="Image URL"
                value={formData.imgFileName}
                onChange={(e) => handleChange("imgFileName", e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormSwitch
                label="Active"
                checked={formData.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
              />
            </CCol>
            <CCol md={4}>
              <CFormSwitch
                label="Hot"
                checked={formData.is_hot}
                onChange={(e) => handleChange("is_hot", e.target.checked)}
              />
            </CCol>
            <CCol md={4}>
              <CFormSwitch
                label="Featured"
                checked={formData.isFeatured}
                onChange={(e) => handleChange("isFeatured", e.target.checked)}
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </CButton>
          <CButton color="primary" type="submit" disabled={saving}>
            {saving ? <CSpinner size="sm" /> : "Create"}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
};

export default CreateGameModal;
