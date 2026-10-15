const Joi = require("joi");

exports.updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().max(100).allow("", null),
  phone: Joi.string().max(30).allow("", null),
  jobTitle: Joi.string().max(100).allow("", null),
  company: Joi.string().max(150).allow("", null),
  location: Joi.string().max(150).allow("", null),
}).min(1);

exports.updateNotificationsSchema = Joi.object({
  // Channel toggles
  email: Joi.boolean(),
  sms: Joi.boolean(),
  // Tenant categories
  maintenance: Joi.boolean(),
  payments: Joi.boolean(),
  announcements: Joi.boolean(),
  lease: Joi.boolean(),
  visitors: Joi.boolean(),
  // Landlord/investor categories
  newRent: Joi.boolean(),
  paymentDue: Joi.boolean(),
  overdueRent: Joi.boolean(),
}).min(1);

exports.securitySchema = Joi.object({
  twoFactorEnabled: Joi.boolean().required(),
});
