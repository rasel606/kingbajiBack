const AppError = require("../utils/appError");

const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message || "Something went wrong",
  });
};

module.exports = globalErrorHandler;
