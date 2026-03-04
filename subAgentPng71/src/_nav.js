
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
    name: 'Agent',
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
      { component: CNavItem, name: 'Deposit Report Approved', to: '/depositReportApproved', icon: <CIcon icon={cilCheck} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Deposit Report Reject', to: '/depositReportReject', icon: <CIcon icon={cilWarning} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Withdraw Report Accept', to: '/widthrawReportAccept', icon: <CIcon icon={cilCheck} customClassName="nav-icon" /> },
      { component: CNavItem, name: 'Withdraw Report Reject', to: '/widthrawReportreject', icon: <CIcon icon={cilWarning} customClassName="nav-icon" /> },
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
