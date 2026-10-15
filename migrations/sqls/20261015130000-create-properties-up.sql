-- Investor-owned property listings (Nigerian market).
-- Scalar listing fields are columns; multi-value fields (amenities, title
-- documents, images, videos) are stored as JSON arrays.
CREATE TABLE IF NOT EXISTS properties (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  owner_id BIGINT UNSIGNED NOT NULL,

  title VARCHAR(255) NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  description TEXT NULL,

  price DECIMAL(15,2) NULL,
  price_period VARCHAR(50) NULL,
  negotiable TINYINT(1) NOT NULL DEFAULT 1,
  service_charge DECIMAL(15,2) NULL,
  caution_deposit DECIMAL(15,2) NULL,
  agency_fee DECIMAL(6,2) NULL,
  legal_fee DECIMAL(6,2) NULL,

  bedrooms INT NULL,
  bathrooms INT NULL,
  toilets INT NULL,
  parking INT NULL,
  furnishing VARCHAR(50) NULL,
  condition_type VARCHAR(50) NULL,
  total_units INT NULL,
  floor_area DECIMAL(12,2) NULL,
  land_size DECIMAL(12,2) NULL,
  floors INT NULL,
  year_built INT NULL,

  country VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
  state VARCHAR(100) NULL,
  city VARCHAR(150) NULL,
  lga VARCHAR(150) NULL,
  estate VARCHAR(150) NULL,
  landmark VARCHAR(255) NULL,
  address VARCHAR(255) NULL,

  agent_name VARCHAR(150) NULL,
  agent_phone VARCHAR(30) NULL,
  agent_whatsapp VARCHAR(30) NULL,

  available_from DATE NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  featured TINYINT(1) NOT NULL DEFAULT 0,

  amenities JSON NULL,
  title_documents JSON NULL,
  images JSON NULL,
  videos JSON NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_property_owner
    FOREIGN KEY (owner_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  INDEX idx_properties_owner (owner_id),
  INDEX idx_properties_state (state),
  INDEX idx_properties_status (status)
);
