import { db } from '../config/database.js'

export async function findActiveLeaseByTenant(
  tenantId
) {
  const [
    rows
  ] = await db.query(
    `
    SELECT
      id,
      tenant_id AS tenantId,
      apartment,
      unit,
      monthly_rent AS monthlyRent,
      lease_start_date AS leaseStartDate,
      lease_end_date AS leaseEndDate,
      status,
      auto_pay_enabled AS autoPayEnabled

    FROM leases

    WHERE tenant_id = ?

      AND status = 'ACTIVE'

    ORDER BY id DESC

    LIMIT 1
    `,
    [tenantId]
  )

  return rows.length
    ? rows[0]
    : null
}

export async function findLeaseByIdAndTenant(
  leaseId,
  tenantId
) {
  const [
    rows
  ] = await db.query(
    `
    SELECT
      id,
      tenant_id AS tenantId,
      apartment,
      unit,
      monthly_rent AS monthlyRent,
      lease_start_date AS leaseStartDate,
      lease_end_date AS leaseEndDate,
      status,
      auto_pay_enabled AS autoPayEnabled

    FROM leases

    WHERE id = ?

      AND tenant_id = ?

    LIMIT 1
    `,
    [
      leaseId,
      tenantId
    ]
  )

  return rows.length
    ? rows[0]
    : null
}

export async function updateAutoPay(
  leaseId,
  tenantId,
  enabled
) {
  await db.query(
    `
    UPDATE leases

    SET auto_pay_enabled = ?

    WHERE id = ?

      AND tenant_id = ?
    `,
    [
      enabled,
      leaseId,
      tenantId
    ]
  )
}