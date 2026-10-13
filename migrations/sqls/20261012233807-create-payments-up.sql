CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  tenant_id BIGINT UNSIGNED NOT NULL,

  lease_id BIGINT UNSIGNED NOT NULL,

  amount DECIMAL(12,2) NOT NULL,

  currency CHAR(3) NOT NULL DEFAULT 'NGN',

  payment_method ENUM(
    'BANK_TRANSFER',
    'CARD',
    'CASH',
    'DIRECT_DEBIT',
    'ONLINE'
  ) NOT NULL,

  status ENUM(
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
  ) NOT NULL DEFAULT 'PENDING',

  provider VARCHAR(50),

  provider_reference VARCHAR(255),

  idempotency_key VARCHAR(255) NOT NULL UNIQUE,

  description VARCHAR(255),

  paid_at DATETIME,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_payment_user
    FOREIGN KEY (tenant_id)
    REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_payment_lease
    FOREIGN KEY (lease_id)
    REFERENCES leases(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  INDEX idx_payments_tenant (tenant_id),

  INDEX idx_payments_lease (lease_id),

  INDEX idx_payments_status (status),

  INDEX idx_provider_reference (provider_reference)
);
