const bcrypt =  require('bcryptjs')
const { db } = require('../config/database.js')

async function seed() {
  console.log('Starting database seed...')

  try {
    const passwordHash =
      await bcrypt.hash(
        'Password123!',
        12
      )

    /*
     * CREATE TENANT
     */

    await db.query(
      `
      INSERT INTO tenants (
        email,
        first_name,
        last_name,
        password_hash,
        role
      )
      VALUES (?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        password_hash = VALUES(password_hash)
      `,
      [
        'tenant@example.com',
        'John',
        'Doe',
        passwordHash,
        'TENANT'
      ]
    )

    /*
     * GET TENANT
     */

    const [
      tenantRows
    ] = await db.query(
      `
      SELECT id
      FROM tenants
      WHERE email = ?
      LIMIT 1
      `,
      ['tenant@example.com']
    )

    const tenantId =
      tenantRows[0].id

    /*
     * CREATE LEASE
     */

    await db.query(
      `
      INSERT INTO leases (
        tenant_id,
        apartment,
        unit,
        monthly_rent,
        lease_start_date,
        lease_end_date,
        status,
        auto_pay_enabled
      )

      SELECT ?, ?, ?, ?, ?, ?, ?, ?

      WHERE NOT EXISTS (
        SELECT 1
        FROM leases
        WHERE tenant_id = ?
      )
      `,
      [
        tenantId,
        'Apartment 5C',
        'Unit 12',
        100000,
        '2026-01-01',
        '2027-12-31',
        'ACTIVE',
        true,
        tenantId
      ]
    )

    /*
     * GET LEASE
     */

    const [
      leaseRows
    ] = await db.query(
      `
      SELECT id
      FROM leases
      WHERE tenant_id = ?
      ORDER BY id ASC
      LIMIT 1
      `,
      [tenantId]
    )

    const leaseId =
      leaseRows[0].id

    /*
     * SAMPLE PAYMENTS
     */

    await db.query(
      `
      INSERT IGNORE INTO payments (
        tenant_id,
        lease_id,
        amount,
        currency,
        payment_method,
        status,
        description,
        idempotency_key,
        paid_at
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?),

      (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tenantId,
        leaseId,
        100000,
        'NGN',
        'BANK_TRANSFER',
        'PAID',
        'February 2026 rent',
        'seed-february-2026',
        '2026-02-05 10:00:00',

        tenantId,
        leaseId,
        100000,
        'NGN',
        'BANK_TRANSFER',
        'PAID',
        'March 2026 rent',
        'seed-march-2026',
        '2026-03-05 10:00:00'
      ]
    )

    console.log(
      'Database seed completed successfully.'
    )

    console.log('')
    console.log(
      'Development account'
    )

    console.log(
      'Email: tenant@example.com'
    )

    console.log(
      'Password: Password123!'
    )
  } catch (error) {
    console.error(
      'Seed failed:',
      error
    )

    process.exitCode = 1
  } finally {
    await db.end()
  }
}

seed()