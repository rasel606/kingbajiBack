import React, { useEffect, useState } from "react";
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormInput,
    CButton,
    CSpinner,
} from "@coreui/react";
import { adminServices } from "../../../service/adminServices";
import { useToast } from "../../../context/ToastContext";

const SocialLinksModal = ({ show, onClose, onSave, link }) => {
       const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
    const { addToast } = useToast();
    const [form, setForm] = useState({
        telegram: "" || link?.telegram,
        twitter: "" || link?.twitter,
        facebook: "" || link?.facebook,
        email: "" || link?.email,
     
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (link) setForm({ ...link });
    }, [link]);


  // Fetch existing social links
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await adminServices.getSocialLinks();
      setLinks(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching links", err);
      addToast("Failed to load social links", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) fetchLinks();
  }, [show]);

  // Handle input change for modal form
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle input change for inline edit
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Create or update social link
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await adminServices.updateAndCreateSocialLinks(form);
      addToast("Social links saved successfully", "success");
      setForm({ telegram: "", facebook: "", email: "", referredBy: "" });
      fetchLinks();
      onClose();
    } catch (err) {
      console.error("Error saving social links", err);
      addToast("Failed to save social links", "danger");
    } finally {
      setSaving(false);
    }
  };

  // Inline edit save
  const handleSaveInline = async () => {
    if (!editingRow) return;
    try {
      await adminServices.updateAndCreateSocialLinks(editForm);
      addToast("Social link updated", "success");
      setEditingRow(null);
      fetchLinks();
    } catch (error) {
      console.error("Failed to update link", error);
      addToast("Failed to update social link", "danger");
    }
  };


    return (
        <CModal visible={show} onClose={onClose} size="lg">
            <CModalHeader>
                <CModalTitle>{link ? "Edit Social Links" : "Add Social Links"}</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm onSubmit={handleSubmit}>
                    <CFormInput
                        className="mb-3"
                        label="Telegram Link"
                        placeholder="https://t.me/yourusername"
                        value={form.telegram || ""}
                        onChange={(e) => handleChange("telegram", e.target.value)}
                    />
                    <CFormInput
                        className="mb-3"
                        label="Facebook Messenger Link"
                        placeholder="https://m.me/yourusername"
                        value={form.facebook || ""}
                        onChange={(e) => handleChange("facebook", e.target.value)}
                    />
                    <CFormInput
                        className="mb-3"
                        type="email"
                        label="Email"
                        placeholder="example@email.com"
                        value={form.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                   
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={onClose}>
                    Cancel
                </CButton>
                <CButton color="primary" onClick={handleSubmit} disabled={saving}>
                    {saving ? <CSpinner size="sm" /> : "Save"}
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

export default SocialLinksModal;
