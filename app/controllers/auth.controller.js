const { signToken } = require("../utils/jwt");
const { generateOTP } = require("../utils/otp");
const authService = require("../services/auth.service");
const mailer  =  require("../config/mail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

/* REGISTER SECTION */
exports.register = async (req, res) => {
  try {
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;

    await authService.createUser({
      ...req.body,
      verificationOtp: otp,
      verificationOtpExpires: expires,
    });

    await mailer.sendMail({
      to: req.body.email,
      subject: "Verify your email",
      html: `<h2>${otp}</h2><p>Valid for 10 minutes</p>`,
    });

    res.status(201).json({
      status: "success",
      message: "Registered. Verify with the OTP sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


/* VERIFY ACCOUNT SECTION */
// POST /verify-account  ← matches frontend call
exports.verifyAccount = async (req, res) => {
  try {
    const { email, token } = req.body; // frontend sends { email, token }

    const verified = await authService.verifyEmailWithOTP(email, token);
    if (!verified)
      return res.status(400).json({ status: "error", message: "Invalid or expired OTP" });

    res.json({ status: "success", message: "Email verified" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


/* RESEND VERIFICATION SECTION */
// POST /resend-verification  ← matches frontend call
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;

    const saved = await authService.saveVerificationOTP(email, otp, expires);
    if (!saved)
      return res.status(404).json({ status: "error", message: "Email not found" });

    await mailer.sendMail({
      to: email,
      subject: "Verify your email",
      html: `<h2>${otp}</h2><p>Valid for 10 minutes</p>`,
    });

    res.json({ status: "success", message: "New verification code sent" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


/* LOGIN SECTION */
exports.login = async (req, res) => {
  try {
    const user = await authService.findUserByEmail(req.body.email);
    if (!user || !user.is_verified)
      return res.status(401).json({ status: "error", message: "Invalid credentials" });

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match)
      return res.status(401).json({ status: "error", message: "Invalid credentials" });

    const token = signToken({ id: user.id });
    res.json({ status: "success", token });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


/* SEND RESET OTP SECTION */
exports.sendResetOTP = async (req, res) => {
  try {
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;

    const saved = await authService.saveOTP(req.body.email, otp, expires);
    if (!saved)
      return res.status(404).json({ status: "error", message: "Email not found" });

    // FIX: was mailer.sendmail (lowercase m) → mailer.sendMail
    await mailer.sendMail({
      to: req.body.email,
      subject: "Password Reset OTP",
      html: `<h2>${otp}</h2><p>Valid for 10 minutes</p>`,
    });

    res.json({ status: "success", message: "OTP has been sent to your email" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


/* VERIFY OTP AND RESET SECTION */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const success = await authService.verifyOTPAndReset(email, otp, password);
    if (!success)
      return res.status(400).json({ status: "error", message: "Invalid or expired OTP" });

    res.json({ status: "success", message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

