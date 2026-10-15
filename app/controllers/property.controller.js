const asyncHandler = require("../utils/async-handler");
const propertyService = require("../services/property.service");

exports.createProperty = asyncHandler(async (req, res) => {
  const data = await propertyService.createProperty(
    req.user.id,
    req.body,
    req.files
  );
  res
    .status(201)
    .json({ status: "success", message: "Property created", ...data });
});

exports.listProperties = asyncHandler(async (req, res) => {
  const data = await propertyService.listProperties(req.user.id);
  res.json({ status: "success", ...data });
});

exports.getProperty = asyncHandler(async (req, res) => {
  const data = await propertyService.getProperty(req.user.id, req.params.id);
  res.json({ status: "success", ...data });
});
