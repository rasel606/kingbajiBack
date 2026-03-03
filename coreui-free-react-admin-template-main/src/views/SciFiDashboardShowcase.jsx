import React, { useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CBadge,
  CProgress,
  CAlert,
  CForm,
  CFormLabel,
  CFormInput,
  CTable,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import '../scss/scifi-theme.css'

const SciFiDashboardShowcase = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="scifi-dashboard-showcase">
      <CContainer fluid className="p-4">
        {/* HEADER */}
        <CRow className="mb-5">
          <CCol>
            <h1 className="glow-text mb-3">⟨ SCI-FI DASHBOARD SYSTEM ⟩</h1>
            <p className="text-secondary">Advanced Futuristic Interface Design - Full CSS Theme</p>
          </CCol>
        </CRow>

        {/* INTRODUCTION */}
        <CRow className="mb-4">
          <CCol lg={12}>
            <CCard className="mb-4">
              <CCardHeader className="text-uppercase fw-bold">🔷 System Overview</CCardHeader>
              <CCardBody>
                <p className="mb-2">This comprehensive sci-fi dashboard theme includes:</p>
                <ul className="text-secondary">
                  <li>✦ Futuristic gradient backgrounds with cyber aesthetics</li>
                  <li>✦ Neon glowing effects on all interactive elements</li>
                  <li>✦ Smooth animations and holographic effects</li>
                  <li>✦ Responsive design for all screen sizes</li>
                  <li>✦ Customizable color palette with multiple accent colors</li>
                  <li>✦ Advanced visual effects (scan lines, glow pulses, cyber effects)</li>
                </ul>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* BUTTONS SHOWCASE */}
        <CRow className="mb-4">
          <CCol lg={12}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">🔶 Button Variations</CCardHeader>
              <CCardBody>
                <CRow className="g-3">
                  <CCol md={6} lg={3}>
                    <CButton color="primary" className="w-100 mb-2">
                      Primary Button
                    </CButton>
                    <CButton color="secondary" className="w-100 mb-2">
                      Secondary Button
                    </CButton>
                  </CCol>
                  <CCol md={6} lg={3}>
                    <CButton color="success" className="w-100 mb-2">
                      Success Button
                    </CButton>
                    <CButton color="warning" className="w-100 mb-2">
                      Warning Button
                    </CButton>
                  </CCol>
                  <CCol md={6} lg={3}>
                    <CButton color="danger" className="w-100 mb-2">
                      Danger Button
                    </CButton>
                    <CButton color="info" className="w-100 mb-2">
                      Info Button
                    </CButton>
                  </CCol>
                  <CCol md={6} lg={3}>
                    <div className="d-flex gap-2">
                      <CButton color="primary" size="sm">
                        Small
                      </CButton>
                      <CButton color="primary" size="lg">
                        Large
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* BADGES SHOWCASE */}
        <CRow className="mb-4">
          <CCol lg={12}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">◆ Badge Styles</CCardHeader>
              <CCardBody>
                <div className="d-flex flex-wrap gap-3">
                  <CBadge color="primary">Primary Badge</CBadge>
                  <CBadge color="secondary">Secondary Badge</CBadge>
                  <CBadge color="success">Active Status</CBadge>
                  <CBadge color="danger">Alert Warning</CBadge>
                  <CBadge color="warning">System Update</CBadge>
                  <CBadge color="info">Information</CBadge>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* ALERTS SHOWCASE */}
        <CRow className="mb-4">
          <CCol lg={12}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">⚠ Alert Messages</CCardHeader>
              <CCardBody>
                <CAlert color="primary" className="mb-3">
                  <strong>System Status:</strong> All systems operational. Network connection
                  stable.
                </CAlert>
                <CAlert color="success" className="mb-3">
                  <strong>Success:</strong> Data synchronized successfully across all nodes.
                </CAlert>
                <CAlert color="warning" className="mb-3">
                  <strong>Warning:</strong> Memory usage approaching critical threshold at 87%.
                </CAlert>
                <CAlert color="danger">
                  <strong>Error:</strong> Connection lost to backup server. Initiating failover
                  protocol.
                </CAlert>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* PROGRESS BARS */}
        <CRow className="mb-4">
          <CCol lg={6}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">📊 System Load</CCardHeader>
              <CCardBody>
                <p className="text-secondary mb-2">CPU Usage: 65%</p>
                <CProgress className="mb-4" value={65} />

                <p className="text-secondary mb-2">Memory Usage: 78%</p>
                <CProgress className="mb-4" value={78} />

                <p className="text-secondary mb-2">Network Load: 42%</p>
                <CProgress className="mb-0" value={42} />
              </CCardBody>
            </CCard>
          </CCol>

          <CCol lg={6}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">📈 Performance Metrics</CCardHeader>
              <CCardBody>
                <p className="text-secondary mb-2">Uptime: 99.8%</p>
                <CProgress className="mb-4" value={99.8} />

                <p className="text-secondary mb-2">Response Time: 45ms</p>
                <CProgress className="mb-4" value={45} />

                <p className="text-secondary mb-2">Data Integrity: 100%</p>
                <CProgress className="mb-0" value={100} />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* FORMS */}
        <CRow className="mb-4">
          <CCol lg={6}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">🔐 Authentication Panel</CCardHeader>
              <CCardBody>
                <CForm>
                  <div className="mb-3">
                    <CFormLabel htmlFor="email">Email Address</CFormLabel>
                    <CFormInput
                      id="email"
                      type="email"
                      name="email"
                      placeholder="admin@system.net"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="password">Security Password</CFormLabel>
                    <CFormInput
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <CButton color="primary" className="w-100">
                    Initialize Connection
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol lg={6}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">
                📋 Configuration Settings
              </CCardHeader>
              <CCardBody>
                <div className="mb-3">
                  <label className="form-check">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <span className="form-check-label">Enable Real-time Sync</span>
                  </label>
                </div>
                <div className="mb-3">
                  <label className="form-check">
                    <input className="form-check-input" type="checkbox" defaultChecked />
                    <span className="form-check-label">Auto-save Configuration</span>
                  </label>
                </div>
                <div className="mb-3">
                  <label className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <span className="form-check-label">Enable Debug Mode</span>
                  </label>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* DATA TABLE */}
        <CRow className="mb-4">
          <CCol lg={12}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">🖥 System Status Table</CCardHeader>
              <CCardBody className="table-responsive">
                <CTable striped>
                  <CTableHead>
                    <CTable.Row>
                      <CTableHeaderCell>System ID</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Load</CTableHeaderCell>
                      <CTableHeaderCell>Uptime</CTableHeaderCell>
                      <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTable.Row>
                  </CTableHead>
                  <CTableBody>
                    <CTable.Row>
                      <CTableDataCell>SERVER-01</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="success">ONLINE</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>45%</CTableDataCell>
                      <CTableDataCell>99.9%</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="primary" size="sm">
                          Monitor
                        </CButton>
                      </CTableDataCell>
                    </CTable.Row>
                    <CTable.Row>
                      <CTableDataCell>SERVER-02</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="success">ONLINE</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>62%</CTableDataCell>
                      <CTableDataCell>98.5%</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="primary" size="sm">
                          Monitor
                        </CButton>
                      </CTableDataCell>
                    </CTable.Row>
                    <CTable.Row>
                      <CTableDataCell>SERVER-03</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="warning">DEGRADED</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>87%</CTableDataCell>
                      <CTableDataCell>95.2%</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" size="sm">
                          Restore
                        </CButton>
                      </CTableDataCell>
                    </CTable.Row>
                    <CTable.Row>
                      <CTableDataCell>SERVER-04</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="danger">OFFLINE</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>0%</CTableDataCell>
                      <CTableDataCell>0%</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="danger" size="sm">
                          Reboot
                        </CButton>
                      </CTableDataCell>
                    </CTable.Row>
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* SPECIAL EFFECTS SHOWCASE */}
        <CRow className="mb-4">
          <CCol lg={6}>
            <CCard className="neon-border">
              <CCardHeader className="text-uppercase fw-bold">✨ Neon Border Effect</CCardHeader>
              <CCardBody>
                <p className="glow-text">
                  This card has an animated neon border with a glowing effect.
                </p>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol lg={6}>
            <CCard className="hologram">
              <CCardHeader className="text-uppercase fw-bold">🔷 Hologram Effect</CCardHeader>
              <CCardBody>
                <p className="text-secondary">
                  This card has a holographic floating animation effect.
                </p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* CYBERFRAME */}
        <CRow className="mb-5">
          <CCol lg={12}>
            <CCard className="cyberframe">
              <CCardHeader className="text-uppercase fw-bold">◈ Cyber Frame Border</CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <h5 className="text-cyan mb-3">Features Included:</h5>
                    <ul className="text-secondary ps-3">
                      <li>Full SCSS theme with variables</li>
                      <li>30+ animations and effects</li>
                      <li>Complete component styling</li>
                      <li>Glow and neon effects</li>
                      <li>Responsive design</li>
                      <li>Custom scrollbar styling</li>
                    </ul>
                  </CCol>
                  <CCol md={6}>
                    <h5 className="text-purple mb-3">Color Palette:</h5>
                    <div className="d-flex flex-wrap gap-2">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: '#00d4ff',
                          border: '2px solid rgba(0,212,255,0.5)',
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(0,212,255,0.6)',
                        }}
                        title="Cyan"
                      />
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: '#8b5cf6',
                          border: '2px solid rgba(139,92,246,0.5)',
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(139,92,246,0.6)',
                        }}
                        title="Purple"
                      />
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: '#10b981',
                          border: '2px solid rgba(16,185,129,0.5)',
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(16,185,129,0.6)',
                        }}
                        title="Green"
                      />
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: '#ec4899',
                          border: '2px solid rgba(236,72,153,0.5)',
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(236,72,153,0.6)',
                        }}
                        title="Pink"
                      />
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: '#ff6b35',
                          border: '2px solid rgba(255,107,53,0.5)',
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(255,107,53,0.6)',
                        }}
                        title="Orange"
                      />
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* IMPLEMENTATION GUIDE */}
        <CRow>
          <CCol lg={12}>
            <CCard>
              <CCardHeader className="text-uppercase fw-bold">📖 Implementation Guide</CCardHeader>
              <CCardBody>
                <h6 className="text-cyan mb-3">How to Use This Theme:</h6>
                <ol className="text-secondary ps-4">
                  <li className="mb-2">
                    <strong>Import the CSS:</strong> Import <code>scifi-theme.css</code> into your
                    main component
                  </li>
                  <li className="mb-2">
                    <strong>Apply to Components:</strong> Add class names like{' '}
                    <code>glow-text</code>, <code>neon-border</code>, <code>hologram</code>
                  </li>
                  <li className="mb-2">
                    <strong>Customize Colors:</strong> Modify CSS variables in <code>:root</code>{' '}
                    selector
                  </li>
                  <li className="mb-2">
                    <strong>Use Utility Classes:</strong> <code>.text-cyan</code>,{' '}
                    <code>.text-purple</code>, <code>.bg-dark-sci</code>
                  </li>
                  <li>
                    <strong>Responsive Design:</strong> Theme automatically adapts to mobile,
                    tablet, and desktop screens
                  </li>
                </ol>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* FOOTER */}
        <CRow className="mt-5 pt-4 border-top border-secondary">
          <CCol className="text-center">
            <p className="text-secondary mb-0">
              SCI-FI Dashboard Theme © 2024 | Full CSS Design System
            </p>
            <p className="text-secondary small mt-2">
              Ready to integrate into your existing React dashboard
            </p>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default SciFiDashboardShowcase
