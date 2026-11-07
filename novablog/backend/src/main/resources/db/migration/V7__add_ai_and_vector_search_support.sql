-- ==============================================================================
-- FLYWAY MIGRATION V7: AI SUMMARY, VECTOR EMBEDDINGS & AI CONTENT MODERATION
-- Author: Berke Özder
-- Description: Adds ai_summary and embedding to blogs, and AI moderation fields to comments
-- Compatible with PostgreSQL 16+ and H2 Database
-- ==============================================================================

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS embedding TEXT;

ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_ai_moderated BOOLEAN DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20) DEFAULT 'NEUTRAL';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS toxicity_score DOUBLE PRECISION DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS idx_comments_is_ai_moderated ON comments (is_ai_moderated);
