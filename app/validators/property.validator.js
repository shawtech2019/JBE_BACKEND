const Joi = require("joi");

/**
 * Multipart requests arrive as strings. Joi coercion is only used for the
 * required-field checks here; the model does the actual type coercion.
 */
const optionalText = Joi.string().allow("", null);
const optionalNumber = Joi.number().allow("", null);

exports.createPropertySchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  propertyType: Joi.string().max(100).required(),
  purpose: Joi.string().max(50).required(),
  description: optionalText,

  price: optionalNumber,
  pricePeriod: optionalText,
  negotiable: Joi.boolean().allow("", null),
  serviceCharge: optionalNumber,
  cautionDeposit: optionalNumber,
  agencyFee: optionalNumber,
  legalFee: optionalNumber,

  bedrooms: Joi.number().integer().allow("", null),
  bathrooms: Joi.number().integer().allow("", null),
  toilets: Joi.number().integer().allow("", null),
  parking: Joi.number().integer().allow("", null),
  furnishing: optionalText,
  condition: optionalText,
  totalUnits: Joi.number().integer().allow("", null),
  floorArea: optionalNumber,
  landSize: optionalNumber,
  floors: Joi.number().integer().allow("", null),
  yearBuilt: Joi.number().integer().allow("", null),

  country: optionalText,
  state: optionalText,
  city: optionalText,
  lga: optionalText,
  estate: optionalText,
  landmark: optionalText,
  address: optionalText,

  agentName: optionalText,
  agentPhone: optionalText,
  agentWhatsapp: optionalText,

  availableFrom: optionalText,
  status: optionalText,
  featured: Joi.boolean().allow("", null),

  // JSON-encoded arrays sent as strings.
  amenities: optionalText,
  titleDocuments: optionalText,
  videoLinks: optionalText,
}).unknown(true);
