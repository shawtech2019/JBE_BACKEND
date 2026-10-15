ALTER TABLE users
  ADD COLUMN phone VARCHAR(30) NULL AFTER last_name,
  ADD COLUMN job_title VARCHAR(100) NULL AFTER phone,
  ADD COLUMN company VARCHAR(150) NULL AFTER job_title,
  ADD COLUMN location VARCHAR(150) NULL AFTER company,
  ADD COLUMN avatar_url VARCHAR(255) NULL AFTER location,
  ADD COLUMN notification_preferences JSON NULL AFTER avatar_url;
