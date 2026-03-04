import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { getRoles } from '../../service/api'

const mockPermissions = [
  'View Users',
  'Edit Users',
  'Delete Users',
  'View Reports',
  'Manage Agents',
  'Manage Bonuses',
  'Access Settings',
]

const PermissionEditor = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getRoles()
      .then((data) => {
        setRoles(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handlePermissionToggle = (roleIdx, permIdx) => {
    // Implement backend update here
    setRoles((prev) =>
      prev.map((role, idx) => {
        if (idx !== roleIdx) return role
        const perms = role.permissions || []
        const perm = mockPermissions[permIdx]
        const hasPerm = perms.includes(perm)
        return {
          ...role,
          permissions: hasPerm ? perms.filter((p) => p !== perm) : [...perms, perm],
        }
      }),
    )
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Role-Based Permission Editor</h2>
        {loading && <CSpinner color="primary" />}
        {error && <CAlert color="danger">Error: {error}</CAlert>}
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Role</CTableHeaderCell>
              {mockPermissions.map((perm, idx) => (
                <CTableHeaderCell key={idx}>{perm}</CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {roles.map((role, roleIdx) => (
              <CTableRow key={roleIdx}>
                <CTableHeaderCell>{role.name}</CTableHeaderCell>
                {mockPermissions.map((perm, permIdx) => (
                  <CTableHeaderCell key={permIdx}>
                    <CButton
                      color={
                        role.permissions && role.permissions.includes(perm)
                          ? 'success'
                          : 'secondary'
                      }
                      size="sm"
                      onClick={() => handlePermissionToggle(roleIdx, permIdx)}
                    >
                      {role.permissions && role.permissions.includes(perm) ? '✓' : ''}
                    </CButton>
                  </CTableHeaderCell>
                ))}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default PermissionEditor
