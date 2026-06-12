-- ============================================================
-- OpenSolutions Forum - Initial Schema
-- Flyway Migration V1
-- ============================================================

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    email                   VARCHAR(255)    NOT NULL,
    password                VARCHAR(255)    NOT NULL,
    name                    VARCHAR(100),
    bio                     TEXT,
    role                    ENUM('STUDENT','MODERATOR','ADMIN') NOT NULL DEFAULT 'STUDENT',
    verified                BOOLEAN         NOT NULL DEFAULT FALSE,
    verification_code       VARCHAR(6),
    verification_code_expiry DATETIME,
    credits                 INT             NOT NULL DEFAULT 0,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (email)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. subjects
CREATE TABLE IF NOT EXISTS subjects (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. topics
CREATE TABLE IF NOT EXISTS topics (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    subject_id BIGINT       NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_topics_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_topics_subject_id ON topics (subject_id);

-- 4. courses
CREATE TABLE IF NOT EXISTS courses (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    subject_id BIGINT       NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_courses_subject_id ON courses (subject_id);

-- 5. resources
CREATE TABLE IF NOT EXISTS resources (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    category      ENUM('ARTICLE','VIDEO','PDF','GUIDE','LECTURE_RECORDING','OTHER') NOT NULL,
    type          ENUM('UPLOAD','LINK') NOT NULL,
    file_path     VARCHAR(500),
    external_url  VARCHAR(500),
    user_id       BIGINT       NOT NULL,
    subject_id    BIGINT,
    topic_id      BIGINT,
    course_id     BIGINT,
    upvote_count  INT          NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resources_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
    CONSTRAINT fk_resources_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL,
    CONSTRAINT fk_resources_topic   FOREIGN KEY (topic_id)   REFERENCES topics   (id) ON DELETE SET NULL,
    CONSTRAINT fk_resources_course  FOREIGN KEY (course_id)  REFERENCES courses  (id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_resources_user_id     ON resources (user_id);
CREATE INDEX idx_resources_subject_id  ON resources (subject_id);
CREATE INDEX idx_resources_category    ON resources (category);
CREATE INDEX idx_resources_created_at  ON resources (created_at);

-- 6. upvotes
CREATE TABLE IF NOT EXISTS upvotes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT   NOT NULL,
    resource_id BIGINT   NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, resource_id),
    CONSTRAINT fk_upvotes_user     FOREIGN KEY (user_id)     REFERENCES users     (id) ON DELETE CASCADE,
    CONSTRAINT fk_upvotes_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_upvotes_resource_id ON upvotes (resource_id);

-- 7. resource_threads
CREATE TABLE IF NOT EXISTS resource_threads (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT   NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (resource_id),
    CONSTRAINT fk_resource_threads_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 8. resource_posts
CREATE TABLE IF NOT EXISTS resource_posts (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    thread_id  BIGINT   NOT NULL,
    user_id    BIGINT   NOT NULL,
    content    TEXT     NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resource_posts_thread FOREIGN KEY (thread_id) REFERENCES resource_threads (id) ON DELETE CASCADE,
    CONSTRAINT fk_resource_posts_user   FOREIGN KEY (user_id)   REFERENCES users            (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_resource_posts_thread_id ON resource_posts (thread_id);
CREATE INDEX idx_resource_posts_user_id   ON resource_posts (user_id);

-- 9. channels
CREATE TABLE IF NOT EXISTS channels (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 10. channel_threads
CREATE TABLE IF NOT EXISTS channel_threads (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    channel_id BIGINT       NOT NULL,
    title      VARCHAR(255) NOT NULL,
    user_id    BIGINT       NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_channel_threads_channel FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_threads_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_channel_threads_channel_id ON channel_threads (channel_id);
CREATE INDEX idx_channel_threads_user_id    ON channel_threads (user_id);

-- 11. channel_posts
CREATE TABLE IF NOT EXISTS channel_posts (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    thread_id  BIGINT   NOT NULL,
    user_id    BIGINT   NOT NULL,
    content    TEXT     NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_channel_posts_thread FOREIGN KEY (thread_id) REFERENCES channel_threads (id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_posts_user   FOREIGN KEY (user_id)   REFERENCES users          (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_channel_posts_thread_id ON channel_posts (thread_id);
CREATE INDEX idx_channel_posts_user_id   ON channel_posts (user_id);

-- 12. reports
CREATE TABLE IF NOT EXISTS reports (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id  BIGINT NOT NULL,
    target_type  ENUM('RESOURCE','RESOURCE_POST','CHANNEL_POST') NOT NULL,
    target_id    BIGINT NOT NULL,
    reason       TEXT   NOT NULL,
    status       ENUM('PENDING','RESOLVED','DISMISSED') NOT NULL DEFAULT 'PENDING',
    resolved_by  BIGINT,
    resolved_at  DATETIME,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_reporter  FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_resolver  FOREIGN KEY (resolved_by) REFERENCES users (id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_reports_status      ON reports (status);
CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);

-- 13. user_socials
CREATE TABLE IF NOT EXISTS user_socials (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id  BIGINT       NOT NULL,
    platform VARCHAR(50)  NOT NULL,
    url      VARCHAR(500) NOT NULL,
    CONSTRAINT fk_user_socials_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_user_socials_user_id ON user_socials (user_id);

-- 14. user_subjects
CREATE TABLE IF NOT EXISTS user_subjects (
    user_id    BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, subject_id),
    CONSTRAINT fk_user_subjects_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
