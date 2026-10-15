-- Only Tenant and Investor are offered on the public signup role screen
-- (`is_selectable = 1`). Every other role is internal: it can only be
-- granted by an administrator, never self-selected during onboarding.
UPDATE roles
  SET is_selectable = CASE
    WHEN slug IN ('tenant', 'investor') THEN 1
    ELSE 0
  END;
