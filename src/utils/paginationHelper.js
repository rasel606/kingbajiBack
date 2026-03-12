/**
 * Enhanced Pagination Helper
 * Provides comprehensive pagination utilities with metadata, sorting, and filtering
 */

const logger = require('./logger');

/**
 * Parse pagination parameters from query
 */
const parsePagination = (query, options = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 100,
    minLimit = 1
  } = options;

  let page = parseInt(query.page) || defaultPage;
  let limit = parseInt(query.limit) || defaultLimit;

  // Ensure valid page number
  page = Math.max(1, page);

  // Ensure valid limit with bounds
  limit = Math.max(minLimit, Math.min(maxLimit, limit));

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Parse sort parameters from query
 */
const parseSort = (query, allowedFields = [], defaultSort = { createdAt: -1 }) => {
  const sortBy = query.sortBy || Object.keys(defaultSort)[0];
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  // Validate sort field
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    return defaultSort;
  }

  return { [sortBy]: sortOrder };
};

/**
 * Parse filter parameters from query
 */
const parseFilters = (query, filterConfig = {}) => {
  const filters = {};

  Object.keys(query).forEach(key => {
    // Skip pagination and sorting params
    if (['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) {
      return;
    }

    const value = query[key];

    // Skip empty values
    if (value === undefined || value === '' || value === null) {
      return;
    }

    // Apply filter configuration
    const config = filterConfig[key];
    
    if (config) {
      // Custom filter configuration
      if (config.type === 'range') {
        const [min, max] = value.split(',');
        if (min) filters[config.field || key] = { $gte: parseFloat(min) };
        if (max) filters[config.field || key] = { ...filters[config.field || key], $lte: parseFloat(max) };
      } else if (config.type === 'array') {
        filters[key] = { $in: value.split(',') };
      } else if (config.type === 'regex') {
        filters[key] = { $regex: value, $options: 'i' };
      } else if (config.type === 'date') {
        filters[key] = { $gte: new Date(value) };
      } else {
        filters[key] = value;
      }
    } else {
      // Default filter behavior
      if (key.includes('Min') || key.includes('Max')) {
        // Range filter
        const baseKey = key.replace('Min', '').replace('Max', '');
        const isMin = key.includes('Min');
        const field = filterConfig[baseKey]?.field || baseKey;
        
        if (!filters[field]) filters[field] = {};
        filters[field][isMin ? '$gte' : '$lte'] = parseFloat(value);
      } else if (key.includes('_id')) {
        // ID filter
        filters[key] = value;
      } else if (!isNaN(value)) {
        // Number filter
        filters[key] = parseFloat(value);
      } else {
        // String filter (case-insensitive)
        filters[key] = { $regex: value, $options: 'i' };
      }
    }
  });

  return filters;
};

/**
 * Build aggregation pipeline with pagination
 */
const buildPaginatedAggregation = async (model, pipeline, page, limit) => {
  const skip = (page - 1) * limit;

  // Get total count
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await model.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Get paginated data
  const dataPipeline = [
    ...pipeline,
    { $skip: skip },
    { $limit: limit }
  ];
  
  const data = await model.aggregate(dataPipeline);

  return { data, total };
};

/**
 * Build paginated query with Mongoose
 */
const buildPaginatedQuery = async (model, query, options = {}) => {
  const {
    select = '',
    populate = [],
    sort = { createdAt: -1 },
    page = 1,
    limit = 10
  } = options;

  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [documents, total] = await Promise.all([
    model.find(query)
      .select(select)
      .populate(populate)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    model.countDocuments(query)
  ]);

  return { documents, total };
};

/**
 * Create pagination metadata
 */
const createPaginationMeta = (page, limit, total, additionalMeta = {}) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    // Pagination info
    currentPage: page,
    totalPages,
    recordsPerPage: limit,
    totalRecords: total,
    
    // Navigation
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
    
    // Additional metadata
    ...additionalMeta
  };
};

/**
 * Paginated response helper
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const pagination = createPaginationMeta(page, limit, total);
  
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

/**
 * Parse all query parameters at once
 */
const parseQueryParams = (query, config = {}) => {
  const {
    pagination = true,
    sorting = true,
    filtering = true,
    allowedSortFields = [],
    allowedFilterFields = [],
    filterConfig = {}
  } = config;

  const result = {};

  // Parse pagination
  if (pagination) {
    result.pagination = parsePagination(query);
  }

  // Parse sorting
  if (sorting) {
    result.sort = parseSort(query, allowedSortFields);
  }

  // Parse filters
  if (filtering) {
    // Merge allowed fields with filter config
    const mergedFilterConfig = { ...filterConfig };
    allowedFilterFields.forEach(field => {
      if (!mergedFilterConfig[field]) {
        mergedFilterConfig[field] = {};
      }
    });
    
    result.filters = parseFilters(query, mergedFilterConfig);
  }

  return result;
};

/**
 * Advanced pagination with cursor-based navigation
 */
const cursorPagination = async (model, query, options = {}) => {
  const {
    cursorField = '_id',
    limit = 10,
    cursor = null,
    sortOrder = -1,
    select = '',
    populate = []
  } = options;

  // Build query
  let mongoQuery = { ...query };
  
  // Add cursor condition if provided
  if (cursor) {
    mongoQuery[cursorField] = sortOrder === 1 
      ? { $gt: cursor } 
      : { $lt: cursor };
  }

  // Execute query
  const documents = await model.find(mongoQuery)
    .select(select)
    .populate(populate)
    .sort({ [cursorField]: sortOrder })
    .limit(limit + 1) // Fetch one extra to determine if there's more
    .lean();

  // Determine if there's a next page
  const hasMore = documents.length > limit;
  if (hasMore) {
    documents.pop();
  }

  // Get next cursor
  const nextCursor = hasMore 
    ? documents[documents.length - 1][cursorField] 
    : null;

  return {
    data: documents,
    pagination: {
      hasMore,
      nextCursor,
      limit
    }
  };
};

/**
 * Infinite scroll pagination helper
 */
const infiniteScrollResponse = (res, data, hasMore, nextCursor, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      type: 'infinite',
      hasMore,
      nextCursor
    }
  });
};

/**
 * Export results to different formats
 */
const exportResults = async (model, query, format = 'json') => {
  const documents = await model.find(query).lean();

  switch (format.toLowerCase()) {
    case 'csv':
      if (documents.length === 0) return '';
      
      const headers = Object.keys(documents[0]).join(',');
      const rows = documents.map(doc => 
        Object.values(doc).map(val => 
          typeof val === 'string' ? `"${val}"` : val
        ).join(',')
      );
      return [headers, ...rows].join('\n');

    case 'json':
    default:
      return documents;
  }
};

module.exports = {
  parsePagination,
  parseSort,
  parseFilters,
  buildPaginatedAggregation,
  buildPaginatedQuery,
  createPaginationMeta,
  paginatedResponse,
  parseQueryParams,
  cursorPagination,
  infiniteScrollResponse,
  exportResults
};

