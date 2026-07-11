-- ============================================================
-- LernChih - Course Prerequisite Graph (F19)
-- Flyway Migration V20260709010004
-- ============================================================
-- A directed edge from a course to one of its prerequisite
-- courses. A course is "unlocked" for a user only when every
-- prerequisite course has been fully completed (all of its
-- modules marked complete). The unique constraint prevents
-- duplicate edges; the check constraint prevents a course from
-- being its own prerequisite. Cycles are rejected in the
-- service layer so the graph stays a DAG.
-- ============================================================

CREATE TABLE IF NOT EXISTS course_prerequisites (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id               BIGINT NOT NULL,
    prerequisite_course_id  BIGINT NOT NULL,
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_prereq_course FOREIGN KEY (course_id)
        REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_course_prereq_prereq FOREIGN KEY (prerequisite_course_id)
        REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT uk_course_prereq UNIQUE (course_id, prerequisite_course_id),
    CONSTRAINT chk_no_self_prereq CHECK (course_id <> prerequisite_course_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_course_prereq_course ON course_prerequisites (course_id);
CREATE INDEX idx_course_prereq_prereq ON course_prerequisites (prerequisite_course_id);
