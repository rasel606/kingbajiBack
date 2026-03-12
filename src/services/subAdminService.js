const UserModel = require('../models/User'); // Assuming User model path
const { buildApiFeatures } = require('../utils/apiFeatures'); // A new utility we will create
const AppError = require('../utils/AppError');

/**
 * @description Get a paginated list of users under a specific sub-admin or all users.
 * @param {object} queryParams - The query parameters from the request (e.g., page, limit, subAdminId).
 * @returns {Promise<object>} - An object containing the list of users and pagination details.
 * @throws {AppError}
 */
const getSubAdminUsers = async (queryParams) => {
  // Base query to find users. You can add more specific filters like role.
  const baseQuery = { role: 'user' };

  // If a subAdminId is provided, filter users who were referred by that sub-admin.
  if (queryParams.subAdminId) {
    baseQuery.referredBy = queryParams.subAdminId;
  }

  const userQuery = UserModel.find(baseQuery);

  // Use a reusable utility to handle filtering, sorting, and pagination
  return buildApiFeatures(userQuery, queryParams);
};

module.exports = {
  getSubAdminUsers,
};