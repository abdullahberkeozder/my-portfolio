-- ==============================================================================
-- FLYWAY MIGRATION V6: TWO-FACTOR AUTHENTICATION (2FA / MFA)
-- Author: Berke Özder
-- Description: Adds is_2fa_enabled, two_factor_secret, and backup_codes columns to users table
-- Compatible with PostgreSQL 16+ and H2 Database
-- ==============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes VARCHAR(1000);

CREATE INDEX IF NOT EXISTS idx_users_is_2fa_enabled ON users (is_2fa_enabled);

