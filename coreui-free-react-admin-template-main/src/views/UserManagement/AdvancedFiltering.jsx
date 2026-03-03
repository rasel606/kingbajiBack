import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CFormInput,
  CFormSelect,
  CButton,
} from '@coreui/react'

const mockData = [
  { id: 1, name: 'Alice', role: 'admin', status: 'active' },
  { id: 2, name: 'Bob', role: 'agent', status: 'inactive' },
  { id: 3, name: 'Charlie', role: 'user', status: 'active' },
]

const AdvancedFiltering = () => {
  const [filter, setFilter] = useState({ name: '', role: '', status: '' })
  const [filtered, setFiltered] = useState(mockData)

  const handleFilter = () => {
    setFiltered(
      mockData.filter(
        (u) =>
          (!filter.name || u.name.toLowerCase().includes(filter.name.toLowerCase())) &&
          (!filter.role || u.role === filter.role) &&
          (!filter.status || u.status === filter.status),
      ),
    )
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Advanced Filtering</h2>
        <div className="mb-3">
          <CFormInput
            placeholder="Name"
            value={filter.name}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
          />
          <CFormSelect
            className="mt-2"
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            options={[
              { label: 'All Roles', value: '' },
              { label: 'Admin', value: 'admin' },
              { label: 'Agent', value: 'agent' },
              { label: 'User', value: 'user' },
            ]}
          />
          <CFormSelect
            className="mt-2"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            options={[
              { label: 'All Status', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
          <CButton color="primary" className="mt-2" onClick={handleFilter}>
            Apply Filter
          </CButton>
        </div>
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Role</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filtered.map((u) => (
              <CTableRow key={u.id}>
                <CTableHeaderCell>{u.id}</CTableHeaderCell>
                <CTableHeaderCell>{u.name}</CTableHeaderCell>
                <CTableHeaderCell>{u.role}</CTableHeaderCell>
                <CTableHeaderCell>{u.status}</CTableHeaderCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default AdvancedFiltering
