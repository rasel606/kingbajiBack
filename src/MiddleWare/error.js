const AppError = require("../utils/appError");

const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  // Force numeric statusCode
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  res.status(statusCode).json({
    status: err.status || "error",
    message: err.message || "Something went wrong",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = globalErrorHandler;
