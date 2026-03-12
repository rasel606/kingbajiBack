/**
 * @description Applies pagination, sorting, and filtering to a Mongoose query.
 * @param {object} mongooseQuery - A Mongoose query object (e.g., User.find()).
 * @param {object} requestQuery - The req.query object from Express.
 * @returns {Promise<object>} - An object with data and pagination info.
 */
const buildApiFeatures = async (mongooseQuery, requestQuery) => {
  // 1. Filtering (simple example, can be expanded)
  const queryObj = { ...requestQuery };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Add more advanced filtering logic here if needed (e.g., for price ranges)
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  let query = mongooseQuery.find(queryObj);

  // 2. Sorting
  if (requestQuery.sort) {
    const sortBy = requestQuery.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sort
  }

  // 3. Field Limiting (Projection)
  if (requestQuery.fields) {
    const fields = requestQuery.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v'); // Exclude by default
  }

  // 4. Pagination
  const page = parseInt(requestQuery.page, 10) || 1;
  const limit = parseInt(requestQuery.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get total count before pagination for accurate total
  const total = await mongooseQuery.model.countDocuments(mongooseQuery.getFilter());

  query = query.skip(skip).limit(limit);

  const data = await query;

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { data, pagination };
};

module.exports = { buildApiFeatures };