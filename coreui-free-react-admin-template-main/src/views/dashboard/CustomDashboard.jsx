import React, { useState } from 'react'
import { CCard, CCardBody, CForm, CFormSelect, CButton, CAlert } from '@coreui/react'
import { Line, Bar, Pie } from 'react-chartjs-2'
import UserActivityWidget from './widgets/UserActivityWidget'
import SystemHealthWidget from './widgets/SystemHealthWidget'
import FinancialSummaryWidget from './widgets/FinancialSummaryWidget'
import QuickActionsWidget from './widgets/QuickActionsWidget'
import NotificationsWidget from './widgets/NotificationsWidget'
import ChatBotWidget from './widgets/ChatBotWidget'
import ChatBotWidgetGPT from './widgets/ChatBotWidgetGPT'
import MultiProviderChatSelector from './widgets/MultiProviderChatSelector'
import ChatHistoryExport from './widgets/ChatHistoryExport'
import ChatAnalyticsWidget from './widgets/ChatAnalyticsWidget'
import CRMIntegrationWidget from './widgets/CRMIntegrationWidget'
import SentimentAnalysisWidget from './widgets/SentimentAnalysisWidget'
import UserOnboardingBotWidget from './widgets/UserOnboardingBotWidget'
import AdvancedAnalyticsWidget from './widgets/AdvancedAnalyticsWidget'
import LiveAnalyticsWidget from './widgets/LiveAnalyticsWidget'
import PredictiveAnalyticsWidget from './widgets/PredictiveAnalyticsWidget'

const chartOptions = [
  { label: 'Line Chart', value: 'line' },
  { label: 'Bar Chart', value: 'bar' },
  { label: 'Pie Chart', value: 'pie' },
]

const mockChartData = {
  line: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Users', data: [10, 20, 30] }] },
  bar: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Transactions', data: [5, 15, 25] }] },
  pie: { labels: ['Active', 'Inactive'], datasets: [{ data: [60, 40] }] },
}

const CustomDashboard = () => {
  const [selectedChart, setSelectedChart] = useState('line')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Replace with backend save logic
    setSaved(true)
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Custom Dashboard Builder</h2>
        <CForm
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <CFormSelect
            label="Chart Type"
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            options={chartOptions}
          />
          <CButton color="primary" type="submit" className="mt-2">
            Save Dashboard
          </CButton>
        </CForm>
        {selectedChart === 'line' && <Line data={mockChartData.line} />}
        {selectedChart === 'bar' && <Bar data={mockChartData.bar} />}
        {selectedChart === 'pie' && <Pie data={mockChartData.pie} />}
        {saved && (
          <CAlert color="success" className="mt-2">
            Dashboard saved!
          </CAlert>
        )}
        <div className="mt-4">
          <UserActivityWidget />
          <SystemHealthWidget />
          <FinancialSummaryWidget />
          <QuickActionsWidget />
          <NotificationsWidget />
          <ChatBotWidget sender="admin" />
          <ChatBotWidgetGPT userId="admin-demo" sender="admin" />
          <MultiProviderChatSelector
            onProviderChange={(provider) => {
              /* handle provider switch */
            }}
          />
          <ChatHistoryExport history={[]} />
          <ChatAnalyticsWidget />
          <CRMIntegrationWidget />
          <SentimentAnalysisWidget />
          <UserOnboardingBotWidget />
          <AdvancedAnalyticsWidget />
          <LiveAnalyticsWidget />
          <PredictiveAnalyticsWidget />
        </div>
      </CCardBody>
    </CCard>
  )
}

export default CustomDashboard
