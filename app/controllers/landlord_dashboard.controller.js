const landlord_dashboardService = require("../services/landlord_dashboard.service");

/* ===========================
   GET DASHBOARD
=========================== */
exports.getDashboard = async (req, res) => {
  try {
    const stats = await landlord_dashboardService.getStats();
    const payments = await landlord_dashboardService.getUpcomingPayments();
    const chart = await landlord_dashboardService.getChartData();

    res.json({
      success: true,
      data: {
        stats,
        payments,
        chart,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};