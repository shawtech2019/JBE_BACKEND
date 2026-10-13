const db = require("../config/db");

/**
 * Central users table.
 *
 * A user has NO role at registration time. Roles are attached after the
 * account is verified, via the `user_roles` join table (see Role model).
 */
class User {
  static async create({
    firstName,
    lastName,
    email,
    passwordHash,
    verificationOtp = null,
    verificationOtpExpires = null,
  }) {
    const [result] = await db.execute(
      `INSERT INTO users
        (email, first_name, last_name, password_hash, is_verified,
         verification_otp, verification_otp_expires)
       VALUES (?, ?, ?, ?, 0, ?, ?)`,
      [
        email,
        firstName,
        lastName,
        passwordHash,
        verificationOtp,
        verificationOtpExpires,
      ]
    );

    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0];
  }

  static async find() {
    const [rows] = await db.execute(
      `SELECT id, email, first_name, last_name, is_verified, created_at, updated_at
       FROM users ORDER BY id ASC`
    );
    return rows;
  }

  static async findOne(query) {
    const conditions = [];
    const values = [];
    for (const key in query) {
      conditions.push(`${key} = ?`);
      values.push(query[key]);
    }
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE ${conditions.join(" AND ")} LIMIT 1`,
      values
    );
    return rows[0];
  }

  static async setVerificationOtp(id, otp, expires) {
    await db.execute(
      `UPDATE users
       SET verification_otp = ?, verification_otp_expires = ?
       WHERE id = ?`,
      [otp, expires, id]
    );
  }

  static async markVerified(id) {
    await db.execute(
      `UPDATE users
       SET is_verified = 1, verification_otp = NULL, verification_otp_expires = NULL
       WHERE id = ?`,
      [id]
    );
  }

  static async setResetOtp(id, otp, expires) {
    await db.execute(
      `UPDATE users
       SET reset_otp = ?, reset_otp_expires = ?
       WHERE id = ?`,
      [otp, expires, id]
    );
  }

  static async updatePassword(id, passwordHash) {
    await db.execute(
      `UPDATE users
       SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL
       WHERE id = ?`,
      [passwordHash, id]
    );
  }

  /** Strip sensitive columns before returning a user to the client. */
  static toPublic(user) {
    if (!user) return null;
    const {
      password_hash,
      verification_otp,
      verification_otp_expires,
      reset_otp,
      reset_otp_expires,
      ...safe
    } = user;
    return {
      id: safe.id,
      email: safe.email,
      firstName: safe.first_name,
      lastName: safe.last_name,
      fullName: `${safe.first_name} ${safe.last_name}`.trim(),
      isVerified: Boolean(safe.is_verified),
      createdAt: safe.created_at,
      updatedAt: safe.updated_at,
    };
  }
}

module.exports = User;
