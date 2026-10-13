const asyncHandler = require("../utils/async-handler");
const authService = require("../services/auth.service");

/* ------------------------------------------------------------------ */
/* Registration & verification                                         */
/* ------------------------------------------------------------------ */

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ status: "success", ...result });
});

exports.verifyAccount = asyncHandler(async (req, res) => {
  const { email, token } = req.body;
  const result = await authService.verifyEmailWithOTP(email, token);
  res.json({ status: "success", ...result });
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.body.email);
  res.json({ status: "success", ...result });
});

/* ------------------------------------------------------------------ */
/* Login / session                                                     */
/* ------------------------------------------------------------------ */

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

exports.me = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  res.json({ status: "success", ...data });
});

/* ------------------------------------------------------------------ */
/* Role selection (onboarding)                                         */
/* ------------------------------------------------------------------ */

exports.selectRole = asyncHandler(async (req, res) => {
  const roles = await authService.selectRole(req.user.id, req.body.slug);
  res.json({ status: "success", roles });
});

/* ------------------------------------------------------------------ */
/* Password reset                                                      */
/* ------------------------------------------------------------------ */

exports.sendResetOTP = asyncHandler(async (req, res) => {
  const result = await authService.sendResetOTP(req.body.email);
  res.json({ status: "success", ...result });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const result = await authService.verifyOTPAndReset(email, otp, password);
  res.json({ status: "success", ...result });
});
