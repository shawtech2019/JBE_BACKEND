const express = require("express");

const {
  getPaymentDashboard,
  getPaymentHistory,
  createPayment,
  updateAutoPay,
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/dashboard/:tenantId", getPaymentDashboard);

router.get("/history/:tenantId", getPaymentHistory);

router.post("/", createPayment);

router.put("/autopay/:tenantId", updateAutoPay);

module.exports = router;
