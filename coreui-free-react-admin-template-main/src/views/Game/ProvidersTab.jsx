// import React, { useState, useEffect } from "react";
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CRow,
//   CButton,
//   CSpinner,
//   CAlert,
//   CFormInput,
//   CFormSwitch,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CBadge
// } from "@coreui/react";
// import CIcon from "@coreui/icons-react";
// import { cilPlus, cilSearch, cilPencil, cilTrash } from "@coreui/icons";
// import DataTable from "../base/DataTable/DataTable";
// import { gameManagementService } from "../../service/gameManagementService";

// export default function ProvidersTab() {
//   const [providers, setProviders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [editingProvider, setEditingProvider] = useState(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     providercode: "",
//     company: "",
//     url: "",
//     login_url: "",
//     image_url: "",
//     type: "",
//     g_type: [],
//     id_active: true
//   });

//   const fetchProviders = async () => {
//     setLoading(true);
//     try {
//       const res = await gameManagementService.getProviders();
//       setProviders(res.data || []);
//     } catch (err) {
//       setError("Failed to load providers.");
//       toast.error("Failed to load providers.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProviders();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingProvider) {
//         await gameManagementService.updateProvider(editingProvider._id, formData);
//         toast.success("Provider updated successfully!");
//       } else {
//         await gameManagementService.createProvider(formData);
//         toast.success("Provider created successfully!");
//       }
//       setShowModal(false);
//       resetForm();
//       fetchProviders();
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to save provider");
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       providercode: "",
//       company: "",
//       url: "",
//       login_url: "",
//       image_url: "",
//       type: "",
//       g_type: [],
//       id_active: true
//     });
//     setEditingProvider(null);
//   };

//   const handleEdit = (provider) => {
//     setEditingProvider(provider);
//     setFormData({
//       name: provider.name,
//       providercode: provider.providercode,
//       company: provider.company,
//       url: provider.url,
//       login_url: provider.login_url,
//       image_url: provider.image_url,
//       type: provider.type,
//       g_type: Array.isArray(provider.g_type) ? provider.g_type : [],
//       id_active: provider.id_active
//     });
//     setShowModal(true);
//   };

//   const handleStatusUpdate = async (provider) => {
//     try {
//       await gameManagementService.updateProvider(provider._id, {
//         id_active: !provider.id_active
//       });
//       toast.success("Provider status updated!");
//       fetchProviders();
//     } catch (error) {
//       toast.error("Failed to update status.");
//     }
//   };

//   const filteredProviders = providers.filter(provider =>
//     provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     provider.providercode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     provider.company?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const providersTableConfig = [
//     {
//       key: "name",
//       label: "Provider Name",
//       render: (val) => val || "-"
//     },
//     {
//       key: "providercode",
//       label: "Provider Code",
//       render: (val) => <CBadge color="primary">{val || "-"}</CBadge>
//     },
//     {
//       key: "company",
//       label: "Company",
//       render: (val) => val || "-"
//     },
//     {
//       key: "type",
//       label: "Type",
//       render: (val) => <CBadge color="info">{val || "-"}</CBadge>
//     },
//     {
//       key: "g_type",
//       label: "Game Types",
//       render: (val) => (
//         <div>
//           {Array.isArray(val) && val.map((type, index) => (
//             <CBadge key={index} color="success" className="me-1 mb-1">
//               {type}
//             </CBadge>
//           ))}
//         </div>
//       )
//     },
//     {
//       key: "image_url",
//       label: "Logo",
//       type: "image",
//       round: false,
//       width: 40,
//       height: 40,
//       render: (val) => val ? <img src={val} alt="provider" width={40} height={40} /> : "-"
//     },
//     {
//       key: "id_active",
//       label: "Status",
//       render: (row) => (
//         <CFormSwitch
//           color="success"
//           checked={row.id_active}
//           onChange={() => handleStatusUpdate(row)}
//         />
//       )
//     },
//     {
//       key: "actions",
//       label: "Actions",
//       render: (row) => (
//         <div className="d-flex gap-2">
//           <CButton size="sm" color="warning" onClick={() => handleEdit(row)}>
//             <CIcon icon={cilPencil} />
//           </CButton>
//           <CButton size="sm" color="danger">
//             <CIcon icon={cilTrash} />
//           </CButton>
//         </div>
//       )
//     }
//   ];

