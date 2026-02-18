const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.createUser = async (user) => {
  const hashed = await bcrypt.hash(user.password, 10);

  await pool.query(
    "INSERT INTO users (name, email, password, verification_token) VALUES (?, ?, ?, ?)",
    [user.name, user.email, hashed, user.token || null]
  );
};

exports.findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email=?",
    [email]
  );
  return rows[0];
};

exports.verifyEmail = async (token) => {
  const [results] = await pool.query(
    "UPDATE users SET is_verified=1, verification_token=NULL WHERE verification_token=?",
    [token]
  );
  return results.affectedRows;
};

exports.saveOTP = async (email, otp, expires) => {
  const hashedOtp = await bcrypt.hash(otp, 10);

  const [results] = await pool.query(
    "UPDATE users SET reset_otp=?, reset_otp_expires=? WHERE email=?",
    [hashedOtp, expires, email]
  );

  return results.affectedRows;
};

exports.verifyOTPAndReset = async (email, otp, password) => {
  const [rows] = await pool.query(
    "SELECT reset_otp, reset_otp_expires FROM users WHERE email=?",
    [email]
  );

  if (!rows.length) return false;

  const user = rows[0];

  if (Date.now() > user.reset_otp_expires) return false;

  const match = await bcrypt.compare(otp, user.reset_otp);
  if (!match) return false;

  const hashed = await bcrypt.hash(password, 10);

  await pool.query(
    "UPDATE users SET password=?, reset_otp=NULL, reset_otp_expires=NULL WHERE email=?",
    [hashed, email]
  );

  return true;
};
