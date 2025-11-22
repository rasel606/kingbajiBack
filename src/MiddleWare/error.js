const AppError = require("../utils/appError");

const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  // Force numeric statusCode
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message
  });
};

module.exports = globalErrorHandler;



