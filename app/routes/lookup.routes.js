const express = require("express");
const router = express.Router();

const lookup = require("../controllers/lookup.controller");

// Reference data (public): seeds drive these lists, no login needed.
router.get("/", lookup.getLookupLists);

module.exports = router;
