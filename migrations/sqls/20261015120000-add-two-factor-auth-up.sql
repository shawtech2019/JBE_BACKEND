-- Two-factor authentication (email OTP) support.
-- `two_factor_enabled` turns the second login step on for a user.
-- `login_otp` / `login_otp_expires` hold the hashed code issued during login.
ALTER TABLE users
  ADD COLUMN two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER is_verified,
  ADD COLUMN login_otp VARCHAR(255) NULL,
  ADD COLUMN login_otp_expires BIGINT NULL;
