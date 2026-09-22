const jwt = require("jsonwebtoken");

const { env } = require("../config/env.js");
const { ApiError } = require("../utils/api-error.js");

export function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new ApiError(401, "Authentication token is required");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Invalid authentication header");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(401, "Invalid or expired authentication token"));
  }
}
