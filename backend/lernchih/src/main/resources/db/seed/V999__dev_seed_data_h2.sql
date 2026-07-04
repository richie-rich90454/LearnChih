-- ============================================================
-- LernChih Forum - Development Seed Data (H2-compatible)
-- Flyway-compatible seed script (Task 10.4 / Spec I108)
--
-- H2 variant of V999__dev_seed_data.sql: replaces MySQL interval syntax
-- with DATEADD and omits tables not present in the current Hibernate schema.
--
-- This script is executed only when the Spring Boot `dev` profile
-- is active, via DevDataSeeder. It is intentionally kept separate
-- from db/migration so it never runs in production or test.
--
-- Data set:
--   - 8 demo users (all passwords are "password123")
--   - 8 subjects with topics and courses
--   - 15 resources across categories
--   - 4 channels with threads and posts
--   - Tags, upvotes, notifications, badges, user subjects/socials, study groups
--
-- All INSERT statements use INSERT IGNORE or are otherwise guarded
-- so the script can be re-run on startup without errors.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. Users
-- All demo accounts use the bcrypt hash for "password123".
-- ------------------------------------------------------------
INSERT IGNORE INTO users (id, email, password, name, bio, role, verified, credits, email_notifications_enabled, totp_enabled, created_at, updated_at) VALUES
(1, 'alice@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Alice Chen',      'Computer science student and open-source contributor.', 'ADMIN',      TRUE, 1000, TRUE, FALSE, DATEADD('DAY', -60, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(2, 'bob@example.com',    '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Bob Smith',       'Math tutor and lifelong learner.',                       'MODERATOR',  TRUE,  520, TRUE, FALSE, DATEADD('DAY', -45, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP)),
(3, 'carol@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Carol Wu',        'Biology major interested in genetics.',                  'STUDENT',    TRUE,  340, TRUE, FALSE, DATEADD('DAY', -30, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP)),
(4, 'dave@example.com',   '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Dave Miller',     'Physics enthusiast and lab assistant.',                    'STUDENT',    TRUE,  210, TRUE, FALSE, DATEADD('DAY', -25, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP)),
(5, 'eve@example.com',    '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Eve Johnson',     'History buff and essay writer.',                           'STUDENT',    TRUE,  180, TRUE, FALSE, DATEADD('DAY', -20, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP)),
(6, 'frank@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Frank Li',        'Software engineer learning Mandarin.',                     'STUDENT',    TRUE,   95, TRUE, FALSE, DATEADD('DAY', -15, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP)),
(7, 'grace@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Grace Park',      'High-school student, art and design.',                     'STUDENT',    TRUE,   60, TRUE, FALSE, DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP)),
(8, 'henry@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Henry Brown',     'Newcomer exploring the platform.',                         'STUDENT',    TRUE,   10, TRUE, FALSE, DATEADD('DAY', -5, CURRENT_TIMESTAMP),  DATEADD('DAY', -8, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 2. Subjects
-- ------------------------------------------------------------
INSERT IGNORE INTO subjects (id, name, created_at) VALUES
(1, 'Mathematics',       DATEADD('DAY', -60, CURRENT_TIMESTAMP)),
(2, 'Computer Science',  DATEADD('DAY', -60, CURRENT_TIMESTAMP)),
(3, 'Biology',           DATEADD('DAY', -60, CURRENT_TIMESTAMP)),
(4, 'Physics',           DATEADD('DAY', -60, CURRENT_TIMESTAMP)),
(5, 'History',           DATEADD('DAY', -60, CURRENT_TIMESTAMP)),
(6, 'Chemistry',         DATEADD('DAY', -60, CURRENT_TIMESTAMP)),
(7, 'Literature',        DATEADD('DAY', -60, CURRENT_TIMESTAMP)),
(8, 'Art & Design',      DATEADD('DAY', -60, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 3. Topics
-- ------------------------------------------------------------
INSERT IGNORE INTO topics (id, name, subject_id, created_at) VALUES
(1, 'Calculus',          1, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(2, 'Linear Algebra',    1, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(3, 'Algorithms',        2, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(4, 'Machine Learning',  2, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(5, 'Genetics',          3, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(6, 'Ecology',           3, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(7, 'Quantum Mechanics', 4, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(8, 'Classical Mechanics', 4, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(9, 'World War II',      5, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(10, 'Organic Chemistry', 6, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(11, 'Shakespeare',       7, DATEADD('DAY', -55, CURRENT_TIMESTAMP)),
(12, 'Typography',        8, DATEADD('DAY', -55, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 4. Courses
-- ------------------------------------------------------------
INSERT IGNORE INTO courses (id, name, subject_id, created_at) VALUES
(1, 'Intro to Calculus',        1, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(2, 'Advanced Linear Algebra',  1, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(3, 'Data Structures',          2, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(4, 'Intro to ML',              2, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(5, 'Molecular Biology',        3, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(6, 'General Physics I',        4, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(7, 'Modern European History',  5, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(8, 'Creative Writing',         7, DATEADD('DAY', -50, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 5. Resources
-- ------------------------------------------------------------
INSERT IGNORE INTO resources (id, slug, title, description, category, type, external_url, user_id, subject_id, topic_id, course_id, upvote_count, created_at, updated_at) VALUES
(1,  'intro-to-calculus-notes',           'Intro to Calculus Notes',          'Comprehensive notes covering limits, derivatives, and integrals.', 'PDF',       'LINK', 'https://example.com/calc-notes.pdf',           2, 1, 1, 1, 5, DATEADD('DAY', -40, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP)),
(2,  'linear-algebra-cheatsheet',         'Linear Algebra Cheatsheet',        'Quick reference for vectors, matrices, and eigenvalues.',        'PDF',       'LINK', 'https://example.com/linalg-cheatsheet.pdf',    2, 1, 2, 2, 4, DATEADD('DAY', -38, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP)),
(3,  'sorting-algorithms-video',          'Sorting Algorithms Explained',     'Visual explanation of common sorting algorithms.',               'VIDEO',     'LINK', 'https://example.com/sorting-video',            3, 2, 3, 3, 6, DATEADD('DAY', -35, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(4,  'ml-intro-guide',                    'Machine Learning Intro Guide',     'A beginner-friendly guide to supervised learning.',              'GUIDE',     'LINK', 'https://example.com/ml-intro',                 3, 2, 4, 4, 7, DATEADD('DAY', -33, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP)),
(5,  'genetics-article',                  'Genetics Fundamentals',            'Article explaining DNA, RNA, and protein synthesis.',            'ARTICLE',   'LINK', 'https://example.com/genetics-article',         4, 3, 5, 5, 3, DATEADD('DAY', -30, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP)),
(6,  'quantum-lecture-recording',         'Quantum Mechanics Lecture',        'Recorded lecture on wave-particle duality.',                     'LECTURE_RECORDING', 'LINK', 'https://example.com/quantum-lecture',  4, 4, 7, 6, 4, DATEADD('DAY', -28, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP)),
(7,  'wwii-timeline',                     'World War II Timeline',            'Interactive timeline of major WWII events.',                     'GUIDE',     'LINK', 'https://example.com/wwii-timeline',            5, 5, 9, 7, 2, DATEADD('DAY', -25, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP)),
(8,  'organic-chemistry-lab',             'Organic Chemistry Lab Manual',     'Step-by-step lab manual for common reactions.',                  'PDF',       'LINK', 'https://example.com/orgchem-lab.pdf',          6, 6, 10, NULL, 3, DATEADD('DAY', -22, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP)),
(9,  'shakespeare-analysis',              'Shakespeare Analysis',             'Critical analysis of Hamlet and Macbeth.',                       'ARTICLE',   'LINK', 'https://example.com/shakespeare-analysis',     5, 7, 11, 8, 4, DATEADD('DAY', -20, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP)),
(10, 'typography-basics',                 'Typography Basics',                'Introduction to typography and font pairing.',                   'GUIDE',     'LINK', 'https://example.com/typography-basics',        7, 8, 12, NULL, 2, DATEADD('DAY', -18, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP)),
(11, 'python-data-science-notebook',      'Python Data Science Notebook',     'Jupyter notebook with pandas and matplotlib examples.',          'OTHER',     'LINK', 'https://example.com/py-ds-notebook',           3, 2, 3, 3, 5, DATEADD('DAY', -15, CURRENT_TIMESTAMP), DATEADD('DAY', -11, CURRENT_TIMESTAMP)),
(12, 'cell-biology-slides',               'Cell Biology Slides',              'Lecture slides covering cell structure and function.',           'PDF',       'LINK', 'https://example.com/cell-bio-slides.pdf',      4, 3, 6, 5, 1, DATEADD('DAY', -12, CURRENT_TIMESTAMP), DATEADD('DAY', -12, CURRENT_TIMESTAMP)),
(13, 'classical-mechanics-problems',      'Classical Mechanics Problems',     'Practice problem set with solutions.',                           'PDF',       'LINK', 'https://example.com/mechanics-problems.pdf',   4, 4, 8, 6, 3, DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP)),
(14, 'creative-writing-prompts',          'Creative Writing Prompts',         'A collection of prompts to spark writing ideas.',                'ARTICLE',   'LINK', 'https://example.com/writing-prompts',          5, 7, 11, 8, 2, DATEADD('DAY', -8, CURRENT_TIMESTAMP),  DATEADD('DAY', -14, CURRENT_TIMESTAMP)),
(15, 'design-system-checklist',           'Design System Checklist',          'Checklist for building consistent design systems.',              'GUIDE',     'LINK', 'https://example.com/design-checklist',         7, 8, 12, NULL, 4, DATEADD('DAY', -5, CURRENT_TIMESTAMP),  DATEADD('DAY', -15, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 6. Resource Threads & Posts
-- ------------------------------------------------------------
INSERT IGNORE INTO resource_threads (id, resource_id, content, format, created_at) VALUES
(1, 1,  'Discussion thread for calculus notes.',       'PLAIN', DATEADD('DAY', -40, CURRENT_TIMESTAMP)),
(2, 3,  'Questions and answers about sorting algorithms.', 'PLAIN', DATEADD('DAY', -35, CURRENT_TIMESTAMP)),
(3, 5,  'Discussion for genetics fundamentals.',         'PLAIN', DATEADD('DAY', -30, CURRENT_TIMESTAMP)),
(4, 7,  'Discussion for WWII timeline.',                 'PLAIN', DATEADD('DAY', -25, CURRENT_TIMESTAMP)),
(5, 11, 'Discussion for Python data science notebook.',  'PLAIN', DATEADD('DAY', -15, CURRENT_TIMESTAMP));

INSERT IGNORE INTO resource_posts (id, thread_id, user_id, content, format, created_at, updated_at) VALUES
(1, 1, 3, 'Thanks for sharing these notes! The section on limits was especially helpful.', 'PLAIN', DATEADD('DAY', -39, CURRENT_TIMESTAMP), DATEADD('DAY', -39, CURRENT_TIMESTAMP)),
(2, 1, 4, 'Could you add more examples on implicit differentiation?', 'PLAIN', DATEADD('DAY', -38, CURRENT_TIMESTAMP), DATEADD('DAY', -38, CURRENT_TIMESTAMP)),
(3, 2, 5, 'Great visual explanation. Quick sort is now much clearer.', 'PLAIN', DATEADD('DAY', -34, CURRENT_TIMESTAMP), DATEADD('DAY', -34, CURRENT_TIMESTAMP)),
(4, 3, 6, 'This article really helped me understand transcription. Thanks!', 'PLAIN', DATEADD('DAY', -29, CURRENT_TIMESTAMP), DATEADD('DAY', -29, CURRENT_TIMESTAMP)),
(5, 4, 2, 'Would be nice to include Pacific theater events too.', 'PLAIN', DATEADD('DAY', -24, CURRENT_TIMESTAMP), DATEADD('DAY', -24, CURRENT_TIMESTAMP)),
(6, 5, 8, 'The matplotlib examples are super useful.', 'PLAIN', DATEADD('DAY', -14, CURRENT_TIMESTAMP), DATEADD('DAY', -14, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 7. Channels
-- ------------------------------------------------------------
INSERT IGNORE INTO channels (id, name, description, created_at, slug) VALUES
(1, 'General Discussion', 'Open channel for anything related to learning.', DATEADD('DAY', -60, CURRENT_TIMESTAMP), 'general-discussion'),
(2, 'Study Help',         'Ask questions and get help from the community.', DATEADD('DAY', -55, CURRENT_TIMESTAMP), 'study-help'),
(3, 'Resource Sharing',   'Share and discover new learning resources.',     DATEADD('DAY', -50, CURRENT_TIMESTAMP), 'resource-sharing'),
(4, 'Career & Internships', 'Discuss career paths, internships, and jobs.', DATEADD('DAY', -45, CURRENT_TIMESTAMP), 'career-internships');

-- ------------------------------------------------------------
-- 8. Channel Threads & Posts
-- ------------------------------------------------------------
INSERT IGNORE INTO channel_threads (id, channel_id, title, user_id, content, format, created_at) VALUES
(1, 1, 'Welcome to LernChih!',            1, 'Introduce yourself and say hello to the community.', 'PLAIN', DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(2, 2, 'Best resources for Calculus?',    3, 'Looking for recommended resources to study calculus.', 'PLAIN', DATEADD('DAY', -40, CURRENT_TIMESTAMP)),
(3, 3, 'Weekly resource roundup',         2, 'Share your favorite resource of the week here.',     'PLAIN', DATEADD('DAY', -30, CURRENT_TIMESTAMP)),
(4, 4, 'Internship application tips',     5, 'What are your tips for landing a summer internship?', 'PLAIN', DATEADD('DAY', -20, CURRENT_TIMESTAMP)),
(5, 2, 'How to stay motivated?',          7, 'Struggling to stay consistent. Any advice?',         'PLAIN', DATEADD('DAY', -10, CURRENT_TIMESTAMP));

INSERT IGNORE INTO channel_posts (id, thread_id, user_id, content, format, created_at, updated_at) VALUES
(1, 1, 2, 'Hi everyone! Excited to be here.', 'PLAIN', DATEADD('DAY', -49, CURRENT_TIMESTAMP), DATEADD('DAY', -49, CURRENT_TIMESTAMP)),
(2, 1, 3, 'Hello! Looking forward to learning together.', 'PLAIN', DATEADD('DAY', -48, CURRENT_TIMESTAMP), DATEADD('DAY', -48, CURRENT_TIMESTAMP)),
(3, 2, 2, 'I recommend the Intro to Calculus Notes resource.', 'PLAIN', DATEADD('DAY', -39, CURRENT_TIMESTAMP), DATEADD('DAY', -39, CURRENT_TIMESTAMP)),
(4, 2, 4, 'Khan Academy is also great for visual learners.', 'PLAIN', DATEADD('DAY', -38, CURRENT_TIMESTAMP), DATEADD('DAY', -38, CURRENT_TIMESTAMP)),
(5, 3, 3, 'This week I really liked the ML Intro Guide.', 'PLAIN', DATEADD('DAY', -29, CURRENT_TIMESTAMP), DATEADD('DAY', -29, CURRENT_TIMESTAMP)),
(6, 4, 1, 'Start early and tailor your resume for each role.', 'PLAIN', DATEADD('DAY', -19, CURRENT_TIMESTAMP), DATEADD('DAY', -19, CURRENT_TIMESTAMP)),
(7, 4, 6, 'Practice behavioral questions with the STAR method.', 'PLAIN', DATEADD('DAY', -18, CURRENT_TIMESTAMP), DATEADD('DAY', -18, CURRENT_TIMESTAMP)),
(8, 5, 2, 'Set small daily goals and track your streak.', 'PLAIN', DATEADD('DAY', -9, CURRENT_TIMESTAMP),  DATEADD('DAY', -9, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 9. Tags
-- ------------------------------------------------------------
INSERT IGNORE INTO tags (id, name) VALUES
(1, 'beginner'),
(2, 'advanced'),
(3, 'video'),
(4, 'pdf'),
(5, 'practice'),
(6, 'notes'),
(7, 'tutorial'),
(8, 'career'),
(9, 'motivation'),
(10, 'science');

-- ------------------------------------------------------------
-- 10. Post Tags (channel posts and resource posts)
-- ------------------------------------------------------------
INSERT IGNORE INTO post_tags (post_id, post_type, tag_id, created_at) VALUES
(3, 'CHANNEL', 1, DATEADD('DAY', -40, CURRENT_TIMESTAMP)),
(3, 'CHANNEL', 7, DATEADD('DAY', -40, CURRENT_TIMESTAMP)),
(5, 'CHANNEL', 1, DATEADD('DAY', -38, CURRENT_TIMESTAMP)),
(5, 'CHANNEL', 10, DATEADD('DAY', -38, CURRENT_TIMESTAMP)),
(6, 'CHANNEL', 8, DATEADD('DAY', -36, CURRENT_TIMESTAMP)),
(1, 'RESOURCE', 6, DATEADD('DAY', -39, CURRENT_TIMESTAMP)),
(1, 'RESOURCE', 1, DATEADD('DAY', -39, CURRENT_TIMESTAMP)),
(3, 'RESOURCE', 7, DATEADD('DAY', -34, CURRENT_TIMESTAMP)),
(4, 'RESOURCE', 10, DATEADD('DAY', -29, CURRENT_TIMESTAMP)),
(6, 'RESOURCE', 7, DATEADD('DAY', -14, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 11. Upvotes
-- ------------------------------------------------------------
INSERT IGNORE INTO upvotes (user_id, resource_id, created_at) VALUES
(2, 1, DATEADD('DAY', -35, CURRENT_TIMESTAMP)),
(3, 1, DATEADD('DAY', -34, CURRENT_TIMESTAMP)),
(4, 1, DATEADD('DAY', -33, CURRENT_TIMESTAMP)),
(5, 1, DATEADD('DAY', -32, CURRENT_TIMESTAMP)),
(6, 1, DATEADD('DAY', -31, CURRENT_TIMESTAMP)),
(1, 3, DATEADD('DAY', -30, CURRENT_TIMESTAMP)),
(2, 3, DATEADD('DAY', -29, CURRENT_TIMESTAMP)),
(4, 3, DATEADD('DAY', -28, CURRENT_TIMESTAMP)),
(5, 3, DATEADD('DAY', -27, CURRENT_TIMESTAMP)),
(6, 3, DATEADD('DAY', -26, CURRENT_TIMESTAMP)),
(7, 3, DATEADD('DAY', -25, CURRENT_TIMESTAMP)),
(1, 4, DATEADD('DAY', -24, CURRENT_TIMESTAMP)),
(2, 4, DATEADD('DAY', -23, CURRENT_TIMESTAMP)),
(3, 4, DATEADD('DAY', -22, CURRENT_TIMESTAMP)),
(5, 4, DATEADD('DAY', -21, CURRENT_TIMESTAMP)),
(6, 4, DATEADD('DAY', -20, CURRENT_TIMESTAMP)),
(7, 4, DATEADD('DAY', -19, CURRENT_TIMESTAMP)),
(8, 4, DATEADD('DAY', -18, CURRENT_TIMESTAMP)),
(1, 5, DATEADD('DAY', -17, CURRENT_TIMESTAMP)),
(2, 5, DATEADD('DAY', -16, CURRENT_TIMESTAMP)),
(3, 5, DATEADD('DAY', -15, CURRENT_TIMESTAMP)),
(1, 7, DATEADD('DAY', -14, CURRENT_TIMESTAMP)),
(2, 7, DATEADD('DAY', -13, CURRENT_TIMESTAMP)),
(1, 11, DATEADD('DAY', -12, CURRENT_TIMESTAMP)),
(2, 11, DATEADD('DAY', -11, CURRENT_TIMESTAMP)),
(3, 11, DATEADD('DAY', -10, CURRENT_TIMESTAMP)),
(4, 11, DATEADD('DAY', -9, CURRENT_TIMESTAMP)),
(5, 11, DATEADD('DAY', -8, CURRENT_TIMESTAMP));

-- Keep resource upvote_count in sync with the inserted upvotes.
UPDATE resources SET upvote_count = (
    SELECT COUNT(*) FROM upvotes WHERE upvotes.resource_id = resources.id
);

-- ------------------------------------------------------------
-- 12. Notifications
-- ------------------------------------------------------------
INSERT IGNORE INTO notifications (user_id, type, title, body, action_url, is_read, created_at) VALUES
(3, 'REPLY', 'New reply on your thread', 'Bob replied to your Calculus question.', '/channels/study-help/threads/2', FALSE, DATEADD('DAY', -2, CURRENT_TIMESTAMP)),
(4, 'UPVOTE', 'Your resource received an upvote', 'Your Genetics Fundamentals article was upvoted.', '/resources/genetics-article', TRUE, DATEADD('DAY', -3, CURRENT_TIMESTAMP)),
(5, 'MENTION', 'You were mentioned', 'Alice mentioned you in Career & Internships.', '/channels/career-internships/threads/4', FALSE, DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(6, 'SYSTEM', 'Welcome to LernChih!', 'Complete your profile to earn your first badge.', '/profile', FALSE, DATEADD('DAY', -4, CURRENT_TIMESTAMP)),
(7, 'UPVOTE', 'Your post was upvoted', 'Someone upvoted your resource.', '/resources/typography-basics', TRUE, DATEADD('DAY', -5, CURRENT_TIMESTAMP)),
(8, 'SYSTEM', 'Getting started guide', 'Check out the resource sharing channel.', '/channels/resource-sharing', FALSE, DATEADD('DAY', -6, CURRENT_TIMESTAMP)),
(1, 'REPORT', 'Content flagged for review', 'A post was reported by a user.', '/moderation', FALSE, DATEADD('DAY', -7, CURRENT_TIMESTAMP)),
(2, 'BADGE', 'You earned a badge', 'You earned the Contributor badge.', '/badges', TRUE, DATEADD('DAY', -8, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 13. Badges & User Badges
-- ------------------------------------------------------------
INSERT IGNORE INTO badges (id, name, description, icon, required_credits, created_at) VALUES
(4, 'Early Adopter', 'One of the first members of the community.', '🚀', 0, DATEADD('DAY', -60, CURRENT_TIMESTAMP)),
(5, 'Helpful Hand', 'Received 10 upvotes on a single resource.', '👏', 100, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(6, 'Knowledge Seeker', 'Bookmarked 5 resources.', '🔖', 50, DATEADD('DAY', -40, CURRENT_TIMESTAMP)),
(7, 'Thread Starter', 'Started 3 channel threads.', '💬', 75, DATEADD('DAY', -30, CURRENT_TIMESTAMP)),
(8, 'Influencer', 'Reached 500 credits.', '⭐', 500, DATEADD('DAY', -20, CURRENT_TIMESTAMP));

INSERT IGNORE INTO user_badges (user_id, badge_id, earned_at) VALUES
(1, 4, DATEADD('DAY', -50, CURRENT_TIMESTAMP)),
(1, 8, DATEADD('DAY', -10, CURRENT_TIMESTAMP)),
(2, 4, DATEADD('DAY', -45, CURRENT_TIMESTAMP)),
(2, 5, DATEADD('DAY', -20, CURRENT_TIMESTAMP)),
(2, 6, DATEADD('DAY', -15, CURRENT_TIMESTAMP)),
(3, 4, DATEADD('DAY', -30, CURRENT_TIMESTAMP)),
(3, 6, DATEADD('DAY', -12, CURRENT_TIMESTAMP)),
(4, 4, DATEADD('DAY', -25, CURRENT_TIMESTAMP)),
(5, 4, DATEADD('DAY', -20, CURRENT_TIMESTAMP)),
(6, 4, DATEADD('DAY', -15, CURRENT_TIMESTAMP));

-- ------------------------------------------------------------
-- 14. User Subjects
-- ------------------------------------------------------------
INSERT IGNORE INTO user_subjects (user_id, subject_id) VALUES
(1, 2), (1, 4),
(2, 1), (2, 6),
(3, 2), (3, 3),
(4, 4), (4, 6),
(5, 5), (5, 7),
(6, 2), (6, 8),
(7, 7), (7, 8),
(8, 1), (8, 5);

-- ------------------------------------------------------------
-- 15. User Socials
-- ------------------------------------------------------------
INSERT IGNORE INTO user_socials (user_id, platform, url) VALUES
(1, 'GitHub', 'https://github.com/alicechen'),
(1, 'LinkedIn', 'https://linkedin.com/in/alicechen'),
(2, 'GitHub', 'https://github.com/bobsmith'),
(3, 'LinkedIn', 'https://linkedin.com/in/carolwu'),
(5, 'Twitter', 'https://twitter.com/evej');

-- ------------------------------------------------------------
-- 16. Study Groups
-- ------------------------------------------------------------
INSERT IGNORE INTO study_groups (id, name, description, owner_user_id, created_at) VALUES
(1, 'Calculus Study Circle', 'Group for calculus students to study together.', 2, DATEADD('DAY', -30, CURRENT_TIMESTAMP)),
(2, 'CS Interview Prep',     'Prepare for coding interviews.',               3, DATEADD('DAY', -25, CURRENT_TIMESTAMP)),
(3, 'Bio Enthusiasts',       'Discuss biology topics and share resources.',  4, DATEADD('DAY', -20, CURRENT_TIMESTAMP));

INSERT IGNORE INTO study_group_members (group_id, user_id, joined_at) VALUES
(1, 2, DATEADD('DAY', -29, CURRENT_TIMESTAMP)),
(1, 3, DATEADD('DAY', -28, CURRENT_TIMESTAMP)),
(1, 4, DATEADD('DAY', -27, CURRENT_TIMESTAMP)),
(2, 3, DATEADD('DAY', -24, CURRENT_TIMESTAMP)),
(2, 6, DATEADD('DAY', -23, CURRENT_TIMESTAMP)),
(2, 8, DATEADD('DAY', -22, CURRENT_TIMESTAMP)),
(3, 4, DATEADD('DAY', -19, CURRENT_TIMESTAMP)),
(3, 5, DATEADD('DAY', -18, CURRENT_TIMESTAMP));

SET FOREIGN_KEY_CHECKS = 1;
