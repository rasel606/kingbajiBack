import React from 'react'
import { CCard, CCardBody } from '@coreui/react'

const mockAnalytics = {
  chatVolume: 120,
  avgResponseTime: '3.2s',
  satisfaction: '92%',
  trendingTopics: ['bonus', 'withdrawal', 'support'],
}

const ChatAnalyticsWidget = () => (
  <CCard className="mb-4">
    <CCardBody>
      <h5>Chat Analytics</h5>
      <div>Chat Volume: {mockAnalytics.chatVolume}</div>
      <div>Avg Response Time: {mockAnalytics.avgResponseTime}</div>
      <div>Satisfaction: {mockAnalytics.satisfaction}</div>
      <div>Trending Topics: {mockAnalytics.trendingTopics.join(', ')}</div>
    </CCardBody>
  </CCard>
)

export default ChatAnalyticsWidget
