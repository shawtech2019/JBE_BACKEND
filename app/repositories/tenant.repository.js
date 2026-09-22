import { db } from '../config/database.js'

export async function findTenantByEmail(
  email
) {
  const [
    rows
  ] = await db.query(
    `
    SELECT
      id,
      email,
      first_name AS firstName,
      last_name AS lastName,
      password_hash AS passwordHash,
      role

    FROM tenants

    WHERE email = ?

    LIMIT 1
    `,
    [email]
  )

  return rows.length
    ? rows[0]
    : null
}

export async function findTenantById(
  id
) {
  const [
    rows
  ] = await db.query(
    `
    SELECT
      id,
      email,
      first_name AS firstName,
      last_name AS lastName,
      password_hash AS passwordHash,
      role

    FROM tenants

    WHERE id = ?

    LIMIT 1
    `,
    [id]
  )

  return rows.length
    ? rows[0]
    : null
}