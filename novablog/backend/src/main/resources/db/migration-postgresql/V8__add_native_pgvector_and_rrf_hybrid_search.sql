-- ==============================================================================
-- FLYWAY MIGRATION V8 (POSTGRESQL): NATIVE PGVECTOR EXTENSION & RRF HYBRID SEARCH
-- Description: Enables vector extension, adds native_embedding vector(128) with HNSW index,
--              full-text search tsvector with GIN index, and automated database triggers.
-- ==============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add native 128-dimensional vector column to blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS native_embedding vector(128);

-- 3. Populate native_embedding from existing TEXT embedding if present
DO $$
BEGIN
    UPDATE blogs
    SET native_embedding = CAST(embedding AS vector)
    WHERE embedding IS NOT NULL AND embedding != '[]' AND embedding != '' AND native_embedding IS NULL;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 4. Create HNSW Index with Cosine Distance on native_embedding for millisecond vector lookups
CREATE INDEX IF NOT EXISTS idx_blogs_native_embedding_hnsw
ON blogs USING hnsw (native_embedding vector_cosine_ops);

-- 5. Automated trigger to synchronize native_embedding whenever embedding changes
CREATE OR REPLACE FUNCTION blogs_embedding_sync_trigger() RETURNS trigger AS $$
BEGIN
    IF NEW.embedding IS NOT NULL AND NEW.embedding != '' AND NEW.embedding != '[]' THEN
        BEGIN
            NEW.native_embedding := CAST(NEW.embedding AS vector);
        EXCEPTION
            WHEN OTHERS THEN
                NEW.native_embedding := NULL;
        END;
    ELSE
        NEW.native_embedding := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blogs_embedding_sync ON blogs;
CREATE TRIGGER trg_blogs_embedding_sync
    BEFORE INSERT OR UPDATE OF embedding ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION blogs_embedding_sync_trigger();

-- 6. Add Full-Text search tsvector column
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 7. Populate search_vector from header, title, and content
UPDATE blogs
SET search_vector = (
    setweight(to_tsvector('simple', coalesce(header, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(title, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'C')
);

-- 8. Create GIN index on search_vector
CREATE INDEX IF NOT EXISTS idx_blogs_search_vector_gin
ON blogs USING gin (search_vector);

-- 9. Create automatic trigger to maintain search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION blogs_search_vector_update_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', coalesce(NEW.header, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blogs_search_vector_update ON blogs;
CREATE TRIGGER trg_blogs_search_vector_update
    BEFORE INSERT OR UPDATE OF header, title, content ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION blogs_search_vector_update_trigger();
