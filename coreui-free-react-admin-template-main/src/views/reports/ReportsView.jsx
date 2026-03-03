import React, { useEffect, useState } from 'react'
import { getReports } from '../../service/api'
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

const ReportsView = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getReports()
      .then((data) => {
        setReports(data)
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
        <h2>Reports & Analytics</h2>
        {loading && <CSpinner color="primary" />}
        {error && <CAlert color="danger">Error: {error}</CAlert>}
        {Array.isArray(reports) && reports.length > 0 ? (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                {Object.keys(reports[0]).map((key) => (
                  <CTableHeaderCell key={key}>{key}</CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {reports.map((report, idx) => (
                <CTableRow key={idx}>
                  {Object.values(report).map((val, i) => (
                    <CTableHeaderCell key={i}>{val}</CTableHeaderCell>
                  ))}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        ) : (
          !loading && <p>No reports found.</p>
        )}
      </CCardBody>
    </CCard>
  )
}

export default withAdminAccess(ReportsView)
