const db = require("../config/db");

/**
 * Role model.
 *
 * Roles live in their own table so admins can add more at runtime.
 * Users are linked to roles through the `user_roles` join table.
 */
const PUBLIC_COLUMNS =
  "id, slug, name, description, is_system, is_selectable";

class Role {
  /**
   * List roles.
   * @param {{ selectableOnly?: boolean }} [options]
   */
  static async all({ selectableOnly = false } = {}) {
    const where = selectableOnly ? "WHERE is_selectable = 1" : "";
    const [rows] = await db.execute(
      `SELECT ${PUBLIC_COLUMNS} FROM roles ${where} ORDER BY id ASC`
    );
    return rows;
  }

  static async findBySlug(slug) {
    const [rows] = await db.execute(
      "SELECT * FROM roles WHERE slug = ? LIMIT 1",
      [slug]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM roles WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0];
  }

  static async create({
    slug,
    name,
    description = null,
    isSystem = 0,
    isSelectable = 1,
  }) {
    const [result] = await db.execute(
      `INSERT INTO roles (slug, name, description, is_system, is_selectable)
       VALUES (?, ?, ?, ?, ?)`,
      [slug, name, description, isSystem, isSelectable]
    );
    return result.insertId;
  }

  static async remove(id) {
    const [result] = await db.execute("DELETE FROM roles WHERE id = ?", [id]);
    return result.affectedRows;
  }

  /** Roles assigned to a user. */
  static async forUser(userId) {
    const [rows] = await db.execute(
      `SELECT r.id, r.slug, r.name, r.description, r.is_system, r.is_selectable
       FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?
       ORDER BY r.id ASC`,
      [userId]
    );
    return rows;
  }

  /** Role slugs only — handy for JWT payloads / guards. */
  static async slugsForUser(userId) {
    const roles = await Role.forUser(userId);
    return roles.map((r) => r.slug);
  }

  static async assignToUser(userId, roleId) {
    await db.execute(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE assigned_at = assigned_at`,
      [userId, roleId]
    );
  }

  static async removeFromUser(userId, roleId) {
    const [result] = await db.execute(
      "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?",
      [userId, roleId]
    );
    return result.affectedRows;
  }

  static async userHasAnyRole(userId, slugs) {
    if (!slugs || slugs.length === 0) return true;
    const placeholders = slugs.map(() => "?").join(",");
    const [rows] = await db.execute(
      `SELECT 1
       FROM user_roles ur
       INNER JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = ? AND r.slug IN (${placeholders})
       LIMIT 1`,
      [userId, ...slugs]
    );
    return rows.length > 0;
  }
}

module.exports = Role;
