import React from 'react'
import { CCard, CCardBody, CAlert } from '@coreui/react'

const mockStatus = {
  api: 'Online',
  db: 'Online',
  server: 'Online',
  lastBackup: '2026-02-26 23:00',
}

const SystemHealthWidget = () => (
  <CCard className="mb-4">
    <CCardBody>
      <h5>System Health</h5>
      <CAlert color={mockStatus.api === 'Online' ? 'success' : 'danger'}>
        API: {mockStatus.api}
      </CAlert>
      <CAlert color={mockStatus.db === 'Online' ? 'success' : 'danger'}>
        Database: {mockStatus.db}
      </CAlert>
      <CAlert color={mockStatus.server === 'Online' ? 'success' : 'danger'}>
        Server: {mockStatus.server}
      </CAlert>
      <div>Last Backup: {mockStatus.lastBackup}</div>
    </CCardBody>
  </CCard>
)

export default SystemHealthWidget
