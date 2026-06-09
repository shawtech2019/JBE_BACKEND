const pool = require("../config/db");
const bcrypt = require("bcrypt");

/* CREATE USER */
exports.createUser = async (user) => {
  const hashed = await bcrypt.hash(user.password, 10);

  await pool.query(
    `INSERT INTO users 
      (name, email, password, verification_otp, verification_otp_expires) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      user.name,
      user.email,
      hashed,
      user.verificationOtp || null,
      user.verificationOtpExpires || null,
    ]
  );
};

/* FIND USER BY EMAIL */
exports.findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};

/* VERIFY EMAIL WITH OTP */
exports.verifyEmailWithOTP = async (email, otp) => {
  const [rows] = await pool.query(
    "SELECT verification_otp, verification_otp_expires FROM users WHERE email = ?",
    [email]
  );

  if (!rows.length) return false;

  const user = rows[0];

  if (!user.verification_otp) return false;

  if (Date.now() > user.verification_otp_expires) return false;

  if (otp !== user.verification_otp) return false;

  await pool.query(
    "UPDATE users SET is_verified = 1, verification_otp = NULL, verification_otp_expires = NULL WHERE email = ?",
    [email]
  );

  return true;
};

/* SAVE VERIFICATION OTP (resend flow) */
// FIX: was missing entirely — needed for resendVerification controller
exports.saveVerificationOTP = async (email, otp, expires) => {
  const [results] = await pool.query(
    "UPDATE users SET verification_otp = ?, verification_otp_expires = ? WHERE email = ?",
    [otp, expires, email]
  );
  return results.affectedRows;
};

/* SAVE RESET OTP */
exports.saveOTP = async (email, otp, expires) => {
  const hashedOtp = await bcrypt.hash(otp, 10);

  const [results] = await pool.query(
    "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?",
    [hashedOtp, expires, email]
  );

  return results.affectedRows;
};

/* VERIFY OTP AND RESET PASSWORD */
exports.verifyOTPAndReset = async (email, otp, password) => {
  const [rows] = await pool.query(
    "SELECT reset_otp, reset_otp_expires FROM users WHERE email = ?",
    [email]
  );

  if (!rows.length) return false;

  const user = rows[0];

  if (Date.now() > user.reset_otp_expires) return false;

  const match = await bcrypt.compare(otp, user.reset_otp);
  if (!match) return false;

  const hashed = await bcrypt.hash(password, 10);

  await pool.query(
    "UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?",
    [hashed, email]
  );

  return true;
};