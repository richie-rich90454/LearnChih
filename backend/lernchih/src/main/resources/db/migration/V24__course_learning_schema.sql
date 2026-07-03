-- ============================================================
-- LernChih - Course Learning Schema Extensions
-- Flyway Migration V24
--
-- Adds tables needed for a richer course catalog:
--   - categories
--   - lessons
--   - enrollments
--   - course_tags
--   - course_reviews
-- ============================================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Extend courses with category, level, duration, instructor and metadata
ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS category_id BIGINT AFTER subject_id,
    ADD COLUMN IF NOT EXISTS description TEXT AFTER name,
    ADD COLUMN IF NOT EXISTS level       VARCHAR(20)  DEFAULT 'BEGINNER' AFTER description,
    ADD COLUMN IF NOT EXISTS duration_hours INT       DEFAULT 0 AFTER level,
    ADD COLUMN IF NOT EXISTS instructor_id BIGINT AFTER duration_hours,
    ADD COLUMN IF NOT EXISTS image_url   VARCHAR(500) AFTER instructor_id,
    ADD COLUMN IF NOT EXISTS updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE courses
    ADD CONSTRAINT fk_courses_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL;

ALTER TABLE courses
    ADD CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses (category_id);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses (level);

-- 3. Lessons
CREATE TABLE IF NOT EXISTS lessons (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id       BIGINT       NOT NULL,
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    video_url       VARCHAR(500),
    duration_minutes INT         DEFAULT 0,
    sort_order      INT          NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons (course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON lessons (course_id, sort_order);

-- 4. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT   NOT NULL,
    course_id        BIGINT   NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    progress_percent INT      NOT NULL DEFAULT 0,
    enrolled_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at     DATETIME,
    UNIQUE (user_id, course_id),
    CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments (course_id);

-- 5. Course-Tag relationships
CREATE TABLE IF NOT EXISTS course_tags (
    course_id BIGINT NOT NULL,
    tag_id    BIGINT NOT NULL,
    PRIMARY KEY (course_id, tag_id),
    CONSTRAINT fk_course_tags_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_course_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_course_tags_tag_id ON course_tags (tag_id);

-- 6. Course reviews / ratings
CREATE TABLE IF NOT EXISTS course_reviews (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id   BIGINT   NOT NULL,
    user_id     BIGINT   NOT NULL,
    rating      INT      NOT NULL,
    review_text TEXT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (course_id, user_id),
    CONSTRAINT fk_course_reviews_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_course_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews (course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews (user_id);
