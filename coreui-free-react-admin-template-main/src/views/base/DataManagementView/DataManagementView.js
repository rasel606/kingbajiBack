import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilFilter, cilCalendar, cilCheckCircle, cilXCircle } from '@coreui/icons'
import Filters from '../filtersView/Filters'
import SummaryCards from '../summarys/SummaryCards '
// import { CCard, CCardBody, CCol, CRow } from "@coreui/react"

import DataTable from '../DataTable/DataTable'

const DataManagementView = ({
  // Configuration
  title = 'Data Management',
  filterConfig = [],
  tableColumns = [],
  detailFields = [],
  statusOptions = [],
  statusConfig = {},

  // Data
  summaryData = [],
  tableData = [],
  totalValue = 0,

  // State
  loading = false,
  dataLoading = false,
  error = null,

  // Handlers
  onFilterChange = () => {},
  onSearch = () => {},
  onResetFilters = () => {},
  onStatusUpdate = () => {},
  onRowAction = () => {},

  // Customization
  actionIcon = cilSearch,
  actionLabel = 'View',
  emptyMessage = 'No data found',
  emptySubMessage = 'Try adjusting your filters',
}) => {
  const [filters, setFilters] = useState({})

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {}
    filterConfig.forEach((filter) => {
      resetFilters[filter.key] = ''
    })
    setFilters(resetFilters)
    onResetFilters()
  }

  return (
    <>
      <h2 className="mb-4">{title}</h2>

      {/* Summary Cards */}
      {summaryData.length > 0 && <SummaryCards data={summaryData} loading={loading} />}

      {/* Filter Panel */}
      {filterConfig.length > 0 && (
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={onSearch}
          onReset={handleResetFilters}
          loading={dataLoading}
          filterConfig={filterConfig}
        />
      )}

      {/* Total Summary */}
      {totalValue !== null && (
        <CCard className="mb-4">
          <CCardBody className="py-3">
            <CRow className="align-items-center">
              <CCol md={6}>
                <h5 className="mb-0">Total Summary</h5>
              </CCol>
              <CCol md={6} className="text-md-end">
                <h4 className="mb-0 text-primary">
                  Total:{' '}
                  {typeof totalValue === 'number' ? `$${totalValue.toLocaleString()}` : totalValue}
                </h4>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* Data Table */}
      <CCard>
        <CCardBody className="p-0">
          <DataTable
            data={tableData}
            columns={tableColumns}
            onRowAction={onRowAction}
            onStatusUpdate={onStatusUpdate}
            loading={dataLoading}
            error={error}
            actionIcon={actionIcon}
            actionLabel={actionLabel}
            emptyMessage={emptyMessage}
            emptySubMessage={emptySubMessage}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default DataManagementView
