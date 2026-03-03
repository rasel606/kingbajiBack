import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CSpinner, CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilFilter, cilFilterX, cilUser } from '@coreui/icons'

import FilterBar from '../base/filtersView/FilterBar'
import DataTable from '../base/DataTable/DataTable'

import UserTransModal from '../Modal/UserTransModal'
import { userTableConfig } from '../base/tableConfig/userTableConfig'

import { SubAdminServices } from '../../service/SubAdminServices'
import ChangePasswordModal from '../base/Modal/ChangePasswordModal'
import ChangeEmailModal from '../base/Modal/ChangeEmailModal'
import TransferModal from '../base/Modal/TransferModal'
import UserDetailsModal from '../base/Modal/UserDetailsModal'
import { useToast } from '../../context/ToastContext'

const SubAgentUserManagement = () => {
   const [filters, setFilters] = useState({ userId: '', email: '', phone: '' })
   const [users, setUsers] = useState([])
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const [filtersCollapsed, setFiltersCollapsed] = useState(true)
   const { addToast,refresh, setRefresh } = useToast();
   const [userData, setUserData] = useState({
     name: '',
     email: '',
     phone: '',
     birthday: '',
     country: '',
     isVerified: { email: false, phone: false },
   })
 
   const [selectedRow, setSelectedRow] = useState(null)
     const [showUserModal, setShowUserModal] = useState(false)
   const [showTransModal, setShowTransModal] = useState(false)
   const [showPasswordModal, setShowPasswordModal] = useState(false)
   const [showEmailModal, setShowEmailModal] = useState(false)
   const [showTransferModal, setShowTransferModal] = useState(false)
   const fetchUsers = async () => {
     setLoading(true)
     try {
       const response = await SubAdminServices.GetAffiliateList(filters)
       console.log('response user user management', response)
       setUsers(response.data || [])
     } catch (err) {
       setError('Failed to load users.')
     } finally {
       setLoading(false)
     }
   }
   // const fetchUserDetails = async (userId) => {
   //     setLoading(true);
   //     try {
   //       const response = await adminServices.getUserById(userId);
   //       console.log("response", response);
   //       setUserData({
   //         name: response.name || "",
   //         email: response.email || "",
   //         phone: response.phone?.[0]?.number || "",
   //         birthday: response.birthday ? response.birthday.split("T")[0] : "",
   //         country: response.country || "",
   //         isVerified: response.isVerified || { email: false, phone: false },
   //       });
   //     } catch (err) {
   //       console.error(err);
   //     } finally {
   //       setLoading(false);
   //     }
   //   };
 
 
     const apiCalls = {
     // User Details Modal APIs
     getUserById: SubAdminServices.getAgentUserById,
     updateUserProfileById: SubAdminServices.updateUserProfileById,
     verifyEmailForUser: SubAdminServices.verifyEmailForUser,
     verifyPhoneForUser: SubAdminServices.verifyPhoneForUser,
     
     // Add other API calls for other modals if needed
     // getTransactions: adminServices.getUserTransactions,
     // changePassword: adminServices.changePassword,
     // etc...
   }
 
   const handleStatusUpdate = async (userId, status) => {
     console.log('Updating user:', { userId, status })
     // simulate server call
     await new Promise((res) => setTimeout(res, 500))
     fetchUsers()
   }
 
   useEffect(() => {
     fetchUsers()
   }, [])
 

  return (
    <>
      {/* Top Info Card */}
      <CRow className="mb-4">
        <CCol xs={12} sm={6} xl={3}>
          <CCard className="bg-info text-white mb-3">
            <CCardBody className="d-flex justify-content-between align-items-start pb-0">
              <div>
                <div className="text-value-lg">{users.length}</div>
                <div>Total Users</div>
              </div>
              <CIcon width={24} icon={cilPeople} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">User Management</h5>
          <CButton
            color="link"
            className="p-0"
            onClick={() => setFiltersCollapsed(!filtersCollapsed)}
          >
            <CIcon icon={filtersCollapsed ? cilFilter : cilFilterX} />
          </CButton>
        </CCardHeader>
        <CCardBody className={filtersCollapsed ? 'd-none' : ''}>
          <FilterBar
            config={[
              { key: 'userId', label: 'User ID', type: 'text' },
              { key: 'email', label: 'Email', type: 'text' },
              { key: 'phone', label: 'Phone', type: 'text' },
            ]}
            filters={filters}
            setFilters={setFilters}
            onSearch={fetchUsers}
            onReset={() => {
              setFilters({ userId: '', email: '', phone: '' })
              fetchUsers()
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
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <CIcon icon={cilUser} width={48} className="text-muted mb-3" />
              <h5>No users found</h5>
            </div>
          ) : (
            <DataTable
              data={users}
              config={userTableConfig({
                onView: (row) => {
                  setSelectedRow(row)
                  setShowUserModal(true) // ✅ Show modal
                },
                onTransactions: (row) => {
                  setSelectedRow(row)
                  setShowTransModal(true)
                },
                onChangePassword: (row) => {
                  setSelectedRow(row)
                  setShowPasswordModal(true)
                },
                onChangeEmail: (row) => {
                  setSelectedRow(row)
                  setShowEmailModal(true)
                },
                onChangeTransfer: (row) => {
                  setSelectedRow(row)
                  setShowTransferModal(true)
                },
              })}
            />
          )}
        </CCardBody>
      </CCard>

      {/* Modals */}
      {selectedRow && (
        <>
          {/* <DetailModal
            show={!!selectedRow}
            title="User Details"
            data={selectedRow}
            fields={[
              { key: "userId", label: "User ID" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "status", label: "Status" },
            ]}
            onHide={() => setSelectedRow(null)}
            onStatusUpdate={handleStatusUpdate}
          /> */}

          <UserDetailsModal
            show={showUserModal}
            userId={selectedRow.userId} // ✅ Pass string
            onHide={() => setShowUserModal(false)}
            onUserUpdated={fetchUsers}
            apiCalls={apiCalls}
            
          />

          <UserTransModal
            show={showTransModal}
            userId={selectedRow.userId}
            onHide={() => setShowTransModal(false)}
            onUserUpdated={fetchUsers}
            
            
          />

          <ChangePasswordModal
            show={showPasswordModal}
            userId={selectedRow.userId}
            onHide={() => setShowPasswordModal(false)}
            onPasswordChanged={fetchUsers}
            fetchUsers={fetchUsers}
            apiCalls={apiCalls}
            
            
          />

          <ChangeEmailModal
            show={showEmailModal}
            userId={selectedRow.userId}
            onHide={() => setShowEmailModal(false)}
            onEmailChanged={fetchUsers}
            onUserUpdated={fetchUsers}
            apiCalls={apiCalls}
            
          />

          <TransferModal
            show={showTransferModal}
            userId={selectedRow.userId}
            onHide={() => setShowTransferModal(false)}
            onTransferChanged={fetchUsers}
            onUserUpdated={fetchUsers}
            apiCalls={apiCalls}
            
            
          />
        </>
      )}
    </>
  )
}

export default SubAgentUserManagement
