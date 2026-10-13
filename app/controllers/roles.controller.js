const asyncHandler = require("../utils/async-handler");
const roleService = require("../services/role.service");

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

exports.listRoles = asyncHandler(async (req, res) => {
  const selectableOnly = req.query.selectable === "true";
  const roles = await roleService.listRoles({ selectableOnly });
  res.json({ status: "success", data: roles });
});

exports.getUserRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.getUserRoles(req.params.userId);
  res.json({ status: "success", data: roles });
});

/* ------------------------------------------------------------------ */
/* User <-> role assignment (admin)                                    */
/* ------------------------------------------------------------------ */

exports.assignRole = asyncHandler(async (req, res) => {
  const roles = await roleService.assignRoleToUser(
    req.params.userId,
    req.body.slug
  );
  res.json({ status: "success", data: roles });
});

exports.revokeRole = asyncHandler(async (req, res) => {
  const roles = await roleService.revokeRoleFromUser(
    req.params.userId,
    req.params.slug
  );
  res.json({ status: "success", data: roles });
});

/* ------------------------------------------------------------------ */
/* Role CRUD (admin)                                                   */
/* ------------------------------------------------------------------ */

exports.createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);
  res.status(201).json({ status: "success", data: role });
});

exports.deleteRole = asyncHandler(async (req, res) => {
  const result = await roleService.deleteRole(req.params.id);
  res.json({ status: "success", ...result });
});
