-- ==============================================================================
-- FLYWAY MIGRATION V8 (H2): FALLBACK COLUMNS FOR TEST AND DEV PROFILES
-- Description: Maintains schema parity for in-memory and embedded environments
-- ==============================================================================

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS native_embedding VARCHAR(2048);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS search_vector VARCHAR(2048);
