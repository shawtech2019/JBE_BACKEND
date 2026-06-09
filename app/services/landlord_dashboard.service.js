const pool = require("../config/db");

/* ===========================
   GET DASHBOARD STATS
=========================== */
exports.getStats = async () => {
  const [[{ totalProperties }]] = await pool.query(
    "SELECT COUNT(*) as totalProperties FROM properties"
  );

  const [[{ occupiedUnits }]] = await pool.query(
    "SELECT COUNT(*) as occupiedUnits FROM units WHERE status='occupied'"
  );

  const [[{ vacantUnits }]] = await pool.query(
    "SELECT COUNT(*) as vacantUnits FROM units WHERE status='vacant'"
  );

  const [[{ totalIncome }]] = await pool.query(
    "SELECT IFNULL(SUM(amount),0) as totalIncome FROM payments WHERE status='paid'"
  );

  const [[{ outstanding }]] = await pool.query(
    "SELECT IFNULL(SUM(amount),0) as outstanding FROM payments WHERE status!='paid'"
  );

  return {
    totalProperties,
    occupiedUnits,
    vacantUnits,
    totalIncome,
    outstanding,
  };
};

/* ===========================
   UPCOMING PAYMENTS
=========================== */
exports.getUpcomingPayments = async () => {
  const [rows] = await pool.query(`
    SELECT 
      u.tenant_name as name,
      u.unit_name as unit,
      p.amount,
      p.due_date,
      p.status
    FROM payments p
    JOIN units u ON u.id = p.unit_id
    ORDER BY p.due_date ASC
    LIMIT 5
  `);

  return rows;
};

/* ===========================
   CHART DATA (MONTHLY)
=========================== */
exports.getChartData = async () => {
  const [rows] = await pool.query(`
    SELECT 
      MONTHNAME(due_date) as month,
      SUM(CASE WHEN status='paid' THEN amount ELSE 0 END) as income
    FROM payments
    GROUP BY MONTH(due_date)
    ORDER BY MONTH(due_date)
  `);

  return rows;
};