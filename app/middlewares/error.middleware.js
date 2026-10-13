const { HttpError } = require("../utils/http-error");

/**
 * Central error handler. Mounted last in app.js.
 */
function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);

  // Application errors thrown deliberately by services.
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  // Joi validation errors (defensive — validators usually short-circuit).
  if (error && error.isJoi) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }

  // MySQL duplicate entry.
  if (error && error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      status: "error",
      message: "A record with the same information already exists",
    });
  }

  console.error(error);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}

module.exports = errorMiddleware;
