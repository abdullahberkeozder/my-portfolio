-- ==============================================================================
-- FLYWAY MIGRATION V4: SOFT DELETE SUPPORT
-- Author: Berke Özder
-- Description: Adds is_deleted and deleted_at columns with indexes for blogs and comments
-- Compatible with PostgreSQL 16+ and H2 Database
-- ==============================================================================

-- 1. BLOGS SOFT DELETE COLUMNS
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 2. COMMENTS SOFT DELETE COLUMNS
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 3. SOFT DELETE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_blogs_is_deleted ON blogs (is_deleted);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments (is_deleted);

