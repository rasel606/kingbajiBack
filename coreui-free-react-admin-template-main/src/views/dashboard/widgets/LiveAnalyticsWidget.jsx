import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CAlert } from '@coreui/react'
import { Line } from 'react-chartjs-2'

const LiveAnalyticsWidget = () => {
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    fetch('/api/chat-gpt/analytics')
      .then((res) => res.json())
      .then(setAnalytics)
  }, [])

  if (!analytics) return <CAlert color="info">Loading analytics...</CAlert>

  const sentimentData = {
    labels: analytics.sentimentScores.map((_, i) => i + 1),
    datasets: [{ label: 'Sentiment Score', data: analytics.sentimentScores }],
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>Live Analytics</h5>
        <div>CRM Syncs: {analytics.crmSyncs}</div>
        <div>Chat Volume: {analytics.chatVolume}</div>
        <div className="mt-3">
          <Line data={sentimentData} />
        </div>
      </CCardBody>
    </CCard>
  )
}

export default LiveAnalyticsWidget
