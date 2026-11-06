-- ==============================================================================
-- FLYWAY MIGRATION V3: PERFORMANCE INDEXES
-- Author: Berke Özder
-- Description: Indexes for relational lookups, foreign keys, and search performance
-- ==============================================================================

-- 1. FOREIGN KEY INDEXES
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs (blog_category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs (author_user_id);
CREATE INDEX IF NOT EXISTS idx_comments_blog ON comments (blog_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments (user_id);

-- 2. LOOKUP AND SEARCH INDEXES
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);
CREATE INDEX IF NOT EXISTS idx_blogs_header ON blogs (header);

