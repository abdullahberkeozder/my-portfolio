-- ==============================================================================
-- FLYWAY MIGRATION V2: SEED FOUNDATIONAL ROLES AND CORE CATEGORIES
-- Author: Berke Özder
-- Description: Inserts default system roles, categories, and initial tags
-- ==============================================================================

-- 1. SEED DEFAULT ROLES
INSERT INTO roles (role_name, created_by, created_date)
VALUES 
    ('ROLE_USER', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP),
    ('ROLE_ADMIN', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP),
    ('ROLE_SUPER_ADMIN', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP);

-- 2. SEED DEFAULT CATEGORIES
INSERT INTO blog_categories (category_name, created_by, created_date)
VALUES 
    ('Yazılım Mimarisi', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP),
    ('Bulut ve DevOps', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP),
    ('Siber Güvenlik', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP);

-- 3. SEED DEFAULT TAGS
INSERT INTO tags (name, created_by, created_date)
VALUES 
    ('java', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP),
    ('spring-boot', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP),
    ('postgresql', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP),
    ('docker', 'SYSTEM_MIGRATION', CURRENT_TIMESTAMP);

