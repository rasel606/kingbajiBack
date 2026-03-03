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
  CFormInput,
  CFormSwitch,
  CBadge
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilSearch, cilPencil, cilTrash } from "@coreui/icons";
import DataTable from "../base/DataTable/DataTable";
import { gameManagementService } from "../../service/gameManagementService";
import CategoriesModal from "../base/Modal/CategoriesModal"; // Import the new modal
import CategoryEditModal from "../base/Modal/CategoryEditModal"; // Import the new modal

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await gameManagementService.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError("Failed to load categories.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setEditingCategoryId(category);
    console.log(category);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingCategoryId(null);
    setShowModal(true);
  };

  const handleCategoryUpdated = () => {
    fetchCategories(); // Refresh the list
  };



  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoryId(null);
  };


  const handleStatusUpdate = async (category) => {
    try {
      await gameManagementService.updateCategory(category._id, {
        id_active: !category.id_active
      });
      // You might want to show a toast here
      fetchCategories();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.category_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.g_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoriesTableConfig = [
    {
      key: "category_name",
      label: "Category Name",
      render: (val) => val || "-"
    },
    {
      key: "category_code",
      label: "Category Code",
      render: (val) => val || "-"
    },
    {
      key: "g_type",
      label: "Game Type",
      render: (val) => <CBadge color="info">{val || "-"}</CBadge>
    },
    {
      key: "providerCount",
      label: "Providers",
      render: (val) => <CBadge color="success">{val || 0}</CBadge>
    },
    {
      key: "image",
      label: "Image",
      render: (val) => val ? <img src={val} alt="category" width={50} height={50} /> : "-"
    },
    // {
    //   key: "id_active",
    //   label: "Status",
    //   render: (row) => (
    //     <CFormSwitch
    //       color="success"
    //       checked={row.id_active}
    //       onChange={() => handleStatusUpdate(row)}
    //     />
    //   )
    // },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="d-flex gap-2">
          <CButton size="sm" color="warning" onClick={() => handleEdit(row)}>
            <CIcon icon={cilPencil} />
          </CButton>
          <CButton size="sm" color="danger">
            <CIcon icon={cilTrash} />
          </CButton>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Header with Search and Add Button */}
      <CRow className="mb-4">
        <CCol md={6}>
          <div className="d-flex align-items-center">
            <CFormInput
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
            <CButton color="primary" className="ms-2">
              <CIcon icon={cilSearch} />
            </CButton>
          </div>
        </CCol>
        <CCol md={6} className="text-end">
          <CButton color="primary" onClick={handleAddNew}>
            <CIcon icon={cilPlus} className="me-2" />
            Add Category
          </CButton>
        </CCol>
      </CRow>

      {/* Categories Table */}
      <CCard>
        <CCardBody className="p-0">
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-5">
              <h5>No categories found</h5>
            </div>
          ) : (
            <DataTable
              data={filteredCategories}
              config={categoriesTableConfig}
              onStatusUpdate={handleEdit}
            />
          )}
        </CCardBody>
      </CCard>

      {/* Categories Modal */}
      <CategoriesModal
        show={showModal}
        onHide={() => setShowModal(false)}
        categoryId={editingCategoryId}
        onCategoryUpdated={handleCategoryUpdated}
      />

       <CategoryEditModal
        show={showModal}
        onHide={handleCloseModal}
        categoryId={editingCategoryId}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </>
  );
}