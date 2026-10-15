-- Restore the previous selectability defaults (all roles except admin).
UPDATE roles
  SET is_selectable = CASE
    WHEN slug = 'admin' THEN 0
    ELSE 1
  END;
