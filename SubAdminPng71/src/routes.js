import React from 'react';


const DailyRebetBonusManagement =React.lazy(() => import('./views/BonusManagement/DailyRebetBonusManagement'))
const WeekLossesBonusManagement =React.lazy(() => import('./views/BonusManagement/WeekLossesBonusManagement'))


const UserManagementPage = React.lazy(() => import('./views/base/UserManagement/UserManagementPage'));
const SubAgentUserManagement = React.lazy(() => import('./views/SubAgent/SubAgentUserManagement'));
const SubAgentDepositFullView = React.lazy(() => import('./views/SubAgent/SubAgentDepositFullView'));
const SubAgentWidthrawalView = React.lazy(() => import('./views/SubAgent/SubAgentWidthrawalView'));
const ReportTransactions = React.lazy(() => import('./views/SubAgent/ReportTransactions'));
const SubAgentUserList = React.lazy(() => import('./views/SubAgent/SubAgentUserList'));

const AgentManagement = React.lazy(() => import('./views/AgentManagement/AgentManagement'));
const AgentDepositFullView = React.lazy(() => import('./views/AgentManagement/AgentDepositFullView'));
const AgentWidthrawalView = React.lazy(() => import('./views/AgentManagement/AgentWidthrawalView'));
const AgentReportTransactions = React.lazy(() => import('./views/AgentManagement/ReportTransactions'));
const AgentUserList = React.lazy(() => import('./views/AgentManagement/AgentUserList'));



/////////////////////////////AgentManagement/////////////////////////////// 
const AffiliateManagement = React.lazy(() => import('./views/Affiliate/AffiliateUserManagement'));
const AffiliateDepositFullView = React.lazy(() => import('./views/Affiliate/AffiliateDepositFullView'));
const AffiliateWidthrawalView = React.lazy(() => import('./views/Affiliate/AffiliateWidthrawalView'));
const AffiliateReportTransactions = React.lazy(() => import('./views/Affiliate/ReportTransactions'));
const AffiliateUserList = React.lazy(() => import('./views/Affiliate/AffiliateUserList'));





const PaymentGateway = React.lazy(() => import( './views/paymentGateway/PaymentGatewaysFullView'))
const PaymentGatewayWidthral = React.lazy(() => import( './views/paymentGateway/PaymenWidthralFullView'))



const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))
const DepositFullView = React.lazy(() => import('./views/depositView/DepositFullView'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))
const  WidthrawalView = React.lazy(() => import('./views/widthrawalView/WidthrawalView'))
// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/Deposit', name: 'Deposit', element: DepositFullView },
  { path: '/widthrow', name: 'widthrow', element: WidthrawalView },
  { path: '/deposit/getway', name: 'PaymentGateway', element: PaymentGateway },
  { path: '/widthraw/getway', name: 'PaymentGatewayWidthrow', element: PaymentGatewayWidthral },
//////////////////////////////super//////////////////////////////////////////
  { path: '/userReport', name: 'userReport', element: UserManagementPage },
  { path: '/agent/agentUserList', name: 'AgentList', element: AgentUserList },
  { path: '/agent/agentList', name: 'AgentList', element:  AgentManagement},
  { path: '/agent/agentUserDeposit', name: 'AgentList', element:  AgentDepositFullView},
  { path: '/agent/agentUserWithdraw', name: 'AgentList', element:  AgentWidthrawalView}, 
  { path: '/agent/trangsactonReport', name: 'AgentList', element:  AgentDepositFullView},
  
  //////////////////////////////sub//////////////////////////////////////////

  { path: '/subagent/agentUserList', name: 'AgentList', element: SubAgentUserList },
  { path: '/subagent/agentList', name: 'AgentList', element:  SubAgentUserManagement},
  { path: '/subagent/agentUserDeposit', name: 'AgentList', element:  SubAgentDepositFullView},
  { path: '/subagent/agentUserWithdraw', name: 'AgentList', element:  SubAgentWidthrawalView}, 
  { path: '/subagent/trangsactonReport', name: 'AgentList', element:  ReportTransactions}, 



  //////////////////////////////Affiliate//////////////////////////////////////////

  { path: '/affiliate/affiliateList', name: 'AgentList', element: AffiliateManagement },
  { path: '/affiliate/affiliateUserList', name: 'AgentList', element:  AffiliateUserList},
  { path: '/affiliate/affiliateWithdraw', name: 'AgentList', element:  AffiliateReportTransactions},
  { path: '/affiliate/affiliateUserDeposit', name: 'AgentList', element:  AffiliateWidthrawalView}, 
  { path: '/affiliate/affiliateUserWithdraw', name: 'AgentList', element:  AffiliateWidthrawalView}, 








  { path: '/dailyRebate', name: 'DailyRebate', element: DailyRebetBonusManagement },
  { path: '/weeklyLosses', name: 'DailyRebate', element: WeekLossesBonusManagement },











]

export default routes
