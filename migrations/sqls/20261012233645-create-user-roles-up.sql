CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  user_id BIGINT UNSIGNED NOT NULL,

  role_id INT UNSIGNED NOT NULL,

  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_user_role (user_id, role_id),

  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  INDEX idx_user_roles_user (user_id),

  INDEX idx_user_roles_role (role_id)
);
