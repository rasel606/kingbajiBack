import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CButton,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

const API_URL = '/api/chat-gpt'

const ChatBotWidgetGPT = ({ userId, sender = 'admin' }) => {
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/history/${userId}`)
      .then((res) => res.json())
      .then(setHistory)
  }, [userId])

  const sendMessage = async () => {
    setLoading(true)
    await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sender, message }),
    })
    setMessage('')
    // Refresh history
    fetch(`${API_URL}/history/${userId}`)
      .then((res) => res.json())
      .then(setHistory)
      .finally(() => setLoading(false))
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>AI Chat Bot (GPT)</h5>
        <CListGroup className="mb-3">
          {history.map((msg, idx) => (
            <CListGroupItem key={idx} color={msg.sender === 'bot' ? 'info' : 'secondary'}>
              <strong>{msg.sender}:</strong> {msg.message}{' '}
              <span style={{ float: 'right' }}>{msg.time}</span>
            </CListGroupItem>
          ))}
        </CListGroup>
        <CForm
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <CFormInput
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
          <CButton color="primary" className="mt-2" type="submit" disabled={loading}>
            Send
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default ChatBotWidgetGPT
