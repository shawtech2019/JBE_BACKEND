const express = require("express");
const router = express.Router();
const landlordDashboardController = require("../controllers/landlord_dashboard.controller");

router.get("/", landlordDashboardController.getDashboard);

module.exports = router;