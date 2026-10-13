const Joi = require("joi");

exports.createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(255).allow("", null).optional(),
});

exports.assignRoleSchema = Joi.object({
  slug: Joi.string().min(2).max(50).required(),
});
