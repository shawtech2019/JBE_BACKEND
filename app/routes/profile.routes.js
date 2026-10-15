const express = require("express");
const router = express.Router();

const profile = require("../controllers/profile.controller");
const validate = require("../middlewares/validate.middleware");
const schema = require("../validators/profile.validator");
const { authenticate } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Every profile route requires a signed-in user.
router.use(authenticate);

router.get("/", profile.getProfile);
router.put("/", validate(schema.updateProfileSchema), profile.updateProfile);

router.get("/notifications", profile.getNotifications);
router.put(
  "/notifications",
  validate(schema.updateNotificationsSchema),
  profile.updateNotifications
);

router.post("/avatar", upload.single("avatar"), profile.updateAvatar);

router.put(
  "/security",
  validate(schema.securitySchema),
  profile.updateSecurity
);

module.exports = router;
