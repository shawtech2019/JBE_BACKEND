const asyncHandler = require("../utils/async-handler");
const lookupService = require("../services/lookup.service");

exports.getLookupLists = asyncHandler(async (req, res) => {
  const data = await lookupService.getLookupLists();
  res.json({ status: "success", ...data });
});
