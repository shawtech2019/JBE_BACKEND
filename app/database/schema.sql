CREATE DATABASE IF NOT EXISTS rent_payment;

USE rent_payment;

-- ==========================================
-- LEASES
-- ==========================================

CREATE TABLE IF NOT EXISTS leases (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    tenant_id VARCHAR(100) NOT NULL,

    apartment VARCHAR(100) NOT NULL,

    unit VARCHAR(100) NOT NULL,

    monthly_rent DECIMAL(12, 2) NOT NULL DEFAULT 0,

    lease_start_date DATE NOT NULL,

    lease_end_date DATE NOT NULL,

    total_lease_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

    total_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,

    status ENUM(
        'Active',
        'Expired',
        'Pending',
        'Terminated'
    ) NOT NULL DEFAULT 'Active',

    auto_pay BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_leases_tenant_id (tenant_id)
);


-- ==========================================
-- PAYMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    tenant_id VARCHAR(100) NOT NULL,

    lease_id INT UNSIGNED NOT NULL,

    amount DECIMAL(12, 2) NOT NULL,

    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    payment_method ENUM(
        'Bank Transfer',
        'Card',
        'Cash',
        'Direct Debit',
        'Online Payment'
    ) NOT NULL,

    reference VARCHAR(150) NOT NULL UNIQUE,

    status ENUM(
        'Pending',
        'Paid',
        'Failed',
        'Cancelled'
    ) NOT NULL DEFAULT 'Pending',

    description VARCHAR(255) DEFAULT 'Rent payment',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_payments_tenant_id (tenant_id),

    INDEX idx_payments_lease_id (lease_id),

    CONSTRAINT fk_payment_lease
        FOREIGN KEY (lease_id)
        REFERENCES leases(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);