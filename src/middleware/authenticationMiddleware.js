const { UnauthenticatedError, UnauthorizedError } = require("../utils/errors");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new UnauthenticatedError("Authentication error!");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.users = {
      id: payload.id,
      is_admin: payload.is_admin,
      user_name: payload.user_name,
    };

    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication error!");
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.users?.is_admin) {
      throw new UnauthorizedError("Unauthorized Access!");
    }
    next();
  };
};
