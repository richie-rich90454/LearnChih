-- ============================================================
-- LernChih Forum - Development Seed Data
-- Flyway-compatible seed script (Task 10.4 / Spec I108)
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
--   - Badges, notifications, bookmarks, upvotes, tags, follows, etc.
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
(1, 'alice@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Alice Chen',      'Computer science student and open-source contributor.', 'ADMIN',      TRUE, 1000, TRUE, FALSE, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 1 DAY),
(2, 'bob@example.com',    '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Bob Smith',       'Math tutor and lifelong learner.',                       'MODERATOR',  TRUE,  520, TRUE, FALSE, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 2 DAY),
(3, 'carol@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Carol Wu',        'Biology major interested in genetics.',                  'STUDENT',    TRUE,  340, TRUE, FALSE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 3 DAY),
(4, 'dave@example.com',   '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Dave Miller',     'Physics enthusiast and lab assistant.',                    'STUDENT',    TRUE,  210, TRUE, FALSE, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 4 DAY),
(5, 'eve@example.com',    '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Eve Johnson',     'History buff and essay writer.',                           'STUDENT',    TRUE,  180, TRUE, FALSE, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 5 DAY),
(6, 'frank@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Frank Li',        'Software engineer learning Mandarin.',                     'STUDENT',    TRUE,   95, TRUE, FALSE, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 6 DAY),
(7, 'grace@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Grace Park',      'High-school student, art and design.',                     'STUDENT',    TRUE,   60, TRUE, FALSE, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 7 DAY),
(8, 'henry@example.com',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Henry Brown',     'Newcomer exploring the platform.',                         'STUDENT',    TRUE,   10, TRUE, FALSE, NOW() - INTERVAL 5 DAY,  NOW() - INTERVAL 8 DAY);

-- ------------------------------------------------------------
-- 2. Subjects
-- ------------------------------------------------------------
INSERT IGNORE INTO subjects (id, name, created_at) VALUES
(1, 'Mathematics',       NOW() - INTERVAL 60 DAY),
(2, 'Computer Science',  NOW() - INTERVAL 60 DAY),
(3, 'Biology',           NOW() - INTERVAL 60 DAY),
(4, 'Physics',           NOW() - INTERVAL 60 DAY),
(5, 'History',           NOW() - INTERVAL 60 DAY),
(6, 'Chemistry',         NOW() - INTERVAL 60 DAY),
(7, 'Literature',        NOW() - INTERVAL 60 DAY),
(8, 'Art & Design',      NOW() - INTERVAL 60 DAY);

-- ------------------------------------------------------------
-- 3. Topics
-- ------------------------------------------------------------
INSERT IGNORE INTO topics (id, name, subject_id, created_at) VALUES
(1, 'Calculus',          1, NOW() - INTERVAL 55 DAY),
(2, 'Linear Algebra',    1, NOW() - INTERVAL 55 DAY),
(3, 'Algorithms',        2, NOW() - INTERVAL 55 DAY),
(4, 'Machine Learning',  2, NOW() - INTERVAL 55 DAY),
(5, 'Genetics',          3, NOW() - INTERVAL 55 DAY),
(6, 'Ecology',           3, NOW() - INTERVAL 55 DAY),
(7, 'Quantum Mechanics', 4, NOW() - INTERVAL 55 DAY),
(8, 'Classical Mechanics', 4, NOW() - INTERVAL 55 DAY),
(9, 'World War II',      5, NOW() - INTERVAL 55 DAY),
(10, 'Organic Chemistry', 6, NOW() - INTERVAL 55 DAY),
(11, 'Shakespeare',       7, NOW() - INTERVAL 55 DAY),
(12, 'Typography',        8, NOW() - INTERVAL 55 DAY);

-- ------------------------------------------------------------
-- 4. Courses
-- ------------------------------------------------------------
INSERT IGNORE INTO courses (id, name, subject_id, created_at) VALUES
(1, 'Intro to Calculus',        1, NOW() - INTERVAL 50 DAY),
(2, 'Advanced Linear Algebra',  1, NOW() - INTERVAL 50 DAY),
(3, 'Data Structures',          2, NOW() - INTERVAL 50 DAY),
(4, 'Intro to ML',              2, NOW() - INTERVAL 50 DAY),
(5, 'Molecular Biology',        3, NOW() - INTERVAL 50 DAY),
(6, 'General Physics I',        4, NOW() - INTERVAL 50 DAY),
(7, 'Modern European History',  5, NOW() - INTERVAL 50 DAY),
(8, 'Creative Writing',         7, NOW() - INTERVAL 50 DAY);

-- ------------------------------------------------------------
-- 5. Resources
-- ------------------------------------------------------------
INSERT IGNORE INTO resources (id, slug, title, description, category, type, external_url, user_id, subject_id, topic_id, course_id, upvote_count, created_at, updated_at) VALUES
(1,  'intro-to-calculus-notes',           'Intro to Calculus Notes',          'Comprehensive notes covering limits, derivatives, and integrals.', 'PDF',       'LINK', 'https://example.com/calc-notes.pdf',           2, 1, 1, 1, 5, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 2 DAY),
(2,  'linear-algebra-cheatsheet',         'Linear Algebra Cheatsheet',        'Quick reference for vectors, matrices, and eigenvalues.',        'PDF',       'LINK', 'https://example.com/linalg-cheatsheet.pdf',    2, 1, 2, 2, 4, NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 3 DAY),
(3,  'sorting-algorithms-video',          'Sorting Algorithms Explained',     'Visual explanation of common sorting algorithms.',               'VIDEO',     'LINK', 'https://example.com/sorting-video',            3, 2, 3, 3, 6, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 1 DAY),
(4,  'ml-intro-guide',                    'Machine Learning Intro Guide',     'A beginner-friendly guide to supervised learning.',              'GUIDE',     'LINK', 'https://example.com/ml-intro',                 3, 2, 4, 4, 7, NOW() - INTERVAL 33 DAY, NOW() - INTERVAL 4 DAY),
(5,  'genetics-article',                  'Genetics Fundamentals',            'Article explaining DNA, RNA, and protein synthesis.',            'ARTICLE',   'LINK', 'https://example.com/genetics-article',         4, 3, 5, 5, 3, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 5 DAY),
(6,  'quantum-lecture-recording',         'Quantum Mechanics Lecture',        'Recorded lecture on wave-particle duality.',                     'LECTURE_RECORDING', 'LINK', 'https://example.com/quantum-lecture',  4, 4, 7, 6, 4, NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 6 DAY),
(7,  'wwii-timeline',                     'World War II Timeline',            'Interactive timeline of major WWII events.',                     'GUIDE',     'LINK', 'https://example.com/wwii-timeline',            5, 5, 9, 7, 2, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 7 DAY),
(8,  'organic-chemistry-lab',             'Organic Chemistry Lab Manual',     'Step-by-step lab manual for common reactions.',                  'PDF',       'LINK', 'https://example.com/orgchem-lab.pdf',          6, 6, 10, NULL, 3, NOW() - INTERVAL 22 DAY, NOW() - INTERVAL 8 DAY),
(9,  'shakespeare-analysis',              'Shakespeare Analysis',             'Critical analysis of Hamlet and Macbeth.',                       'ARTICLE',   'LINK', 'https://example.com/shakespeare-analysis',     5, 7, 11, 8, 4, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 9 DAY),
(10, 'typography-basics',                 'Typography Basics',                'Introduction to typography and font pairing.',                   'GUIDE',     'LINK', 'https://example.com/typography-basics',        7, 8, 12, NULL, 2, NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 10 DAY),
(11, 'python-data-science-notebook',      'Python Data Science Notebook',     'Jupyter notebook with pandas and matplotlib examples.',          'OTHER',     'LINK', 'https://example.com/py-ds-notebook',           3, 2, 3, 3, 5, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 11 DAY),
(12, 'cell-biology-slides',               'Cell Biology Slides',              'Lecture slides covering cell structure and function.',           'PDF',       'LINK', 'https://example.com/cell-bio-slides.pdf',      4, 3, 6, 5, 1, NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 12 DAY),
(13, 'classical-mechanics-problems',      'Classical Mechanics Problems',     'Practice problem set with solutions.',                           'PDF',       'LINK', 'https://example.com/mechanics-problems.pdf',   4, 4, 8, 6, 3, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 13 DAY),
(14, 'creative-writing-prompts',          'Creative Writing Prompts',         'A collection of prompts to spark writing ideas.',                'ARTICLE',   'LINK', 'https://example.com/writing-prompts',          5, 7, 11, 8, 2, NOW() - INTERVAL 8 DAY,  NOW() - INTERVAL 14 DAY),
(15, 'design-system-checklist',           'Design System Checklist',          'Checklist for building consistent design systems.',              'GUIDE',     'LINK', 'https://example.com/design-checklist',         7, 8, 12, NULL, 4, NOW() - INTERVAL 5 DAY,  NOW() - INTERVAL 15 DAY);

-- ------------------------------------------------------------
-- 6. Resource Threads & Posts
-- ------------------------------------------------------------
INSERT IGNORE INTO resource_threads (id, resource_id, content, format, created_at) VALUES
(1, 1,  'Discussion thread for calculus notes.',       'PLAIN', NOW() - INTERVAL 40 DAY),
(2, 3,  'Questions and answers about sorting algorithms.', 'PLAIN', NOW() - INTERVAL 35 DAY),
(3, 5,  'Discussion for genetics fundamentals.',         'PLAIN', NOW() - INTERVAL 30 DAY),
(4, 7,  'Discussion for WWII timeline.',                 'PLAIN', NOW() - INTERVAL 25 DAY),
(5, 11, 'Discussion for Python data science notebook.',  'PLAIN', NOW() - INTERVAL 15 DAY);

INSERT IGNORE INTO resource_posts (id, thread_id, user_id, content, format, created_at, updated_at) VALUES
(1, 1, 3, 'Thanks for sharing these notes! The section on limits was especially helpful.', 'PLAIN', NOW() - INTERVAL 39 DAY, NOW() - INTERVAL 39 DAY),
(2, 1, 4, 'Could you add more examples on implicit differentiation?', 'PLAIN', NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 38 DAY),
(3, 2, 5, 'Great visual explanation. Quick sort is now much clearer.', 'PLAIN', NOW() - INTERVAL 34 DAY, NOW() - INTERVAL 34 DAY),
(4, 3, 6, 'This article really helped me understand transcription. Thanks!', 'PLAIN', NOW() - INTERVAL 29 DAY, NOW() - INTERVAL 29 DAY),
(5, 4, 2, 'Would be nice to include Pacific theater events too.', 'PLAIN', NOW() - INTERVAL 24 DAY, NOW() - INTERVAL 24 DAY),
(6, 5, 8, 'The matplotlib examples are super useful.', 'PLAIN', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 14 DAY);

-- ------------------------------------------------------------
-- 7. Channels
-- ------------------------------------------------------------
INSERT IGNORE INTO channels (id, name, description, created_at, slug) VALUES
(1, 'General Discussion', 'Open channel for anything related to learning.', NOW() - INTERVAL 60 DAY, 'general-discussion'),
(2, 'Study Help',         'Ask questions and get help from the community.', NOW() - INTERVAL 55 DAY, 'study-help'),
(3, 'Resource Sharing',   'Share and discover new learning resources.',     NOW() - INTERVAL 50 DAY, 'resource-sharing'),
(4, 'Career & Internships', 'Discuss career paths, internships, and jobs.', NOW() - INTERVAL 45 DAY, 'career-internships');

-- ------------------------------------------------------------
-- 8. Channel Threads & Posts
-- ------------------------------------------------------------
INSERT IGNORE INTO channel_threads (id, channel_id, title, user_id, content, format, created_at) VALUES
(1, 1, 'Welcome to LernChih!',            1, 'Introduce yourself and say hello to the community.', 'PLAIN', NOW() - INTERVAL 50 DAY),
(2, 2, 'Best resources for Calculus?',    3, 'Looking for recommended resources to study calculus.', 'PLAIN', NOW() - INTERVAL 40 DAY),
(3, 3, 'Weekly resource roundup',         2, 'Share your favorite resource of the week here.',     'PLAIN', NOW() - INTERVAL 30 DAY),
(4, 4, 'Internship application tips',     5, 'What are your tips for landing a summer internship?', 'PLAIN', NOW() - INTERVAL 20 DAY),
(5, 2, 'How to stay motivated?',          7, 'Struggling to stay consistent. Any advice?',         'PLAIN', NOW() - INTERVAL 10 DAY);

INSERT IGNORE INTO channel_posts (id, thread_id, user_id, content, format, created_at, updated_at) VALUES
(1, 1, 2, 'Hi everyone! Excited to be here.', 'PLAIN', NOW() - INTERVAL 49 DAY, NOW() - INTERVAL 49 DAY),
(2, 1, 3, 'Hello! Looking forward to learning together.', 'PLAIN', NOW() - INTERVAL 48 DAY, NOW() - INTERVAL 48 DAY),
(3, 2, 2, 'I recommend the Intro to Calculus Notes resource.', 'PLAIN', NOW() - INTERVAL 39 DAY, NOW() - INTERVAL 39 DAY),
(4, 2, 4, 'Khan Academy is also great for visual learners.', 'PLAIN', NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 38 DAY),
(5, 3, 3, 'This week I really liked the ML Intro Guide.', 'PLAIN', NOW() - INTERVAL 29 DAY, NOW() - INTERVAL 29 DAY),
(6, 4, 1, 'Start early and tailor your resume for each role.', 'PLAIN', NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 19 DAY),
(7, 4, 6, 'Practice behavioral questions with the STAR method.', 'PLAIN', NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 18 DAY),
(8, 5, 2, 'Set small daily goals and track your streak.', 'PLAIN', NOW() - INTERVAL 9 DAY,  NOW() - INTERVAL 9 DAY);

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
INSERT IGNORE INTO post_tags (post_id, post_type, tag_id) VALUES
(3, 'CHANNEL_POST', 1),
(3, 'CHANNEL_POST', 7),
(5, 'CHANNEL_POST', 1),
(5, 'CHANNEL_POST', 10),
(6, 'CHANNEL_POST', 8),
(1, 'RESOURCE_POST', 6),
(1, 'RESOURCE_POST', 1),
(3, 'RESOURCE_POST', 7),
(4, 'RESOURCE_POST', 10),
(6, 'RESOURCE_POST', 7);

-- ------------------------------------------------------------
-- 11. Upvotes
-- ------------------------------------------------------------
INSERT IGNORE INTO upvotes (user_id, resource_id, created_at) VALUES
(2, 1, NOW() - INTERVAL 35 DAY),
(3, 1, NOW() - INTERVAL 34 DAY),
(4, 1, NOW() - INTERVAL 33 DAY),
(5, 1, NOW() - INTERVAL 32 DAY),
(6, 1, NOW() - INTERVAL 31 DAY),
(1, 3, NOW() - INTERVAL 30 DAY),
(2, 3, NOW() - INTERVAL 29 DAY),
(4, 3, NOW() - INTERVAL 28 DAY),
(5, 3, NOW() - INTERVAL 27 DAY),
(6, 3, NOW() - INTERVAL 26 DAY),
(7, 3, NOW() - INTERVAL 25 DAY),
(1, 4, NOW() - INTERVAL 24 DAY),
(2, 4, NOW() - INTERVAL 23 DAY),
(3, 4, NOW() - INTERVAL 22 DAY),
(5, 4, NOW() - INTERVAL 21 DAY),
(6, 4, NOW() - INTERVAL 20 DAY),
(7, 4, NOW() - INTERVAL 19 DAY),
(8, 4, NOW() - INTERVAL 18 DAY),
(1, 5, NOW() - INTERVAL 17 DAY),
(2, 5, NOW() - INTERVAL 16 DAY),
(3, 5, NOW() - INTERVAL 15 DAY),
(1, 7, NOW() - INTERVAL 14 DAY),
(2, 7, NOW() - INTERVAL 13 DAY),
(1, 11, NOW() - INTERVAL 12 DAY),
(2, 11, NOW() - INTERVAL 11 DAY),
(3, 11, NOW() - INTERVAL 10 DAY),
(4, 11, NOW() - INTERVAL 9 DAY),
(5, 11, NOW() - INTERVAL 8 DAY);

-- Keep resource upvote_count in sync with the inserted upvotes.
UPDATE resources SET upvote_count = (
    SELECT COUNT(*) FROM upvotes WHERE upvotes.resource_id = resources.id
);

-- ------------------------------------------------------------
-- 12. Bookmarks
-- ------------------------------------------------------------
INSERT IGNORE INTO bookmarks (user_id, resource_id, created_at) VALUES
(1, 3, NOW() - INTERVAL 20 DAY),
(1, 4, NOW() - INTERVAL 18 DAY),
(2, 1, NOW() - INTERVAL 25 DAY),
(2, 7, NOW() - INTERVAL 22 DAY),
(3, 5, NOW() - INTERVAL 15 DAY),
(3, 11, NOW() - INTERVAL 12 DAY),
(4, 6, NOW() - INTERVAL 10 DAY),
(5, 9, NOW() - INTERVAL 8 DAY),
(6, 13, NOW() - INTERVAL 5 DAY),
(7, 15, NOW() - INTERVAL 3 DAY);

-- ------------------------------------------------------------
-- 13. Notifications
-- ------------------------------------------------------------
INSERT IGNORE INTO notifications (user_id, type, title, body, action_url, is_read, created_at) VALUES
(3, 'REPLY', 'New reply on your thread', 'Bob replied to your Calculus question.', '/channels/study-help/threads/2', FALSE, NOW() - INTERVAL 2 DAY),
(4, 'UPVOTE', 'Your resource received an upvote', 'Your Genetics Fundamentals article was upvoted.', '/resources/genetics-article', TRUE, NOW() - INTERVAL 3 DAY),
(5, 'MENTION', 'You were mentioned', 'Alice mentioned you in Career & Internships.', '/channels/career-internships/threads/4', FALSE, NOW() - INTERVAL 1 DAY),
(6, 'SYSTEM', 'Welcome to LernChih!', 'Complete your profile to earn your first badge.', '/profile', FALSE, NOW() - INTERVAL 4 DAY),
(7, 'UPVOTE', 'Your post was upvoted', 'Someone upvoted your resource.', '/resources/typography-basics', TRUE, NOW() - INTERVAL 5 DAY),
(8, 'SYSTEM', 'Getting started guide', 'Check out the resource sharing channel.', '/channels/resource-sharing', FALSE, NOW() - INTERVAL 6 DAY),
(1, 'REPORT', 'Content flagged for review', 'A post was reported by a user.', '/moderation', FALSE, NOW() - INTERVAL 7 DAY),
(2, 'BADGE', 'You earned a badge', 'You earned the Contributor badge.', '/badges', TRUE, NOW() - INTERVAL 8 DAY);

-- ------------------------------------------------------------
-- 14. Badges & User Badges
-- ------------------------------------------------------------
INSERT IGNORE INTO badges (id, name, description, icon, required_credits) VALUES
(4, 'Early Adopter', 'One of the first members of the community.', '🚀', 0),
(5, 'Helpful Hand', 'Received 10 upvotes on a single resource.', '👏', 100),
(6, 'Knowledge Seeker', 'Bookmarked 5 resources.', '🔖', 50),
(7, 'Thread Starter', 'Started 3 channel threads.', '💬', 75),
(8, 'Influencer', 'Reached 500 credits.', '⭐', 500);

INSERT IGNORE INTO user_badges (user_id, badge_id, earned_at) VALUES
(1, 4, NOW() - INTERVAL 50 DAY),
(1, 8, NOW() - INTERVAL 10 DAY),
(2, 4, NOW() - INTERVAL 45 DAY),
(2, 5, NOW() - INTERVAL 20 DAY),
(2, 6, NOW() - INTERVAL 15 DAY),
(3, 4, NOW() - INTERVAL 30 DAY),
(3, 6, NOW() - INTERVAL 12 DAY),
(4, 4, NOW() - INTERVAL 25 DAY),
(5, 4, NOW() - INTERVAL 20 DAY),
(6, 4, NOW() - INTERVAL 15 DAY);

-- ------------------------------------------------------------
-- 15. Follows
-- ------------------------------------------------------------
INSERT IGNORE INTO follows (follower_id, following_id, created_at) VALUES
(3, 2, NOW() - INTERVAL 20 DAY),
(4, 2, NOW() - INTERVAL 18 DAY),
(5, 1, NOW() - INTERVAL 15 DAY),
(6, 3, NOW() - INTERVAL 12 DAY),
(7, 5, NOW() - INTERVAL 10 DAY),
(8, 6, NOW() - INTERVAL 8 DAY),
(2, 1, NOW() - INTERVAL 5 DAY),
(3, 1, NOW() - INTERVAL 4 DAY);

-- ------------------------------------------------------------
-- 16. Reactions
-- ------------------------------------------------------------
INSERT IGNORE INTO reactions (post_id, post_type, user_id, emoji, created_at) VALUES
(1, 'CHANNEL_POST', 3, '👍', NOW() - INTERVAL 2 DAY),
(1, 'CHANNEL_POST', 4, '❤️', NOW() - INTERVAL 2 DAY),
(3, 'CHANNEL_POST', 5, '👍', NOW() - INTERVAL 3 DAY),
(6, 'CHANNEL_POST', 2, '🎉', NOW() - INTERVAL 4 DAY),
(1, 'RESOURCE_POST', 4, '👍', NOW() - INTERVAL 5 DAY),
(3, 'RESOURCE_POST', 6, '🔥', NOW() - INTERVAL 6 DAY);

-- ------------------------------------------------------------
-- 17. User Subjects
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
-- 18. User Socials
-- ------------------------------------------------------------
INSERT IGNORE INTO user_socials (user_id, platform, url) VALUES
(1, 'GitHub', 'https://github.com/alicechen'),
(1, 'LinkedIn', 'https://linkedin.com/in/alicechen'),
(2, 'GitHub', 'https://github.com/bobsmith'),
(3, 'LinkedIn', 'https://linkedin.com/in/carolwu'),
(5, 'Twitter', 'https://twitter.com/evej');

-- ------------------------------------------------------------
-- 19. Study Groups (requires owner_user_id column)
-- ------------------------------------------------------------
INSERT IGNORE INTO study_groups (id, name, description, owner_user_id, created_at) VALUES
(1, 'Calculus Study Circle', 'Group for calculus students to study together.', 2, NOW() - INTERVAL 30 DAY),
(2, 'CS Interview Prep',     'Prepare for coding interviews.',               3, NOW() - INTERVAL 25 DAY),
(3, 'Bio Enthusiasts',       'Discuss biology topics and share resources.',  4, NOW() - INTERVAL 20 DAY);

INSERT IGNORE INTO study_group_members (group_id, user_id, joined_at) VALUES
(1, 2, NOW() - INTERVAL 29 DAY),
(1, 3, NOW() - INTERVAL 28 DAY),
(1, 4, NOW() - INTERVAL 27 DAY),
(2, 3, NOW() - INTERVAL 24 DAY),
(2, 6, NOW() - INTERVAL 23 DAY),
(2, 8, NOW() - INTERVAL 22 DAY),
(3, 4, NOW() - INTERVAL 19 DAY),
(3, 5, NOW() - INTERVAL 18 DAY);

SET FOREIGN_KEY_CHECKS = 1;
