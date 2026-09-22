// module.exports = (schema) => (req, res, next) => {
//   const { error } = schema.validate(req.body);
//   if (error) return res.status(400).json({ message: error.message });
//   next();
// };

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error) {
      next(error);
    }
  };
}
