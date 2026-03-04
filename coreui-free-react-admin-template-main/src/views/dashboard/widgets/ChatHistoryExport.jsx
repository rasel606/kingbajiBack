import React from 'react'
import { CCard, CCardBody, CButton, CAlert } from '@coreui/react'

const ChatHistoryExport = ({ history }) => {
  const [exported, setExported] = React.useState(false)

  const handleExport = () => {
    const csv = [
      ['Sender', 'Message', 'Time'],
      ...history.map((msg) => [msg.sender, msg.message, msg.time]),
    ]
      .map((row) => row.join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chat_history.csv'
    a.click()
    setExported(true)
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h5>Chat History Export</h5>
        <CButton color="primary" onClick={handleExport}>
          Export Chat as CSV
        </CButton>
        {exported && (
          <CAlert color="success" className="mt-2">
            Chat exported!
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ChatHistoryExport
