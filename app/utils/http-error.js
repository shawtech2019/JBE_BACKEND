/**
 * Lightweight HTTP-aware error used across services/controllers.
 * The error middleware turns this into a JSON response.
 */
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

module.exports = { HttpError };
