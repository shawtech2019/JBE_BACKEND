ALTER TABLE users
  DROP COLUMN login_otp_expires,
  DROP COLUMN login_otp,
  DROP COLUMN two_factor_enabled;
