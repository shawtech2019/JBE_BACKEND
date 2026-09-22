import { db } from "../config/db";

export async function getPaidTotal(tenantId, leaseId) {
  const [rows] = await db.query(
    `
    SELECT
      COALESCE(
        SUM(amount),
        0
      ) AS totalPaid

    FROM payments

    WHERE tenant_id = ?

      AND lease_id = ?

      AND status = 'PAID'
    `,
    [tenantId, leaseId]
  );

  return Number(rows[0]?.totalPaid ?? 0);
}

export async function findRecentPayments(tenantId, limit = 10) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      lease_id AS leaseId,
      amount, 
      currency,
      payment_method AS paymentMethod,
      status,
      description,
      provider,
      provider_reference AS providerReference,
      paid_at AS paidAt,
      created_at AS createdAt

    FROM payments

    WHERE tenant_id = ?

    ORDER BY created_at DESC

    LIMIT ?
    `,
    [tenantId, limit]
  );

  return rows;
}

export async function findPaymentHistory(tenantId) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      lease_id AS leaseId,
      amount,
      currency,
      payment_method AS paymentMethod,
      status,
      description,
      provider,
      provider_reference AS providerReference,
      paid_at AS paidAt,
      created_at AS createdAt

    FROM payments

    WHERE tenant_id = ?

    ORDER BY created_at DESC
    `,
    [tenantId]
  );

  return rows;
}

export async function createPayment(data) {
  const [result] = await db.query(
    `
    INSERT INTO payments (
      tenant_id,
      lease_id,
      amount,
      currency,
      payment_method,
      status,
      description,
      idempotency_key
    )

    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      'PENDING',
      ?,
      ?
    )
    `,
    [
      data.tenantId,
      data.leaseId,
      data.amount,
      data.currency,
      data.paymentMethod,
      data.description ?? null,
      data.idempotencyKey,
    ]
  );

  return result.insertId;
}

export async function findPaymentById(id, tenantId) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      lease_id AS leaseId,
      amount,
      currency,
      payment_method AS paymentMethod,
      status,
      description,
      provider,
      provider_reference AS providerReference,
      paid_at AS paidAt,
      created_at AS createdAt

    FROM payments

    WHERE id = ?

      AND tenant_id = ?

    LIMIT 1
    `,
    [id, tenantId]
  );

  return rows.length ? rows[0] : null;
}
