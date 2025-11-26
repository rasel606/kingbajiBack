const AppError = require("../utils/appError");

const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  // Force numeric statusCode
  const statusCode = typeof err.statusCode === "number" ? AppError: 500;
  res.status(statusCode).json({
    status: err.status || "error",
    message: err.message || "Something went wrong",
  });
};

module.exports = globalErrorHandler;
