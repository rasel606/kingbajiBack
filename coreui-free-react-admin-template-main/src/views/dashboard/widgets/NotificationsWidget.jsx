import React from 'react'
import { CCard, CCardBody, CListGroup, CListGroupItem } from '@coreui/react'

const mockNotifications = [
  { id: 1, message: 'New user registered', time: '2026-02-27 09:00', unread: true },
  { id: 2, message: 'System backup completed', time: '2026-02-27 08:00', unread: false },
  { id: 3, message: 'Payment gateway error', time: '2026-02-27 07:30', unread: true },
]

const NotificationItem = ({ message, time, unread }) => (
  <CListGroupItem
    role="listitem"
    aria-live={unread ? 'polite' : undefined}
    color={unread ? 'warning' : 'secondary'}
    className="notification-item"
  >
    {message}
    <span className="notification-time">{time}</span>
  </CListGroupItem>
)

const NotificationsWidget = () => (
  <CCard className="mb-4">
    <CCardBody>
      <h5>Notifications</h5>
      <CListGroup role="list" aria-live="polite" aria-label="Notifications list">
        {mockNotifications.map((notif) => (
          <NotificationItem key={notif.id} {...notif} />
        ))}
      </CListGroup>
    </CCardBody>
  </CCard>
)

// Add some basic CSS for notification time alignment
const style = document.createElement('style')
style.innerHTML = `
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.notification-time {
  font-size: 0.9em;
  color: #888;
}
`
document.head.appendChild(style)

export default NotificationsWidget
