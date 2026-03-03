import React from 'react'
import { CCard, CCardBody, CListGroup, CListGroupItem } from '@coreui/react'

const mockActivity = [
  { user: 'Alice', action: 'Login', time: '2026-02-27 10:00' },
  { user: 'Bob', action: 'Update Profile', time: '2026-02-27 11:00' },
  { user: 'Charlie', action: 'Logout', time: '2026-02-27 12:00' },
]

const UserActivityWidget = () => (
  <CCard className="mb-4">
    <CCardBody>
      <h5>User Activity</h5>
      <CListGroup>
        {mockActivity.map((item, idx) => (
          <CListGroupItem key={idx}>
            <strong>{item.user}</strong>: {item.action}{' '}
            <span style={{ float: 'right' }}>{item.time}</span>
          </CListGroupItem>
        ))}
      </CListGroup>
    </CCardBody>
  </CCard>
)

export default UserActivityWidget
