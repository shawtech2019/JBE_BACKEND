import mysql from 'mysql2/promise'
import { env } from '../config/env.js'

async function migrate() {
  console.log('Starting database migration...')

  const connection =
    await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD
    })

  try {
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\`
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci
    `)

    await connection.query(`
      USE \`${env.DB_NAME}\`
    `)

    /*
     * TENANTS
     */

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        email VARCHAR(255) NOT NULL UNIQUE,

        first_name VARCHAR(100) NOT NULL,

        last_name VARCHAR(100) NOT NULL,

        password_hash VARCHAR(255) NOT NULL,

        role ENUM(
          'TENANT',
          'LANDLORD',
          'PROPERTY_MANAGER',
          'ADMIN'
        ) NOT NULL DEFAULT 'TENANT',

        created_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    /*
     * LEASES
     */

    await connection.query(`
      CREATE TABLE IF NOT EXISTS leases (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        tenant_id BIGINT UNSIGNED NOT NULL,

        apartment VARCHAR(100) NOT NULL,

        unit VARCHAR(100) NOT NULL,

        monthly_rent DECIMAL(12,2) NOT NULL,

        lease_start_date DATE NOT NULL,

        lease_end_date DATE NOT NULL,

        status ENUM(
          'PENDING',
          'ACTIVE',
          'EXPIRED',
          'TERMINATED'
        ) NOT NULL DEFAULT 'PENDING',

        auto_pay_enabled BOOLEAN NOT NULL
          DEFAULT FALSE,

        created_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_lease_tenant
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE,

        INDEX idx_leases_tenant_status (
          tenant_id,
          status
        )
      )
    `)

    /*
     * PAYMENTS
     */

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        tenant_id BIGINT UNSIGNED NOT NULL,

        lease_id BIGINT UNSIGNED NOT NULL,

        amount DECIMAL(12,2) NOT NULL,

        currency CHAR(3) NOT NULL DEFAULT 'NGN',

        payment_method ENUM(
          'BANK_TRANSFER',
          'CARD',
          'CASH',
          'DIRECT_DEBIT',
          'ONLINE'
        ) NOT NULL,

        status ENUM(
          'PENDING',
          'PROCESSING',
          'PAID',
          'FAILED',
          'CANCELLED',
          'REFUNDED'
        ) NOT NULL DEFAULT 'PENDING',

        provider VARCHAR(50),

        provider_reference VARCHAR(255),

        idempotency_key VARCHAR(255)
          NOT NULL UNIQUE,

        description VARCHAR(255),

        paid_at DATETIME,

        created_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_payment_tenant
          FOREIGN KEY (tenant_id)
          REFERENCES tenants(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE,

        CONSTRAINT fk_payment_lease
          FOREIGN KEY (lease_id)
          REFERENCES leases(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE,

        INDEX idx_payments_tenant (
          tenant_id
        ),

        INDEX idx_payments_lease (
          lease_id
        ),

        INDEX idx_payments_status (
          status
        ),

        INDEX idx_provider_reference (
          provider_reference
        )
      )
    `)

    /*
     * MIGRATIONS
     */

    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        migration VARCHAR(255) NOT NULL UNIQUE,

        executed_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log(
      'Database migration completed successfully.'
    )
  } catch (error) {
    console.error(
      'Migration failed:',
      error
    )

    process.exitCode = 1
  } finally {
    await connection.end()
  }
}

migrate()