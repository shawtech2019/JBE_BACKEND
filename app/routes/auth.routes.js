const router = require("express").Router();

const auth = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const schema = require("../validators/auth.validator");
const { authenticate } = require("../middlewares/auth.middleware");

/* Public */
router.post("/register", validate(schema.registerSchema), auth.register);
router.post("/verify-account", validate(schema.verifyAccountSchema), auth.verifyAccount);
router.post("/resend-verification", validate(schema.emailSchema), auth.resendVerification);
router.post("/login", validate(schema.loginSchema), auth.login);
router.post(
  "/verify-login-otp",
  validate(schema.verifyLoginOtpSchema),
  auth.verifyLoginOtp
);
router.post("/resend-login-otp", validate(schema.emailSchema), auth.resendLoginOtp);
router.post("/forgot-password", validate(schema.emailSchema), auth.sendResetOTP);
router.post("/reset-password", validate(schema.resetOtpSchema), auth.resetPassword);

/* Authenticated */
router.get("/me", authenticate, auth.me);
router.post("/select-role", authenticate, validate(schema.selectRoleSchema), auth.selectRole);

module.exports = router;
