const { verifyToken } = require("../utils/jwt");
const { HttpError } = require("../utils/http-error");
const Role = require("../models/Role");

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches
 * `req.user = { id, email }`.
 */
function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new HttpError(401, "Authentication token is required");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "Invalid authentication header");
    }

    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    next(new HttpError(401, "Invalid or expired authentication token"));
  }
}

/**
 * Guards a route so only users holding one of the given role slugs pass.
 * Must run after `authenticate`.
 */
function requireRole(...slugs) {
  return async (req, res, next) => {
    try {
      if (!req.user) throw new HttpError(401, "Authentication required");

      const allowed = await Role.userHasAnyRole(req.user.id, slugs);
      if (!allowed) throw new HttpError(403, "Insufficient permissions");

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { authenticate, requireRole };
