// middleware/auth.js
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const SubAdminModel = require("../models/SubAdminModel");
const AdminModel = require("../models/AdminModel");
const AgentModel = require("../models/AgentModel");
const SubAgentModel = require("../models/SubAgentModel");

const JWT_SECRET = "Kingbaji";

const auth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Access denied. No token provided.", 401));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user =
      (await AdminModel.findOne({ email: decoded.email }).select("-password")) ||
      (await SubAdminModel.findOne({ email: decoded.email }).select("-password")) ||
      (await AgentModel.findOne({ email: decoded.email }).select("-password")) ||
      (await SubAgentModel.findOne({ email: decoded.email }).select("-password"));

    if (!user) {
      return next(new AppError("Token is not valid.", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError("Token is not valid.", 401));
  }
};

module.exports = auth; // ✅ default export
