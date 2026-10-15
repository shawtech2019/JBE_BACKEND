const db = require("../config/db");

/**
 * Notification channels/categories a user can toggle. Anything not present
 * in the stored JSON falls back to these defaults.
 */
const DEFAULT_NOTIFICATION_PREFERENCES = {
  email: true,
  sms: true,
  maintenance: true,
  payments: true,
  announcements: true,
  lease: true,
  visitors: true,
  // Landlord/investor notification categories.
  newRent: true,
  paymentDue: true,
  overdueRent: true,
};

/** MySQL may hand a JSON column back as a string; normalise it either way. */
const parseNotificationPreferences = (raw) => {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      value = null;
    }
  }
  if (!value || typeof value !== "object") value = {};
  return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...value };
};

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

  /** Store the hashed OTP issued during a two-factor login. */
  static async setLoginOtp(id, otp, expires) {
    await db.execute(
      `UPDATE users
       SET login_otp = ?, login_otp_expires = ?
       WHERE id = ?`,
      [otp, expires, id]
    );
  }

  static async clearLoginOtp(id) {
    await db.execute(
      `UPDATE users
       SET login_otp = NULL, login_otp_expires = NULL
       WHERE id = ?`,
      [id]
    );
  }

  static async setTwoFactorEnabled(id, enabled) {
    await db.execute("UPDATE users SET two_factor_enabled = ? WHERE id = ?", [
      enabled ? 1 : 0,
      id,
    ]);
  }

  static async updatePassword(id, passwordHash) {
    await db.execute(
      `UPDATE users
       SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL
       WHERE id = ?`,
      [passwordHash, id]
    );
  }

  /** Update any subset of the editable profile fields. */
  static async updateProfile(id, fields) {
    const columns = {
      first_name: fields.firstName,
      last_name: fields.lastName,
      phone: fields.phone,
      job_title: fields.jobTitle,
      company: fields.company,
      location: fields.location,
    };

    const sets = [];
    const values = [];

    for (const [column, value] of Object.entries(columns)) {
      if (value !== undefined) {
        sets.push(`${column} = ?`);
        values.push(value);
      }
    }

    if (!sets.length) return;

    values.push(id);
    await db.execute(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, values);
  }

  static async updateAvatar(id, avatarUrl) {
    await db.execute("UPDATE users SET avatar_url = ? WHERE id = ?", [
      avatarUrl,
      id,
    ]);
  }

  /**
   * Merge the provided notification preferences with whatever is stored.
   * Returns the full, merged preference object.
   */
  static async updateNotificationPreferences(id, prefs) {
    const user = await User.findById(id);
    const current = parseNotificationPreferences(user?.notification_preferences);
    const merged = { ...current, ...prefs };

    await db.execute(
      "UPDATE users SET notification_preferences = ? WHERE id = ?",
      [JSON.stringify(merged), id]
    );

    return merged;
  }

  static getDefaultNotificationPreferences() {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
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
      login_otp,
      login_otp_expires,
      ...safe
    } = user;
    return {
      id: safe.id,
      email: safe.email,
      firstName: safe.first_name,
      lastName: safe.last_name,
      fullName: `${safe.first_name ?? ""} ${safe.last_name ?? ""}`.trim(),
      phone: safe.phone ?? null,
      jobTitle: safe.job_title ?? null,
      company: safe.company ?? null,
      location: safe.location ?? null,
      avatarUrl: safe.avatar_url ?? null,
      notificationPreferences: parseNotificationPreferences(
        safe.notification_preferences
      ),
      isVerified: Boolean(safe.is_verified),
      twoFactorEnabled: Boolean(safe.two_factor_enabled),
      createdAt: safe.created_at,
      updatedAt: safe.updated_at,
    };
  }
}

module.exports = User;
