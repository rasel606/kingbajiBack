import React, { useEffect, useState } from 'react'
import { getRoles } from '../../service/api'
import { withAdminAccess } from '../../context/AuthContext'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CSpinner,
  CAlert,
} from '@coreui/react'

const RoleManagementView = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getRoles()
      .then((data) => {
        setRoles(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Role & Permission Management</h2>
        {loading && <CSpinner color="primary" />}
        {error && <CAlert color="danger">Error: {error}</CAlert>}
        {Array.isArray(roles) && roles.length > 0 ? (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                {Object.keys(roles[0]).map((key) => (
                  <CTableHeaderCell key={key}>{key}</CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {roles.map((role, idx) => (
                <CTableRow key={idx}>
                  {Object.values(role).map((val, i) => (
                    <CTableHeaderCell key={i}>{val}</CTableHeaderCell>
                  ))}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        ) : (
          !loading && <p>No roles found.</p>
        )}
      </CCardBody>
    </CCard>
  )
}

export default withAdminAccess(RoleManagementView)