//   return (
//     <>
//       {/* Header with Search and Add Button */}
//       <CRow className="mb-4">
//         <CCol md={6}>
//           <div className="d-flex align-items-center">
//             <CFormInput
//               placeholder="Search providers..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{ maxWidth: "300px" }}
//             />
//             <CButton color="primary" className="ms-2">
//               <CIcon icon={cilSearch} />
//             </CButton>
//           </div>
//         </CCol>
//         <CCol md={6} className="text-end">
//           <CButton color="primary" onClick={() => setShowModal(true)}>
//             <CIcon icon={cilPlus} className="me-2" />
//             Add Provider
//           </CButton>
//         </CCol>
//       </CRow>

//       {/* Providers Table */}
//       <CCard>
//         <CCardBody className="p-0">
//           {error && <CAlert color="danger">{error}</CAlert>}
//           {loading ? (
//             <div className="text-center py-5">
//               <CSpinner color="primary" />
//               <p>Loading providers...</p>
//             </div>
//           ) : filteredProviders.length === 0 ? (
//             <div className="text-center py-5">
//               <h5>No providers found</h5>
//             </div>
//           ) : (
//             <DataTable
//               data={filteredProviders}
//               config={providersTableConfig}
//             />
//           )}
//         </CCardBody>
//       </CCard>

//       {/* Add/Edit Modal */}
//       <CModal show={showModal} onClose={() => { setShowModal(false); resetForm(); }} size="lg">
//         <CModalHeader>
//           <CModalTitle>{editingProvider ? 'Edit Provider' : 'Add New Provider'}</CModalTitle>
//         </CModalHeader>
//         <form onSubmit={handleSubmit}>
//           <CModalBody>
//             <CRow className="g-3">
//               <CCol md={6}>
//                 <CFormInput
//                   label="Provider Name"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   required
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormInput
//                   label="Provider Code"
//                   value={formData.providercode}
//                   onChange={(e) => setFormData({ ...formData, providercode: e.target.value })}
//                   required
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormInput
//                   label="Company"
//                   value={formData.company}
//                   onChange={(e) => setFormData({ ...formData, company: e.target.value })}
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormInput
//                   label="Type"
//                   value={formData.type}
//                   onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormInput
//                   label="URL"
//                   value={formData.url}
//                   onChange={(e) => setFormData({ ...formData, url: e.target.value })}
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormInput
//                   label="Login URL"
//                   value={formData.login_url}
//                   onChange={(e) => setFormData({ ...formData, login_url: e.target.value })}
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormInput
//                   label="Image URL"
//                   value={formData.image_url}
//                   onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
//                 />
//               </CCol>
//               <CCol md={6}>
//                 <CFormInput
//                   label="Game Types (comma separated)"
//                   value={formData.g_type.join(', ')}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     g_type: e.target.value.split(',').map(item => item.trim()).filter(item => item)
//                   })}
//                   placeholder="type1, type2, type3"
//                 />
//               </CCol>
//               <CCol md={12}>
//                 <CFormSwitch
//                   label="Active"
//                   checked={formData.id_active}
//                   onChange={(e) => setFormData({ ...formData, id_active: e.target.checked })}
//                 />
//               </CCol>
//             </CRow>
//           </CModalBody>
//           <CModalFooter>
//             <CButton color="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
//               Cancel
//             </CButton>
//             <CButton color="primary" type="submit">
//               {editingProvider ? 'Update' : 'Create'} Provider
//             </CButton>
//           </CModalFooter>
//         </form>
//       </CModal>
//     </>
//   );
// }

