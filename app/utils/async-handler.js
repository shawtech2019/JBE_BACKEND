/**
 * Wraps an async express handler so rejected promises are forwarded to the
 * error middleware instead of crashing the process.
 */
function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
module.exports.asyncHandler = asyncHandler;
