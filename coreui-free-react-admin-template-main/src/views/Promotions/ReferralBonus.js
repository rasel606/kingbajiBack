import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody, CSpinner, CAlert, CButton } from '@coreui/react'
import DataTable from '../base/DataTable/DataTable'
import { referralBonusTableConfig } from '../base/tableConfig/referralBonusTableConfig'
import { adminServices } from '../../service/adminServices'
import { usePagination } from '../../hooks/usePagination'
// import UserFormModal from "../base/modals/UserFormModal";

const ReferredUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    getPaginationParams,
  } = usePagination(1, 10)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminServices.getUsersByReferral(getPaginationParams())
      setUsers(res.data.enrichedUsers || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load referral users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, itemsPerPage])

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Referral Users</h5>
          <CButton
            color="primary"
            onClick={() => {
              setSelectedUser(null)
              setShowModal(true)
            }}
          >
            + Add User
          </CButton>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading users...</p>
            </div>
          ) : (
            <>
              <DataTable
                data={users}
                config={referralBonusTableConfig({
                  onEdit: (user) => {
                    setSelectedUser(user)
                    setShowModal(true)
                  },
                })}
              />

              {/* Pagination Controls */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <CButton
                    color="secondary"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </CButton>
                  <span className="mx-2">Page {currentPage}</span>
                  <CButton color="secondary" onClick={() => handlePageChange(currentPage + 1)}>
                    Next
                  </CButton>
                </div>
                <div>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      {showModal && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null)
            setShowModal(false)
            fetchUsers()
          }}
        />
      )}
    </>
  )
}

export default ReferredUsers
