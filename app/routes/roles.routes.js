const router = require("express").Router();

const roles = require("../controllers/roles.controller");
const validate = require("../middlewares/validate.middleware");
const schema = require("../validators/role.validator");
const { authenticate, requireRole } = require("../middlewares/auth.middleware");

/* Public: the list is used to render the role-selection screen. */
router.get("/", roles.listRoles);

/* Authenticated: roles of a specific user. */
router.get("/users/:userId", authenticate, roles.getUserRoles);

/* Admin only: create / delete role definitions. */
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validate(schema.createRoleSchema),
  roles.createRole
);
router.delete("/:id", authenticate, requireRole("admin"), roles.deleteRole);

/* Admin only: grant / revoke a role on a user. */
router.post(
  "/users/:userId",
  authenticate,
  requireRole("admin"),
  validate(schema.assignRoleSchema),
  roles.assignRole
);
router.delete(
  "/users/:userId/:slug",
  authenticate,
  requireRole("admin"),
  roles.revokeRole
);

module.exports = router;
