import React from 'react'
const PaymenWidthralFullView = React.lazy(
  () => import('./views/paymentGateway/PaymenWidthralFullView'),
)
const LiveChat = React.lazy(() => import('./views/liveChat/LiveChat'))
const ReferralBonus = React.lazy(() => import('./views/Promotions/ReferralBonus'))
const AffiliateCommissionSettings = React.lazy(
  () => import('./views/AffiliateManagement/AffiliateCommissionSettings'),
)
const BonusManagement = React.lazy(() => import('./views/Promotions/BonusManagement'))

const DailyRebetBonusManagement = React.lazy(
  () => import('./views/BonusManagement/DailyRebetBonusManagement'),
)
const WeekLossesBonusManagement = React.lazy(
  () => import('./views/BonusManagement/WeekLossesBonusManagement'),
)

const SubAdminAffiliateManagement = React.lazy(
  () => import('./views/subAdmin/SubAdminAffiliateManagement'),
)
const SubAminUserList = React.lazy(() => import('./views/subAdmin/SubAminUserList'))
const SubAdminwidthrow = React.lazy(() => import('./views/subAdmin/SubAdminwidthrow'))
const TransactionReport = React.lazy(() => import('./views/widthrawalView/TransactionReport'))
const SubAdminDeposit = React.lazy(() => import('./views/subAdmin/SubAdminDeposit'))
const AnnouncementsList = React.lazy(() => import('./views/announcements/AnnouncementsList'))

const AgentManagement = React.lazy(() => import('./views/AgentManagement/AgentManagement'))
const AgentDeposit = React.lazy(() => import('./views/AgentManagement/AgentDeposit'))
const Agentwidthrow = React.lazy(() => import('./views/AgentManagement/Agentwidthrow'))
const AgentUserList = React.lazy(() => import('./views/AgentManagement/AgentUserList'))
const AffiliateManagement = React.lazy(
  () => import('./views/AffiliateManagement/AffiliateManagement'),
)

const SubAdminManagement = React.lazy(() => import('./views/subAdmin/SubAdminManagement'))
const UserManagementPage = React.lazy(() => import('./views/UserManagement/UserManagementPage'))
const PaymentGateway = React.lazy(() => import('./views/paymentGateway/PaymentGatewaysFullView'))

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const CustomDashboard = React.lazy(() => import('./views/dashboard/CustomDashboard'))
const AdvancedDashboard = React.lazy(() => import('./views/dashboard/AdvancedDashboard'))
const UnifiedDynamicDashboard = React.lazy(
  () => import('./views/dashboard/UnifiedDynamicDashboard'),
)
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
const WidthrawalView = React.lazy(() => import('./views/widthrawalView/WidthrawalView'))
const AdminImpersonation = React.lazy(() => import('./views/UserManagement/AdminImpersonation'))
const BulkUserActions = React.lazy(() => import('./views/UserManagement/BulkUserActions'))
const AdvancedFiltering = React.lazy(() => import('./views/UserManagement/AdvancedFiltering'))
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
const GamesManagement = React.lazy(() => import('./views/Game/GameManagement'))
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
const RealTimeNotifications = React.lazy(
  () => import('./views/notifications/RealTimeNotifications'),
)

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))
const ReportsView = React.lazy(() => import('./views/reports/ReportsView'))
const LogsView = React.lazy(() => import('./views/logs/LogsView'))
const RoleManagementView = React.lazy(() => import('./views/RoleManagement/RoleManagementView'))
const PermissionEditor = React.lazy(() => import('./views/RoleManagement/PermissionEditor'))
const ScheduledReports = React.lazy(() => import('./views/reports/ScheduledReports'))
const IntegrationHooks = React.lazy(() => import('./views/settings/IntegrationHooks'))
const AuditLogExport = React.lazy(() => import('./views/logs/AuditLogExport'))

// Settings
const SocialLinksManagement = React.lazy(() => import('./views/settings/SocialLinksManagement'))

// Affiliate Management
const AffiliateUserManagement = React.lazy(
  () => import('./views/affiliate/AffiliateUserManagement'),
)
const AffiliateDepositManagement = React.lazy(
  () => import('./views/affiliate/AffiliateDepositManagement'),
)
const AffiliateUserDeposits = React.lazy(() => import('./views/affiliate/AffiliateUserDeposits'))
const AffiliateUserWithdrawals = React.lazy(
  () => import('./views/affiliate/AffiliateUserWithdrawals'),
)

