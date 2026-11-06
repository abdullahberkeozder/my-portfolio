-- ==============================================================================
-- FLYWAY MIGRATION V5: OAUTH2 & SOCIAL LOGIN SUPPORT
-- Author: Berke Özder
-- Description: Adds provider, provider_id, and image_url columns to users table
-- Compatible with PostgreSQL 16+ and H2 Database
-- ==============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_users_provider ON users (provider);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users (provider_id);

