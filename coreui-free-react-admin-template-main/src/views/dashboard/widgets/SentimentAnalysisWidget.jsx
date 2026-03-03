import React, { useState } from 'react'
import { CCard, CCardBody, CAlert, CButton, CFormInput } from '@coreui/react'

const SentimentAnalysisWidget = () => {
  const [text, setText] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [sentiment, setSentiment] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    setError(null)
    try {
      const res = await fetch('/api/chat-gpt/sentiment/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, apiKey }),
      })
      const data = await res.json()
      setSentiment(data)
    } catch {
      setError('Sentiment analysis failed')
    }
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>Google Cloud Sentiment Analysis</h5>
        <CFormInput
          placeholder="Text to analyze"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <CFormInput
          placeholder="Google API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-2"
        />
        <CButton color="primary" className="mt-2" onClick={handleAnalyze}>
          Analyze
        </CButton>
        {error && (
          <CAlert color="danger" className="mt-2">
            {error}
          </CAlert>
        )}
        {sentiment && (
          <pre style={{ background: '#f8f9fa', padding: '1em' }}>
            {JSON.stringify(sentiment, null, 2)}
          </pre>
        )}
      </CCardBody>
    </CCard>
  )
}

export default SentimentAnalysisWidget
