CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  slug VARCHAR(50) NOT NULL UNIQUE,

  name VARCHAR(100) NOT NULL,

  description VARCHAR(255) NULL,

  is_system TINYINT(1) NOT NULL DEFAULT 0,

  is_selectable TINYINT(1) NOT NULL DEFAULT 1,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- SYSTEM ROLES
-- `is_system = 1`     -> cannot be deleted by admins.
-- `is_selectable = 1` -> offered on the signup role screen.
-- Admins can add more roles at runtime; new roles are
-- selectable and non-system by default.
-- ---------------------------------------------------------
INSERT INTO roles (slug, name, description, is_system, is_selectable) VALUES
  ('tenant',                 'Tenant / Resident',        'Pay rent, submit requests & receive announcements',           1, 1),
  ('investor',               'Investor',                'Track investments, returns & financial reports',              1, 1),
  ('facilities_maintenance', 'Facilities & Maintenance','Manage maintenance & other tasks',                            1, 1),
  ('vendor',                 'Vendors',                 'View assignments, jobs & update maintenance work status',     1, 1),
  ('sales_marketing',        'Sales & Marketing',       'Manage listings, leads & sales with rental codes',            1, 1),
  ('admin',                  'Administrator',           'Full platform access: users, roles, properties and settings', 1, 0)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  is_system = VALUES(is_system),
  is_selectable = VALUES(is_selectable);
