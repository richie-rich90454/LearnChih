-- ============================================================
-- LernChih Forum - Fix study_groups schema drift
-- Flyway Migration V23
--
-- V11 created study_groups/study_group_members with an older
-- schema (creator_id, role composite key) while V15 expected
-- the schema used by the JPA entities (owner_user_id, id,
-- joined_at). Because both migrations use CREATE TABLE IF NOT
-- EXISTS, a fresh database ends up with the V11 schema and the
-- Hibernate validation fails.
--
-- This migration idempotently reconciles the schema to match
-- the entities by renaming the columns only when the old
-- schema is present.
-- ============================================================

SET @db_name = DATABASE();

-- ------------------------------------------------------------
-- 1. Fix study_groups column name
-- ------------------------------------------------------------
SELECT COUNT(*) INTO @has_creator_id
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @db_name
  AND TABLE_NAME = 'study_groups'
  AND COLUMN_NAME = 'creator_id';

SET @fix_study_groups = IF(@has_creator_id > 0,
    'ALTER TABLE study_groups
        DROP FOREIGN KEY IF EXISTS fk_study_groups_creator,
        DROP INDEX IF EXISTS idx_study_groups_creator_id,
        CHANGE COLUMN creator_id owner_user_id BIGINT NOT NULL,
        ADD CONSTRAINT fk_study_groups_owner FOREIGN KEY (owner_user_id) REFERENCES users (id) ON DELETE CASCADE,
        ADD INDEX idx_study_groups_owner (owner_user_id)',
    'SELECT 1');

PREPARE stmt FROM @fix_study_groups;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 2. Fix study_group_members schema
-- ------------------------------------------------------------
SELECT COUNT(*) INTO @has_role
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @db_name
  AND TABLE_NAME = 'study_group_members'
  AND COLUMN_NAME = 'role';

SET @fix_members = IF(@has_role > 0,
    'ALTER TABLE study_group_members
        DROP FOREIGN KEY IF EXISTS fk_sgm_group,
        DROP FOREIGN KEY IF EXISTS fk_sgm_user,
        DROP PRIMARY KEY,
        ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST,
        ADD COLUMN joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        DROP COLUMN role,
        ADD UNIQUE KEY uk_study_group_members (group_id, user_id),
        ADD CONSTRAINT fk_study_group_members_group FOREIGN KEY (group_id) REFERENCES study_groups (id) ON DELETE CASCADE,
        ADD CONSTRAINT fk_study_group_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE',
    'SELECT 1');

PREPARE stmt FROM @fix_members;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
