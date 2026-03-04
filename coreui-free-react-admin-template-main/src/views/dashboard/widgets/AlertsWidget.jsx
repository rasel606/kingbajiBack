import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CAlert } from '@coreui/react'

const AlertsWidget = () => {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetch('/api/chat-gpt/analytics')
      .then((res) => res.json())
      .then((data) => {
        const newAlerts = []
        if (data.crmSyncs === 0) newAlerts.push('No CRM syncs detected!')
        if (data.sentimentScores.some((s) => s < -0.5))
          newAlerts.push('Negative sentiment detected in chat!')
        if (data.chatVolume > 100) newAlerts.push('High chat volume!')
        setAlerts(newAlerts)
      })
  }, [])

  if (!alerts.length) return null

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>Alerts</h5>
        {alerts.map((alert, idx) => (
          <CAlert color="danger" key={idx}>
            {alert}
          </CAlert>
        ))}
      </CCardBody>
    </CCard>
  )
}

export default AlertsWidget
