const Role = require("../models/Role");
const { HttpError } = require("../utils/http-error");

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

exports.listRoles = async ({ selectableOnly = false } = {}) => {
  return Role.all({ selectableOnly });
};

exports.getUserRoles = async (userId) => {
  return Role.forUser(userId);
};

/* ------------------------------------------------------------------ */
/* User <-> role assignment                                            */
/* ------------------------------------------------------------------ */

/**
 * Grant a role to a user (used when an admin adds an extra role).
 * Onboarding uses authService.selectRole, which allows exactly one.
 */
exports.assignRoleToUser = async (userId, slug) => {
  const role = await Role.findBySlug(slug);
  if (!role) throw new HttpError(404, "Role not found");

  await Role.assignToUser(userId, role.id);
  return Role.forUser(userId);
};

exports.revokeRoleFromUser = async (userId, slug) => {
  const role = await Role.findBySlug(slug);
  if (!role) throw new HttpError(404, "Role not found");

  const removed = await Role.removeFromUser(userId, role.id);
  if (!removed) throw new HttpError(404, "User does not have this role");

  return Role.forUser(userId);
};

/* ------------------------------------------------------------------ */
/* Role CRUD (admins)                                                  */
/* ------------------------------------------------------------------ */

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

exports.createRole = async ({ name, slug, description }) => {
  const finalSlug = toSlug(slug || name);
  if (!finalSlug) throw new HttpError(400, "A role name is required");

  const existing = await Role.findBySlug(finalSlug);
  if (existing) throw new HttpError(409, "A role with this name already exists");

  const id = await Role.create({
    slug: finalSlug,
    name,
    description: description || null,
    isSystem: 0,
  });

  return Role.findById(id);
};

exports.deleteRole = async (id) => {
  const role = await Role.findById(id);
  if (!role) throw new HttpError(404, "Role not found");
  if (role.is_system) {
    throw new HttpError(400, "System roles cannot be deleted");
  }

  await Role.remove(id);
  return { message: "Role deleted" };
};
