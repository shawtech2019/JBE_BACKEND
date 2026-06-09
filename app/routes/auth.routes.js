const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const schema = require("../validators/auth.validator");

router.post("/register", validate(schema.registerSchema), auth.register);
router.post("/verify-account", validate(schema.verifyAccountSchema), auth.verifyAccount);
router.post("/resend-verification", validate(schema.emailSchema), auth.resendVerification);
router.post("/login", validate(schema.loginSchema), auth.login);
router.post("/forgot-password", validate(schema.emailSchema), auth.sendResetOTP);
router.post("/reset-password", validate(schema.resetOtpSchema), auth.resetPassword);

module.exports = router;