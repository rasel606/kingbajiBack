import React, { useEffect, useMemo, useState } from "react";
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
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
  category_name: "",
  category_code: "",
  g_type: "",
  image: "",
  providerCount: 0,
  id_active: true,
});

const CategoriesModal = ({ show, onHide, category = null, onCategoryUpdated }) => {
  const [formData, setFormData] = useState(getInitialForm());
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(category?._id);

  useEffect(() => {
    if (!show) return;

    if (category) {
      setFormData({
        category_name: category.category_name || "",
        category_code: category.category_code || "",
        g_type: category.g_type || "",
        image: category.image || "",
        providerCount: Number(category.providerCount || 0),
        id_active: typeof category.id_active === "boolean" ? category.id_active : true,
      });
      return;
    }

    setFormData(getInitialForm());
  }, [show, category]);

  const title = useMemo(() => (isEditMode ? "Edit Category" : "Add Category"), [isEditMode]);

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
        providerCount: Number(formData.providerCount || 0),
      };

      if (isEditMode) {
        await gameManagementService.updateCategory(category._id, payload);
      } else {
        await gameManagementService.createCategory(payload);
      }

      onCategoryUpdated?.();
      onHide?.();
    } catch (error) {
      console.error("Failed to save category:", error);
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
                label="Category Name"
                value={formData.category_name}
                onChange={(e) => handleChange("category_name", e.target.value)}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Category Code"
                value={formData.category_code}
                onChange={(e) => handleChange("category_code", e.target.value)}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Game Type"
                value={formData.g_type}
                onChange={(e) => handleChange("g_type", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Provider Count"
                type="number"
                min="0"
                value={formData.providerCount}
                onChange={(e) => handleChange("providerCount", e.target.value)}
              />
            </CCol>
            <CCol md={12}>
              <CFormInput
                label="Image URL"
                value={formData.image}
                onChange={(e) => handleChange("image", e.target.value)}
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

export default CategoriesModal;
