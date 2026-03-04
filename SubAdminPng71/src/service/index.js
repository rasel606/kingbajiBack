// services/index.js
// Central export file for all services

export { apiService } from './api';
export { default as authService } from './authService';
export { default as adminServices } from './adminServices';
export { default as userService } from './userService';
export { default as transactionService } from './transactionService';
export { default as agentService } from './agentService';
export { default as affiliateService } from './affiliateService';
export { default as gameService } from './gameService';
export { default as paymentService } from './paymentService';
export { default as vipService } from './vipService';
export { default as reportService } from './reportService';
export { default as announcementService } from './announcementService';
export { default as referralService } from './referralService';
export { default as socketService } from './socketService';
export { default as dashBoardService } from './dashBoardService';
export { default as withdrawalService } from './withdrawalService';
export { default as notificationService } from './notificationService';
export { default as profileService } from './profileService';
export { default as SubAdminServices } from './SubAdminServices';

// You can also export them as a single object if preferred
export default {
  api: apiService,
  auth: authService,
  admin: adminServices,
  user: userService,
  transaction: transactionService,
  agent: agentService,
  affiliate: affiliateService,
  game: gameService,
  payment: paymentService,
  vip: vipService,
  report: reportService,
  announcement: announcementService,
  referral: referralService,
  socket: socketService,
  dashboard: dashBoardService,
  withdrawal: withdrawalService,
  notification: notificationService,
  profile: profileService,
  subAdmin: SubAdminServices
};
