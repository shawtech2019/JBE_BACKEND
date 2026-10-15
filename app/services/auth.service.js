const bcrypt = require("bcrypt");

const User = require("../models/User");
const Role = require("../models/Role");

const { generateOTP } = require("../utils/otp");
const { signToken } = require("../utils/jwt");
const { HttpError } = require("../utils/http-error");
const mailService = require("./mail.service");

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const splitName = (name = "") => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
};

const issueOtp = async (user, column) => {
  const otp = generateOTP();
  const expires = Date.now() + OTP_TTL_MS;
  const hashed = await bcrypt.hash(otp, 10);

  if (column === "reset") {
    await User.setResetOtp(user.id, hashed, expires);
  } else if (column === "login") {
    await User.setLoginOtp(user.id, hashed, expires);
  } else {
    await User.setVerificationOtp(user.id, hashed, expires);
  }

  return otp;
};

const sendOtpEmail = async ({ to, otp, firstName, purpose = "verification" }) => {
  try {
    await mailService.sendOtpEmail({ to, otp, firstName, purpose });
  } catch (error) {
    // Email delivery should never break the flow. In development the OTP is
    // logged (by the mail service) so it can still be used for manual testing.
    console.error(`[mail] failed to send OTP to ${to}:`, error.message);
  }
};

const otpMatches = async (otp, hashed) => {
  if (!hashed) return false;
  return bcrypt.compare(otp, hashed);
};

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */

exports.register = async ({ name, email, password }) => {
  const existing = await User.findByEmail(email);

  if (existing && existing.is_verified) {
    throw new HttpError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let user = existing;
  if (user) {
    // Re-registering an unverified account: refresh credentials + OTP.
    await User.updatePassword(user.id, passwordHash);
  } else {
    const { firstName, lastName } = splitName(name);
    const id = await User.create({ firstName, lastName, email, passwordHash });
    user = await User.findById(id);
  }

  const otp = await issueOtp(user, "verify");
  await sendOtpEmail({
    to: email,
    otp,
    firstName: user.first_name,
    purpose: "verification",
  });

  return { message: "Registered. Verify with the OTP sent to your email." };
};

exports.verifyEmailWithOTP = async (email, otp) => {
  const user = await User.findByEmail(email);
  if (!user) throw new HttpError(404, "Email not found");

  if (user.is_verified) {
    return { message: "Email already verified" };
  }

  if (!user.verification_otp || !user.verification_otp_expires) {
    throw new HttpError(400, "No verification code found. Request a new one.");
  }

  if (Date.now() > Number(user.verification_otp_expires)) {
    throw new HttpError(400, "Verification code has expired");
  }

  const matches = await otpMatches(otp, user.verification_otp);
  if (!matches) throw new HttpError(400, "Invalid verification code");

  await User.markVerified(user.id);
  return { message: "Email verified" };
};

exports.resendVerification = async (email) => {
  const user = await User.findByEmail(email);
  if (!user) throw new HttpError(404, "Email not found");
  if (user.is_verified) throw new HttpError(400, "Email is already verified");

  const otp = await issueOtp(user, "verify");
  await sendOtpEmail({
    to: email,
    otp,
    firstName: user.first_name,
    purpose: "verification",
  });

  return { message: "New verification code sent" };
};

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

/** Build the successful-login payload (token + user + roles). */
const buildLoginResult = async (user) => {
  const roles = await Role.forUser(user.id);

  // A user gets a token even without a role so the client can send them
  // through the "select a role" step. `requiresRoleSelection` tells them to.
  const token = signToken({ id: user.id, email: user.email });

  return {
    status: "success",
    token,
    user: User.toPublic(user),
    roles,
    requiresRoleSelection: roles.length === 0,
  };
};

exports.login = async (email, password) => {
  const user = await User.findByEmail(email);
  if (!user) throw new HttpError(401, "Invalid credentials");

  if (!user.is_verified) {
    throw new HttpError(403, "Please verify your email before logging in");
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new HttpError(401, "Invalid credentials");

  // Second factor: hold the session and email a one-time code instead of
  // handing back a token. The client finishes the login via verifyLoginOtp.
  if (user.two_factor_enabled) {
    const otp = await issueOtp(user, "login");
    await sendOtpEmail({
      to: email,
      otp,
      firstName: user.first_name,
      purpose: "login",
    });

    return {
      status: "success",
      requires2FA: true,
      email: user.email,
      message: "A login verification code has been sent to your email",
    };
  }

  return buildLoginResult(user);
};

/**
 * Complete a two-factor login with the emailed code, returning a real session.
 */
exports.verifyLoginOtp = async (email, otp) => {
  const user = await User.findByEmail(email);
  if (!user) throw new HttpError(404, "Email not found");

  if (!user.two_factor_enabled) {
    throw new HttpError(400, "Two-factor authentication is not enabled");
  }

  if (!user.login_otp || !user.login_otp_expires) {
    throw new HttpError(400, "No login code found. Please sign in again.");
  }

  if (Date.now() > Number(user.login_otp_expires)) {
    throw new HttpError(400, "Login code has expired. Please sign in again.");
  }

  const matches = await otpMatches(otp, user.login_otp);
  if (!matches) throw new HttpError(400, "Invalid login code");

  await User.clearLoginOtp(user.id);

  return buildLoginResult(user);
};

exports.resendLoginOtp = async (email) => {
  const user = await User.findByEmail(email);
  if (!user) throw new HttpError(404, "Email not found");

  if (!user.two_factor_enabled) {
    throw new HttpError(400, "Two-factor authentication is not enabled");
  }

  const otp = await issueOtp(user, "login");
  await sendOtpEmail({
    to: email,
    otp,
    firstName: user.first_name,
    purpose: "login",
  });

  return { message: "A new login code has been sent to your email" };
};

/* ------------------------------------------------------------------ */
/* Role selection (onboarding)                                         */
/* ------------------------------------------------------------------ */

exports.selectRole = async (userId, slug) => {
  const role = await Role.findBySlug(slug);
  if (!role) throw new HttpError(404, "Role not found");

  const current = await Role.forUser(userId);
  if (current.length > 0) {
    throw new HttpError(409, "A role has already been selected for this account");
  }

  await Role.assignToUser(userId, role.id);
  return Role.forUser(userId);
};

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

exports.getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");

  const roles = await Role.forUser(userId);
  return { user: User.toPublic(user), roles };
};

/* ------------------------------------------------------------------ */
/* Password reset                                                      */
/* ------------------------------------------------------------------ */

exports.sendResetOTP = async (email) => {
  const user = await User.findByEmail(email);
  if (!user) throw new HttpError(404, "Email not found");

  const otp = await issueOtp(user, "reset");
  await sendOtpEmail({
    to: email,
    otp,
    firstName: user.first_name,
    purpose: "reset",
  });

  return { message: "OTP has been sent to your email" };
};

exports.verifyOTPAndReset = async (email, otp, password) => {
  const user = await User.findByEmail(email);
  if (!user) throw new HttpError(404, "Email not found");

  if (!user.reset_otp || !user.reset_otp_expires) {
    throw new HttpError(400, "No reset code found. Request a new one.");
  }

  if (Date.now() > Number(user.reset_otp_expires)) {
    throw new HttpError(400, "Reset code has expired");
  }

  const matches = await otpMatches(otp, user.reset_otp);
  if (!matches) throw new HttpError(400, "Invalid or expired OTP");

  const passwordHash = await bcrypt.hash(password, 10);
  await User.updatePassword(user.id, passwordHash);

  return { message: "Password reset successful" };
};
