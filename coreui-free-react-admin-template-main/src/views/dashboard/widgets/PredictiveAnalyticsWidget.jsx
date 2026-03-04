import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CAlert } from '@coreui/react'
import { Line } from 'react-chartjs-2'

const PredictiveAnalyticsWidget = () => {
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    fetch('/api/chat-gpt/analytics')
      .then((res) => res.json())
      .then((data) => {
        // Simple prediction: next chat volume = avg + 10%
        const avgVolume = data.chatVolume
        const predictedVolume = Math.round(avgVolume * 1.1)
        // Simple sentiment trend: avg sentiment
        const avgSentiment = data.sentimentScores.length
          ? data.sentimentScores.reduce((a, b) => a + b, 0) / data.sentimentScores.length
          : 0
        setPrediction({ predictedVolume, avgSentiment })
      })
  }, [])

  if (!prediction) return <CAlert color="info">Loading predictions...</CAlert>

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>Predictive Analytics</h5>
        <div>Predicted Next Chat Volume: {prediction.predictedVolume}</div>
        <div>Average Sentiment Score: {prediction.avgSentiment.toFixed(2)}</div>
      </CCardBody>
    </CCard>
  )
}

export default PredictiveAnalyticsWidget
