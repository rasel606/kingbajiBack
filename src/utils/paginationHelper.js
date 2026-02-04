/**
 * Pagination utility for standardizing pagination across the application
 */

/**
 * Calculate pagination values
 * @param {number} page - Current page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Object} Pagination values (page, limit, skip)
 */
const getPaginationValues = (page = 1, limit = 10) => {
  const pageNumber = Math.max(1, parseInt(page) || 1);
  const limitNumber = Math.max(1, parseInt(limit) || 10);
  const skip = (pageNumber - 1) * limitNumber;

  return {
    page: pageNumber,
    limit: limitNumber,
    skip
  };
};

/**
 * Build pagination response object
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
const buildPaginationResponse = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Execute paginated query with standard options
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} options - Pagination options { page, limit, sort }
 * @returns {Promise<Object>} Results with pagination metadata
 */
const paginateQuery = async (model, filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const { page: pageNum, limit: limitNum, skip } = getPaginationValues(page, limit);

  const [data, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limitNum),
    model.countDocuments(filter)
  ]);

  return {
    data,
    pagination: buildPaginationResponse(pageNum, limitNum, total)
  };
};

module.exports = {
  getPaginationValues,
  buildPaginationResponse,
  paginateQuery
};
