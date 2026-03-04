import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CSpinner, CAlert, CButton } from '@coreui/react'
import DataTable from '../base/DataTable/DataTable'
import { affiliateaSettingsTableConfig } from '../base/tableConfig/affiliateaSettingsTableConfig'
import CommissionEditModal from '../base/Modal/CommissionEditModal'
import { adminServices } from '../../service/adminServices'

const AffiliateCommissionSettings = () => {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await adminServices.AffiliateGetCommissionSettings()
      setSettings(response || [])
    } catch (err) {
      console.error('Failed to load settings', err)
      setError('Failed to load commission settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Commission & Platform Fee Settings</h5>
          <CButton
            color="primary"
            onClick={() => {
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
              <CSpinner />
              <p>Loading...</p>
            </div>
          ) : (
            <DataTable
              data={settings}
              config={affiliateaSettingsTableConfig({
                onEdit: (row) => setSelectedRow(row),
              })}
            />
          )}
        </CCardBody>
      </CCard>

      {showModal && (
        <CommissionEditModal
          show={!!showModal}
          // data={selectedRow}
          onHide={() => setShowModal(null)}
          onSave={fetchSettings}
        />
      )}
    </>
  )
}

export default AffiliateCommissionSettings
