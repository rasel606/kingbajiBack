import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilGamepad, cilList, cilLayers } from '@coreui/icons'

import CategoriesTab from './CategoriesTab'
import ProviderManagement from './ProvidersTab'
import GameListManagement from './GamesTab'

const GameCategoryManagement = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0">Game Category Management</h5>
            </CCardHeader>
            <CCardBody>
              {/* Tabs Navigation */}
              <CNav variant="tabs">
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'categories'}
                    onClick={() => setActiveTab('categories')}
                  >
                    <CIcon icon={cilLayers} className="me-2" />
                    Categories
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'providers'}
                    onClick={() => setActiveTab('providers')}
                  >
                    <CIcon icon={cilList} className="me-2" />
                    Providers
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 'games'} onClick={() => setActiveTab('games')}>
                    <CIcon icon={cilGamepad} className="me-2" />
                    Game List
                  </CNavLink>
                </CNavItem>
              </CNav>

              {/* Tab Content */}
              <CTabContent className="mt-3">
                <CTabPane visible={activeTab === 'categories'}>
                  <CategoriesTab />
                </CTabPane>
                <CTabPane visible={activeTab === 'providers'}>
                  <ProviderManagement />
                </CTabPane>
                <CTabPane visible={activeTab === 'games'}>
                  <GameListManagement />
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default GameCategoryManagement
