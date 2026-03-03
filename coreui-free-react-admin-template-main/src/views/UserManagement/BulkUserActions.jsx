import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CButton,
  CAlert,
  CFormCheck,
} from '@coreui/react'
import { getUserProfile } from '../../service/api'

const BulkUserActions = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice', selected: false },
    { id: 2, name: 'Bob', selected: false },
    { id: 3, name: 'Charlie', selected: false },
  ]) // Replace with API call
  const [actionResult, setActionResult] = useState(null)

  const handleSelect = (idx) => {
    setUsers(users.map((u, i) => (i === idx ? { ...u, selected: !u.selected } : u)))
  }

  const handleBulkDelete = () => {
    const selectedIds = users.filter((u) => u.selected).map((u) => u.id)
    // Replace with actual API call
    setActionResult(`Deleted users: ${selectedIds.join(', ')}`)
    setUsers(users.filter((u) => !u.selected))
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Bulk User Actions</h2>
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Select</CTableHeaderCell>
              <CTableHeaderCell>User ID</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users.map((user, idx) => (
              <CTableRow key={user.id}>
                <CTableHeaderCell>
                  <CFormCheck checked={user.selected} onChange={() => handleSelect(idx)} />
                </CTableHeaderCell>
                <CTableHeaderCell>{user.id}</CTableHeaderCell>
                <CTableHeaderCell>{user.name}</CTableHeaderCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <CButton color="danger" className="mt-3" onClick={handleBulkDelete}>
          Delete Selected
        </CButton>
        {actionResult && (
          <CAlert color="info" className="mt-2">
            {actionResult}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default BulkUserActions
