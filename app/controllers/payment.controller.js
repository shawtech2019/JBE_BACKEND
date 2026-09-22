const { pool } = require("../config/db");

/**
 * Generate payment reference
 */
const generateReference = () => {
  return `RENT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/**
 * ==========================================
 * GET PAYMENT DASHBOARD
 * ==========================================
 *
 * GET /api/payments/dashboard/:tenantId
 */
const getPaymentDashboard = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    // Get active lease
    const [leaseRows] = await pool.execute(
      `
      SELECT
        id,
        tenant_id,
        apartment,
        unit,
        monthly_rent,
        lease_start_date,
        lease_end_date,
        total_lease_amount,
        total_paid,
        status,
        auto_pay
      FROM leases
      WHERE tenant_id = ?
      AND status = 'Active'
      LIMIT 1
      `,
      [tenantId]
    );

    if (leaseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active lease not found",
      });
    }

    const lease = leaseRows[0];

    // Get recent payments
    const [paymentRows] = await pool.execute(
      `
      SELECT
        id,
        amount,
        payment_date,
        payment_method,
        reference,
        status,
        description
      FROM payments
      WHERE tenant_id = ?
      AND lease_id = ?
      AND status = 'Paid'
      ORDER BY payment_date DESC
      LIMIT 10
      `,
      [tenantId, lease.id]
    );

    // Calculate total paid
    const totalPaid = paymentRows.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

    const totalLeaseAmount = Number(lease.total_lease_amount);

    const percentagePaid =
      totalLeaseAmount > 0
        ? Math.min(Math.round((totalPaid / totalLeaseAmount) * 100), 100)
        : 0;

    const remainingPercentage = 100 - percentagePaid;

    const remainingAmount = Math.max(totalLeaseAmount - totalPaid, 0);

    // Format transactions
    const transactions = paymentRows.map((payment) => {
      const paymentDate = new Date(payment.payment_date);

      const month = paymentDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      const formattedDate = paymentDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });

      return {
        id: payment.id,

        month,

        desc:
          payment.description ||
          `Paid on ${formattedDate} Via ${payment.payment_method.toLowerCase()}`,

        status: payment.status,

        amount: Number(payment.amount),

        paymentDate: payment.payment_date,

        reference: payment.reference,
      };
    });

    res.json({
      success: true,

      data: {
        lease: {
          id: lease.id,

          apartment: lease.apartment,

          unit: lease.unit,

          monthlyRent: Number(lease.monthly_rent),

          startDate: lease.lease_start_date,

          endDate: lease.lease_end_date,

          status: lease.status,

          autoPay: Boolean(lease.auto_pay),
        },

        summary: {
          totalLeaseAmount,

          totalPaid,

          remainingAmount,

          percentagePaid,

          remainingPercentage,
        },

        pieData: [
          {
            name: "Paid",
            value: percentagePaid,
          },
          {
            name: "Remaining",
            value: remainingPercentage,
          },
        ],

        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * GET PAYMENT HISTORY
 * ==========================================
 *
 * GET /api/payments/history/:tenantId
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    const [payments] = await pool.execute(
      `
      SELECT
        p.id,
        p.amount,
        p.payment_date,
        p.payment_method,
        p.reference,
        p.status,
        p.description,
        p.created_at,

        l.apartment,
        l.unit

      FROM payments p

      INNER JOIN leases l
        ON p.lease_id = l.id

      WHERE p.tenant_id = ?

      ORDER BY p.payment_date DESC
      `,
      [tenantId]
    );

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,

      amount: Number(payment.amount),

      paymentDate: payment.payment_date,

      paymentMethod: payment.payment_method,

      reference: payment.reference,

      status: payment.status,

      description: payment.description,

      apartment: payment.apartment,

      unit: payment.unit,

      createdAt: payment.created_at,
    }));

    res.json({
      success: true,

      count: formattedPayments.length,

      data: formattedPayments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * CREATE PAYMENT
 * ==========================================
 *
 * POST /api/payments
 */
const createPayment = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { tenantId, leaseId, amount, paymentMethod } = req.body;

    if (!tenantId || !leaseId || !amount || !paymentMethod) {
      connection.release();

      return res.status(400).json({
        success: false,

        message: "tenantId, leaseId, amount and paymentMethod are required",
      });
    }

    if (Number(amount) <= 0) {
      connection.release();

      return res.status(400).json({
        success: false,

        message: "Payment amount must be greater than zero",
      });
    }

    // Start transaction
    await connection.beginTransaction();

    // Verify lease
    const [leaseRows] = await connection.execute(
      `
        SELECT
          id,
          tenant_id,
          total_lease_amount,
          total_paid,
          status
        FROM leases
        WHERE id = ?
        AND tenant_id = ?
        LIMIT 1
        `,
      [leaseId, tenantId]
    );

    if (leaseRows.length === 0) {
      await connection.rollback();

      connection.release();

      return res.status(404).json({
        success: false,

        message: "Lease not found",
      });
    }

    const lease = leaseRows[0];

    if (lease.status !== "Active") {
      await connection.rollback();

      connection.release();

      return res.status(400).json({
        success: false,

        message: "This lease is not active",
      });
    }

    const reference = generateReference();

    // Insert payment
    const [paymentResult] = await connection.execute(
      `
        INSERT INTO payments (
          tenant_id,
          lease_id,
          amount,
          payment_method,
          reference,
          status,
          description
        )
        VALUES (?, ?, ?, ?, ?, 'Paid', ?)
        `,
      [tenantId, leaseId, amount, paymentMethod, reference, "Rent payment"]
    );

    // Update lease total
    await connection.execute(
      `
      UPDATE leases
      SET total_paid =
        total_paid + ?
      WHERE id = ?
      `,
      [amount, leaseId]
    );

    // Commit
    await connection.commit();

    connection.release();

    res.status(201).json({
      success: true,

      message: "Payment successfully recorded",

      data: {
        id: paymentResult.insertId,

        tenantId,

        leaseId,

        amount: Number(amount),

        paymentMethod,

        reference,

        status: "Paid",
      },
    });
  } catch (error) {
    await connection.rollback();

    connection.release();

    next(error);
  }
};

/**
 * ==========================================
 * UPDATE AUTO PAY
 * ==========================================
 *
 * PUT /api/payments/autopay/:tenantId
 */
const updateAutoPay = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,

        message: "enabled must be a boolean",
      });
    }

    const [result] = await pool.execute(
      `
        UPDATE leases

        SET auto_pay = ?

        WHERE tenant_id = ?

        AND status = 'Active'
        `,
      [enabled, tenantId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,

        message: "Active lease not found",
      });
    }

    res.json({
      success: true,

      message: enabled ? "Auto-pay enabled" : "Auto-pay disabled",

      data: {
        autoPay: enabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentDashboard,
  getPaymentHistory,
  createPayment,
  updateAutoPay,
};
