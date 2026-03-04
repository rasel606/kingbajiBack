import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a to="/" target="_blank" rel="noopener noreferrer">
          KingBaji
        </a>
        <span className="ms-1">&copy; 2025 creativeLabs.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a to="/" target="_blank" rel="noopener noreferrer">
          KingBaji Admin
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
