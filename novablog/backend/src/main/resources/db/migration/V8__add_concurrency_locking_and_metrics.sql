-- ==============================================================================
-- FLYWAY MIGRATION V8: CONCURRENCY OPTIMISTIC LOCKING & METRIC COUNTERS
-- Author: Berke Özder
-- Description: Adds version column for JPA Optimistic Locking and views_count/likes_count
-- Compatible with PostgreSQL 16+ and H2 Database
-- ==============================================================================

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS likes_count BIGINT DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blogs_views ON blogs (views_count DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_likes ON blogs (likes_count DESC);

