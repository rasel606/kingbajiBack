import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CFormInput,
  CButton,
  CAlert,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

const mockFaq = [
  { q: 'How do I register?', a: 'Click the register button and fill out the form.' },
  { q: 'How to claim bonuses?', a: 'Go to the bonus section and follow instructions.' },
  { q: 'How to contact support?', a: 'Use the chat or email support@site.com.' },
]

const UserOnboardingBotWidget = () => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const handleAsk = () => {
    const found = mockFaq.find((f) => question.toLowerCase().includes(f.q.toLowerCase()))
    setAnswer(found ? found.a : 'Sorry, I do not know the answer.')
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>User Onboarding Bot</h5>
        <CFormInput
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <CButton color="primary" className="mt-2" onClick={handleAsk}>
          Ask
        </CButton>
        {answer && (
          <CAlert color="info" className="mt-2">
            {answer}
          </CAlert>
        )}
        <div className="mt-3">
          <h6>FAQ</h6>
          <CListGroup>
            {mockFaq.map((item, idx) => (
              <CListGroupItem key={idx}>
                <strong>Q:</strong> {item.q}
                <br />
                <strong>A:</strong> {item.a}
              </CListGroupItem>
            ))}
          </CListGroup>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default UserOnboardingBotWidget