import React, { useState, useEffect } from 'react'
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
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilSearch, cilPencil, cilTrash } from '@coreui/icons'
import DataTable from '../base/DataTable/DataTable'
import { gameManagementService } from '../../service/gameManagementService'
import ProvidersModal from '../base/Modal/ProvidersModal' // Import the new modal"; // Import the new modal

export default function ProvidersTab() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [modalMode, setModalMode] = useState('create') // "create" or "edit"

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const res = await gameManagementService.getProviders()
      setProviders(res.data || [])
      console.log(res.data)
    } catch (err) {
      setError('Failed to load providers.')
      console.error('Failed to load providers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [])

  const handleCreateProvider = () => {
    setModalMode('create')
    setEditingProvider(null)
    setShowModal(true)
  }

  const handleEditProvider = (provider) => {
    setModalMode('edit')
    setEditingProvider(provider)
    setShowModal(true)
  }

  const handleProviderUpdated = () => {
    fetchProviders() // Refresh the list
  }

  const handleStatusUpdate = async (provider) => {
    try {
      await gameManagementService.updateProvider(provider._id, {
        id_active: !provider.id_active,
      })
      // You might want to add toast notification here
      console.log('Provider status updated!')
      fetchProviders()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.providercode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.company?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const providersTableConfig = [
    {
      key: 'name',
      label: 'Provider Name',
      render: (val) => val || '-',
    },
    {
      key: 'providercode',
      label: 'Provider Code',
      render: (val) => <CBadge color="primary">{val || '-'}</CBadge>,
    },
    {
      key: 'company',
      label: 'Company',
      render: (val) => val || '-',
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <CBadge color="info">{val || '-'}</CBadge>,
    },
    {
      key: 'g_type',
      label: 'Game Types',
      render: (val) => (
        <div>
          {Array.isArray(val) &&
            val.map((type, index) => (
              <CBadge key={index} color="success" className="me-1 mb-1">
                {type}
              </CBadge>
            ))}
        </div>
      ),
    },
    {
      key: 'image_url',
      label: 'Logo',
      render: (val) =>
        val ? (
          <img src={val} alt="provider" width={40} height={40} style={{ objectFit: 'contain' }} />
        ) : (
          '-'
        ),
    },
    {
      key: 'id_active',
      label: 'Status',
      render: (row) => (
        <CFormSwitch
          color="success"
          checked={row.id_active}
          onChange={() => handleStatusUpdate(row)}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="d-flex gap-2">
          <CButton size="sm" color="warning" onClick={() => handleEditProvider(row)}>
            <CIcon icon={cilPencil} />
          </CButton>
          <CButton size="sm" color="danger">
            <CIcon icon={cilTrash} />
          </CButton>
        </div>
      ),
    },
  ]

  return (
    <>
      {/* Header with Search and Add Button */}
      <CRow className="mb-4">
        <CCol md={6}>
          <div className="d-flex align-items-center">
            <CFormInput
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <CButton color="primary" className="ms-2">
              <CIcon icon={cilSearch} />
            </CButton>
          </div>
        </CCol>
        <CCol md={6} className="text-end">
          <CButton color="primary" onClick={handleCreateProvider}>
            <CIcon icon={cilPlus} className="me-2" />
            Add Provider
          </CButton>
        </CCol>
      </CRow>

      {/* Providers Table */}
      <CCard>
        <CCardBody className="p-0">
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-5">
              <h5>No providers found</h5>
            </div>
          ) : (
            <DataTable data={filteredProviders} config={providersTableConfig} />
          )}
        </CCardBody>
      </CCard>

      {/* Providers Modal */}
      <ProvidersModal
        show={showModal}
        onHide={() => setShowModal(false)}
        provider={editingProvider}
        mode={modalMode}
        onProviderUpdated={handleProviderUpdated}
      />
    </>
  )
}
