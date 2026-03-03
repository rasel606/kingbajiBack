
import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilMoney,
  cilArrowCircleTop,
  cilPeople,
  cilCommentBubble,
  cilGlobeAlt,
  cilChart,
  cilBadge,
  cilSettings,
  cilAccountLogout,
  cilEnvelopeClosed,
  cilList,
  cilCheck,
  cilWarning,
  cilUserFollow,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  // 📌 Dashboard Section
  {
    component: CNavTitle,
    name: 'Dashboard',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  // 📌 Transactions Section
  {
    component: CNavTitle,
    name: 'Transactions',
  },


  { component: CNavItem, name: 'Deposit', to: '/Deposit', icon: <CIcon icon={cilCheck} customClassName="nav-icon" /> },
  {
    component: CNavItem,
    name: 'Withdraw',
    to: '/widthrow',
    icon: <CIcon icon={cilArrowCircleTop} customClassName="nav-icon" />,
  },

  // 📌 Gateway Section

  {
    component: CNavTitle,
    name: 'Gateways',
  },
  {
    component: CNavItem,
    name: 'Deposit Gateway',
    to: '/deposit/getway',
    icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Withdraw Gateway',
    to: '/widthraw/getway',
    icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
  },

  // 📌 Users Section
  {
    component: CNavTitle,
    name: 'Users',
  },
  {
    component: CNavItem,
    name: 'All Users',
    to: '/userReport',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Super Agent',
  },
  {
    component: CNavGroup,
    name: 'Super Agent',
    icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Super List', to: '/agent/agentList', icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Super User List', to: '/agent/agentUserList', icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Super Deposit', to: '/agent/agentDeposit', icon: <CIcon icon={cilMoney} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Super User Deposit', to: '/agent/agentUserDeposit', icon: <CIcon icon={cilMoney} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Super User Withdraw', to: '/agent/agentUserWithdraw', icon: <CIcon icon={cilArrowCircleTop} customClassName="nav-icon" /> },
    ],
  },
  {
    component: CNavTitle,
    name: 'MasterAgent',
  },
  {
    component: CNavGroup,
    name: 'Master Agent',
    icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Master Agent List', to: '/subagent/agentList', icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Master Agent User List', to: '/subagent/agentUserList', icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Master Agent Deposit', to: '/subagent/agentDeposit', icon: <CIcon icon={cilMoney} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Master Agent User Deposit', to: '/subagent/agentUserDeposit', icon: <CIcon icon={cilMoney} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Master Agent User Withdraw', to: '/subagent/agentUserWithdraw', icon: <CIcon icon={cilArrowCircleTop} customClassName="nav-icon" /> },
    ],
  },
  {
    component: CNavTitle,
    name: 'Affiliate',
  },
  {
    component: CNavGroup,
    name: 'Affiliate',
    icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Affiliate List', to: '/affiliate/affiliateList', icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Affiliate User List', to: '/affiliate/affiliateUserList', icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Affiliate Withdraw', to: '/affiliate/affiliateWithdraw', icon: <CIcon icon={cilMoney} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Affiliate User Deposit', to: '/affiliate/affiliateUserDeposit', icon: <CIcon icon={cilMoney} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Affiliate User Withdraw', to: '/affiliate/affiliateUserWithdraw', icon: <CIcon icon={cilArrowCircleTop} customClassName="nav-icon" /> },
    ],
  },
  // 📌 Communication Section
  {
    component: CNavTitle,
    name: 'Communication',
  },
  {
    component: CNavGroup,
    name: 'Live Contact',
    icon: <CIcon icon={cilCommentBubble} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Live Chat', to: '/liveChat', icon: <CIcon icon={cilEnvelopeClosed} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Social Links', to: '/updateAndcreateSocialLinks', icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" /> },
    ],
  },

  // 📌 Reports Section
  {
    component: CNavTitle,
    name: 'Reports',
  },
  {
    component: CNavGroup,
    name: 'Report',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Trangsacton Report', to: '/agent/trangsactonReport', icon: <CIcon icon={cilCheck} customClassName="nav-icon" /> },

      { component: CNavItem, name: 'User Report', to: '/userReport', icon: <CIcon icon={cilList} customClassName="nav-icon" /> },
    ],
  },





  {
    component: CNavItem,
    name: 'Daily Rebate',
    to: '/dailyRebate',
    icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Weekly Losses',
    to: '/weeklyLosses',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  },


  // 📌 Account Section
  {
    component: CNavTitle,
    name: 'Account',
  },
  {
    component: CNavItem,
    name: 'My Account',
    to: '/profile',
    icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Logout',
    to: '/logout',
    icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
  },
]

export default _nav