// Account
const ProfilePage = React.lazy(() => import('./views/account/ProfilePage'))
const LogoutPage = React.lazy(() => import('./views/account/LogoutPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/advanced-dashboard', name: 'Advanced Dashboard', element: AdvancedDashboard },
  {
    path: '/unified-dashboard',
    name: 'Unified Dynamic Dashboard',
    element: UnifiedDynamicDashboard,
  },
  { path: '/subAdminDeposit', name: 'subAdminDeposit', element: DepositFullView },
  { path: '/subAdminwidthrow', name: 'subAdminWidthrow', element: WidthrawalView },
  { path: '/subAdmingetway', name: 'PaymentGateway', element: PaymentGateway },
  { path: '/SubAdminGetwayWidthraw', name: 'subAdminwidthrow', element: PaymenWidthralFullView },
  /////////////////////////////////////SubAdmin////////////////////////////////////////////////
  { path: '/userReport', name: 'userReport', element: UserManagementPage },
  { path: '/subAdminList', name: 'SubAdminList', element: SubAdminManagement },
  { path: '/subAdmin/subAdminUser', name: 'SubAdminList', element: SubAminUserList },
  { path: '/subAdmin/subAdminDeposit', name: 'SubAdminList', element: SubAdminDeposit },
  { path: '/subAdmin/subAdminWidthrow', name: 'SubAdminList', element: SubAdminwidthrow },
  //////////////////////////////////////////////Agent//////////////////////////////////////////////

  { path: '/userReport', name: 'userReport', element: AgentUserList },
  { path: '/admin/agentList', name: 'SubAdminList', element: AgentManagement },
  { path: '/admin/AgentUser', name: 'AgentUser', element: AgentUserList },
  { path: '/agent/agentUserDeposit', name: 'AgentDeposit', element: AgentDeposit },
  { path: '/admin/AgentWidthrow', name: 'AgentWidthrow', element: Agentwidthrow },
  ////////////////////////////////////////////Affiliate///////////////////////////////////////////
  { path: '/admin/affiliateList', name: 'Accordion', element: AffiliateManagement },
  {
    path: '/admin/affiliate/affiliateCommission',
    name: 'Accordion',
    element: AffiliateCommissionSettings,
  },
  { path: '/agent/agentList', name: 'Accordion', element: AgentManagement },
  { path: '/affiliate/affiliateList', name: 'Accordion', element: SubAdminAffiliateManagement },

  /////////////////////////////////report/////////////////////////////////////////////
  { path: '/transaction/report', name: 'Accordion', element: TransactionReport },

  { path: '/dailyRebate', name: 'DailyRebate', element: DailyRebetBonusManagement },
  { path: '/weeklyLosses', name: 'DailyRebate', element: WeekLossesBonusManagement },
  { path: '/promotionSettings', name: 'WeekLosses', element: BonusManagement },
  { path: '/referral', name: 'Referral', element: ReferralBonus },
  { path: '/liveChat', name: 'LiveChat', element: LiveChat },
  { path: '/Games', name: 'userReport', element: GamesManagement },
  { path: '/announcement/announcementList', name: 'announcementList', element: AnnouncementsList },
  {
    path: '/admin/real-time-notifications',
    name: 'Real-Time Notifications',
    element: RealTimeNotifications,
  },

  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
  { path: '/admin/reports', name: 'Reports & Analytics', element: ReportsView },
  { path: '/admin/logs', name: 'System Logs', element: LogsView },
  { path: '/admin/roles', name: 'Role Management', element: RoleManagementView },
  { path: '/admin/permission-editor', name: 'Permission Editor', element: PermissionEditor },
  { path: '/admin/impersonation', name: 'Admin Impersonation', element: AdminImpersonation },
  { path: '/admin/bulk-user-actions', name: 'Bulk User Actions', element: BulkUserActions },
  { path: '/admin/scheduled-reports', name: 'Scheduled Reports', element: ScheduledReports },
  { path: '/admin/integration-hooks', name: 'Integration Hooks', element: IntegrationHooks },
  { path: '/admin/audit-log-export', name: 'Audit Log Export', element: AuditLogExport },

  // Settings Routes
  { path: '/updateAndcreateSocialLinks', name: 'Social Links', element: SocialLinksManagement },

  // Affiliate Routes
  { path: '/affiliate/affiliateUser', name: 'Affiliate User', element: AffiliateUserManagement },
  {
    path: '/affiliate/affiliateDeposit',
    name: 'Affiliate Deposits',
    element: AffiliateDepositManagement,
  },
  {
    path: '/affiliate/affiliateserDeposit',
    name: 'Affiliate User Deposits',
    element: AffiliateUserDeposits,
  },
  {
    path: '/affiliate/affiliateWithdraw',
    name: 'Affiliate Withdrawals',
    element: AffiliateUserWithdrawals,
  },

  // Account Routes
  { path: '/profile', name: 'My Account', element: ProfilePage },
  { path: '/logout', name: 'Logout', element: LogoutPage },
]

export default routes
