
import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
  CAlert,
  CBadge,
  CInputGroup,
  CFormCheck
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
  cilSearch,
  cilFilter,
  cilFilterX,
  cilCalendar
} from '@coreui/icons'

const SummaryCards = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <div className="mb-4">
      <CRow>
        {data.map((stat, index) => (
          <CCol xs={12} sm={6} xl={2} key={index}>
            <CCard className={`bg-${stat.color} text-white mb-3`}>
              <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-value-lg">{stat.value}</div>
                  <div>{stat.title}</div>
                </div>
                <CIcon width={24} icon={stat.icon} />
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </div>
  )
}

export default SummaryCards