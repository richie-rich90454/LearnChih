-- ============================================================
-- LernChih - Course Catalog Seed Data
-- Flyway-compatible seed script (V1000)
--
-- This script is executed only when `app.seed.enabled=true`, via
-- SeedDataRunner. It lives under classpath:db/seed so Flyway does not
-- run it automatically.
--
-- Data set:
--   - 2 demo accounts (admin + learner; password is "password123")
--   - 6 course categories
--   - 8 subjects
--   - 10 varied courses with descriptions, levels and instructors
--   - 34 lessons (2-5 lessons per course)
--   - 16 enrollments
--   - 14 course reviews/ratings
--   - 12 tags
--   - 22 course-tag relationships
--
-- All INSERT statements are guarded (INSERT IGNORE or
-- ON DUPLICATE KEY UPDATE) so the script is idempotent.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. Users
-- Demo accounts use the bcrypt hash for "password123".
-- ------------------------------------------------------------
INSERT INTO users (id, email, password, name, bio, role, verified, credits, email_notifications_enabled, totp_enabled, created_at, updated_at) VALUES
(1, 'admin@lernchih.dev',  '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Demo Admin',      'Platform administrator and course curator.',               'ADMIN',    TRUE, 1000, TRUE, FALSE, NOW() - INTERVAL 90 DAY, NOW() - INTERVAL 1 DAY),
(2, 'learner@lernchih.dev', '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Demo Learner',    'Curious learner exploring new topics.',                    'STUDENT',  TRUE,  250, TRUE, FALSE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 2 DAY),
(3, 'alice@example.com',   '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Alice Chen',      'Computer science student and open-source contributor.',    'STUDENT',  TRUE,  520, TRUE, FALSE, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 3 DAY),
(4, 'bob@example.com',     '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Bob Smith',       'Math tutor and lifelong learner.',                         'MODERATOR',TRUE,  480, TRUE, FALSE, NOW() - INTERVAL 55 DAY, NOW() - INTERVAL 4 DAY),
(5, 'carol@example.com',   '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Carol Wu',        'Biology major interested in genetics.',                    'STUDENT',  TRUE,  340, TRUE, FALSE, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 5 DAY),
(6, 'dave@example.com',    '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Dave Miller',     'Physics enthusiast and lab assistant.',                    'STUDENT',  TRUE,  210, TRUE, FALSE, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 6 DAY),
(7, 'eve@example.com',     '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Eve Johnson',     'History buff and essay writer.',                           'STUDENT',  TRUE,  180, TRUE, FALSE, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 7 DAY),
(8, 'frank@example.com',   '$2b$10$h64Q/l85CJHVBobKmE2vdeFW3Z4wfaNTCNnYYWVF0p8VZA9oPI/qC', 'Frank Li',        'Software engineer learning Mandarin.',                     'STUDENT',  TRUE,   95, TRUE, FALSE, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 8 DAY)
ON DUPLICATE KEY UPDATE
    name        = VALUES(name),
    bio         = VALUES(bio),
    role        = VALUES(role),
    verified    = VALUES(verified),
    credits     = VALUES(credits),
    updated_at  = VALUES(updated_at);

-- ------------------------------------------------------------
-- 2. Subjects (required by existing courses FK)
-- ------------------------------------------------------------
INSERT IGNORE INTO subjects (id, name, created_at) VALUES
(1, 'Mathematics',        NOW() - INTERVAL 70 DAY),
(2, 'Computer Science',   NOW() - INTERVAL 70 DAY),
(3, 'Biology',            NOW() - INTERVAL 70 DAY),
(4, 'Physics',            NOW() - INTERVAL 70 DAY),
(5, 'History',            NOW() - INTERVAL 70 DAY),
(6, 'Chemistry',          NOW() - INTERVAL 70 DAY),
(7, 'Literature',         NOW() - INTERVAL 70 DAY),
(8, 'Art & Design',       NOW() - INTERVAL 70 DAY);

-- ------------------------------------------------------------
-- 3. Categories
-- ------------------------------------------------------------
INSERT IGNORE INTO categories (id, name, description, created_at) VALUES
(1, 'Programming & Development', 'Courses covering coding, algorithms, and software engineering.', NOW() - INTERVAL 60 DAY),
(2, 'Data Science & AI',         'Machine learning, statistics, and data-driven decision making.', NOW() - INTERVAL 60 DAY),
(3, 'Science',                   'Biology, chemistry, physics and related lab sciences.',        NOW() - INTERVAL 60 DAY),
(4, 'Mathematics',               'From foundational math to advanced calculus and algebra.',     NOW() - INTERVAL 60 DAY),
(5, 'Humanities',                'History, literature, languages, and social studies.',          NOW() - INTERVAL 60 DAY),
(6, 'Creative Arts',             'Design, writing, music, and visual arts.',                     NOW() - INTERVAL 60 DAY);

-- ------------------------------------------------------------
-- 4. Courses (10 varied courses)
-- ------------------------------------------------------------
INSERT INTO courses (id, name, subject_id, category_id, description, level, duration_hours, instructor_id, image_url, created_at, updated_at) VALUES
(1, 'Intro to Calculus',               1, 4, 'Master limits, derivatives, and basic integrals through guided examples.',                                              'BEGINNER',      12, 4, 'https://example.com/images/calculus.jpg',        NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 2 DAY),
(2, 'Advanced Linear Algebra',         1, 4, 'Vector spaces, linear transformations, eigenvalues and applications in ML.',                                            'ADVANCED',      18, 4, 'https://example.com/images/linalg.jpg',          NOW() - INTERVAL 48 DAY, NOW() - INTERVAL 3 DAY),
(3, 'Data Structures & Algorithms',    2, 1, 'Build a solid foundation in arrays, trees, graphs, sorting, and dynamic programming.',                                  'INTERMEDIATE',  20, 3, 'https://example.com/images/dsa.jpg',             NOW() - INTERVAL 46 DAY, NOW() - INTERVAL 4 DAY),
(4, 'Machine Learning Fundamentals',   2, 2, 'Supervised and unsupervised learning, model evaluation, and neural-network basics.',                                    'INTERMEDIATE',  24, 3, 'https://example.com/images/ml.jpg',              NOW() - INTERVAL 44 DAY, NOW() - INTERVAL 5 DAY),
(5, 'Molecular Biology',               3, 3, 'DNA replication, transcription, translation, and modern CRISPR techniques.',                                            'INTERMEDIATE',  16, 5, 'https://example.com/images/molbio.jpg',          NOW() - INTERVAL 42 DAY, NOW() - INTERVAL 6 DAY),
(6, 'General Physics I',               4, 3, 'Mechanics, thermodynamics, and waves with problem-solving emphasis.',                                                   'BEGINNER',      14, 6, 'https://example.com/images/physics.jpg',         NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 7 DAY),
(7, 'Modern European History',         5, 5, 'From the Renaissance through the World Wars and the formation of the EU.',                                              'BEGINNER',      10, 7, 'https://example.com/images/history.jpg',         NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 8 DAY),
(8, 'Creative Writing Workshop',       7, 6, 'Develop voice, plot, and character through prompts, critique, and revision.',                                           'BEGINNER',       8, 7, 'https://example.com/images/writing.jpg',         NOW() - INTERVAL 36 DAY, NOW() - INTERVAL 9 DAY),
(9, 'Web Development Bootcamp',        2, 1, 'Full-stack basics with HTML, CSS, JavaScript, React, and Spring Boot.',                                                 'BEGINNER',      30, 3, 'https://example.com/images/webdev.jpg',          NOW() - INTERVAL 34 DAY, NOW() - INTERVAL 10 DAY),
(10,'Statistics for Data Science',    1, 2, 'Probability, distributions, hypothesis testing, and regression with Python.',                                           'INTERMEDIATE',  18, 4, 'https://example.com/images/statistics.jpg',      NOW() - INTERVAL 32 DAY, NOW() - INTERVAL 11 DAY)
ON DUPLICATE KEY UPDATE
    name           = VALUES(name),
    subject_id     = VALUES(subject_id),
    category_id    = VALUES(category_id),
    description    = VALUES(description),
    level          = VALUES(level),
    duration_hours = VALUES(duration_hours),
    instructor_id  = VALUES(instructor_id),
    image_url      = VALUES(image_url),
    updated_at     = VALUES(updated_at);

-- ------------------------------------------------------------
-- 5. Lessons (2-5 lessons per course)
-- ------------------------------------------------------------
INSERT IGNORE INTO lessons (id, course_id, title, content, duration_minutes, sort_order, created_at, updated_at) VALUES
-- Intro to Calculus (4 lessons)
(1,  1, 'Limits and Continuity',              'Introduction to limits, one-sided limits, and continuity of functions.',                  45, 1, NOW() - INTERVAL 49 DAY, NOW() - INTERVAL 49 DAY),
(2,  1, 'Derivatives Basics',                 'Power rule, product rule, quotient rule, and chain rule.',                                55, 2, NOW() - INTERVAL 47 DAY, NOW() - INTERVAL 47 DAY),
(3,  1, 'Applications of Derivatives',        'Optimization, related rates, and curve sketching.',                                       50, 3, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY),
(4,  1, 'Introduction to Integrals',          'Definite and indefinite integrals with the fundamental theorem of calculus.',             60, 4, NOW() - INTERVAL 43 DAY, NOW() - INTERVAL 43 DAY),
-- Advanced Linear Algebra (5 lessons)
(5,  2, 'Vector Spaces',                      'Axioms, subspaces, span, linear independence, and bases.',                                50, 1, NOW() - INTERVAL 47 DAY, NOW() - INTERVAL 47 DAY),
(6,  2, 'Linear Transformations',             'Matrix representations, kernel, image, and change of basis.',                             55, 2, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY),
(7,  2, 'Eigenvalues and Eigenvectors',       'Characteristic polynomial, diagonalization, and spectral theorem.',                       60, 3, NOW() - INTERVAL 43 DAY, NOW() - INTERVAL 43 DAY),
(8,  2, 'Inner Product Spaces',               'Orthogonality, projections, Gram-Schmidt, and least squares.',                            50, 4, NOW() - INTERVAL 41 DAY, NOW() - INTERVAL 41 DAY),
(9,  2, 'Applications in ML',                 'PCA, SVD, and dimensionality reduction examples.',                                        55, 5, NOW() - INTERVAL 39 DAY, NOW() - INTERVAL 39 DAY),
-- Data Structures & Algorithms (5 lessons)
(10, 3, 'Arrays and Hashing',                 'Big-O, arrays, hash maps, and two-pointer techniques.',                                   45, 1, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY),
(11, 3, 'Trees and Binary Search',            'Binary trees, BST operations, traversals, and balancing basics.',                         55, 2, NOW() - INTERVAL 43 DAY, NOW() - INTERVAL 43 DAY),
(12, 3, 'Graphs',                             'Adjacency lists, DFS, BFS, and shortest-path algorithms.',                                60, 3, NOW() - INTERVAL 41 DAY, NOW() - INTERVAL 41 DAY),
(13, 3, 'Dynamic Programming',                'Memoization, tabulation, and classic DP problems.',                                       65, 4, NOW() - INTERVAL 39 DAY, NOW() - INTERVAL 39 DAY),
(14, 3, 'Sorting and Searching',              'Merge sort, quick sort, binary search, and their analyses.',                              50, 5, NOW() - INTERVAL 37 DAY, NOW() - INTERVAL 37 DAY),
-- Machine Learning Fundamentals (4 lessons)
(15, 4, 'Supervised Learning',                'Regression, classification, loss functions, and gradient descent.',                       55, 1, NOW() - INTERVAL 43 DAY, NOW() - INTERVAL 43 DAY),
(16, 4, 'Model Evaluation',                   'Train/test splits, cross-validation, precision, recall, and ROC.',                        50, 2, NOW() - INTERVAL 41 DAY, NOW() - INTERVAL 41 DAY),
(17, 4, 'Unsupervised Learning',              'K-means clustering, hierarchical clustering, and Gaussian mixtures.',                     55, 3, NOW() - INTERVAL 39 DAY, NOW() - INTERVAL 39 DAY),
(18, 4, 'Neural Networks Basics',             'Perceptrons, activation functions, backpropagation, and intro to PyTorch.',               70, 4, NOW() - INTERVAL 37 DAY, NOW() - INTERVAL 37 DAY),
-- Molecular Biology (3 lessons)
(19, 5, 'DNA Structure and Replication',      'The double helix, semiconservative replication, and key enzymes.',                        45, 1, NOW() - INTERVAL 41 DAY, NOW() - INTERVAL 41 DAY),
(20, 5, 'Transcription and Translation',      'From DNA to RNA to proteins: the central dogma in action.',                               50, 2, NOW() - INTERVAL 39 DAY, NOW() - INTERVAL 39 DAY),
(21, 5, 'Gene Editing with CRISPR',           'CRISPR-Cas9 mechanism, guide RNAs, and ethical considerations.',                          55, 3, NOW() - INTERVAL 37 DAY, NOW() - INTERVAL 37 DAY),
-- General Physics I (4 lessons)
(22, 6, 'Kinematics',                         'Displacement, velocity, acceleration, and projectile motion.',                            40, 1, NOW() - INTERVAL 39 DAY, NOW() - INTERVAL 39 DAY),
(23, 6, 'Newton\'s Laws of Motion',            'Forces, free-body diagrams, friction, and circular motion.',                              50, 2, NOW() - INTERVAL 37 DAY, NOW() - INTERVAL 37 DAY),
(24, 6, 'Work, Energy, and Power',            'Kinetic and potential energy, conservation laws, and power.',                             45, 3, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 35 DAY),
(25, 6, 'Waves and Sound',                    'Wave properties, standing waves, and the Doppler effect.',                                40, 4, NOW() - INTERVAL 33 DAY, NOW() - INTERVAL 33 DAY),
-- Modern European History (3 lessons)
(26, 7, 'Renaissance and Reformation',        'Cultural rebirth, humanism, and religious reform movements.',                             40, 1, NOW() - INTERVAL 37 DAY, NOW() - INTERVAL 37 DAY),
(27, 7, 'Industrial Revolution',              'Social, economic, and technological transformations of the 18th-19th centuries.',         45, 2, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 35 DAY),
(28, 7, 'World Wars and Cold War',            'Causes, key events, and aftermath of the World Wars through 1991.',                       50, 3, NOW() - INTERVAL 33 DAY, NOW() - INTERVAL 33 DAY),
-- Creative Writing Workshop (2 lessons)
(29, 8, 'Finding Your Voice',                 'Exercises to develop tone, point of view, and narrative voice.',                          35, 1, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 35 DAY),
(30, 8, 'Plot, Character, and Revision',      'Story structure, character arcs, and the revision process.',                              40, 2, NOW() - INTERVAL 33 DAY, NOW() - INTERVAL 33 DAY),
-- Web Development Bootcamp (5 lessons)
(31, 9, 'HTML & CSS Foundations',             'Semantic markup, layout with Flexbox/Grid, and responsive design.',                       50, 1, NOW() - INTERVAL 33 DAY, NOW() - INTERVAL 33 DAY),
(32, 9, 'JavaScript Essentials',              'Variables, functions, DOM manipulation, and async programming.',                          60, 2, NOW() - INTERVAL 31 DAY, NOW() - INTERVAL 31 DAY),
(33, 9, 'React Components and Hooks',         'Component composition, state, effects, and routing.',                                     65, 3, NOW() - INTERVAL 29 DAY, NOW() - INTERVAL 29 DAY),
(34, 9, 'Spring Boot REST APIs',              'Building RESTful APIs with Spring Boot, JPA, and security.',                              70, 4, NOW() - INTERVAL 27 DAY, NOW() - INTERVAL 27 DAY),
(35, 9, 'Deployment and DevOps Basics',       'Docker, CI/CD, and deploying to the cloud.',                                              55, 5, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),
-- Statistics for Data Science (4 lessons)
(36, 10, 'Probability Foundations',           'Events, conditional probability, Bayes theorem, and random variables.',                   50, 1, NOW() - INTERVAL 31 DAY, NOW() - INTERVAL 31 DAY),
(37, 10, 'Distributions and Sampling',        'Common distributions, central limit theorem, and sampling methods.',                      55, 2, NOW() - INTERVAL 29 DAY, NOW() - INTERVAL 29 DAY),
(38, 10, 'Hypothesis Testing',                'P-values, confidence intervals, t-tests, and chi-squared tests.',                         60, 3, NOW() - INTERVAL 27 DAY, NOW() - INTERVAL 27 DAY),
(39, 10, 'Regression Modeling',               'Linear and logistic regression, assumptions, and interpretation.',                        65, 4, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY);

-- ------------------------------------------------------------
-- 6. Enrollments
-- ------------------------------------------------------------
INSERT IGNORE INTO enrollments (id, user_id, course_id, status, progress_percent, enrolled_at, completed_at) VALUES
(1,  2,  1, 'ACTIVE',     75, NOW() - INTERVAL 28 DAY, NULL),
(2,  2,  3, 'ACTIVE',     40, NOW() - INTERVAL 25 DAY, NULL),
(3,  2,  9, 'ACTIVE',     10, NOW() - INTERVAL 20 DAY, NULL),
(4,  3,  3, 'COMPLETED', 100, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 10 DAY),
(5,  3,  4, 'ACTIVE',     60, NOW() - INTERVAL 30 DAY, NULL),
(6,  3, 10, 'ACTIVE',     25, NOW() - INTERVAL 15 DAY, NULL),
(7,  4,  1, 'COMPLETED', 100, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 15 DAY),
(8,  4,  2, 'ACTIVE',     80, NOW() - INTERVAL 35 DAY, NULL),
(9,  5,  5, 'ACTIVE',     55, NOW() - INTERVAL 32 DAY, NULL),
(10, 5,  6, 'DROPPED',    20, NOW() - INTERVAL 30 DAY, NULL),
(11, 6,  6, 'COMPLETED', 100, NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 12 DAY),
(12, 6,  2, 'ACTIVE',     30, NOW() - INTERVAL 28 DAY, NULL),
(13, 7,  7, 'ACTIVE',     90, NOW() - INTERVAL 24 DAY, NULL),
(14, 7,  8, 'ACTIVE',     50, NOW() - INTERVAL 22 DAY, NULL),
(15, 8,  9, 'ACTIVE',     15, NOW() - INTERVAL 18 DAY, NULL),
(16, 8,  1, 'DROPPED',     5, NOW() - INTERVAL 16 DAY, NULL);

-- ------------------------------------------------------------
-- 7. Tags
-- ------------------------------------------------------------
INSERT IGNORE INTO tags (id, name) VALUES
(1,  'beginner'),
(2,  'advanced'),
(3,  'video'),
(4,  'pdf'),
(5,  'practice'),
(6,  'notes'),
(7,  'tutorial'),
(8,  'career'),
(9,  'science'),
(10, 'math'),
(11, 'programming'),
(12, 'ai');

-- ------------------------------------------------------------
-- 8. Course-Tag relationships
-- ------------------------------------------------------------
INSERT IGNORE INTO course_tags (course_id, tag_id) VALUES
(1,  10), (1,  6),  (1,  7),
(2,  10), (2,  2),  (2,  6),
(3,  11), (3,  7),  (3,  5),
(4,  12), (4,  11), (4,  7),
(5,  9),  (5,  6),  (5,  7),
(6,  9),  (6,  5),  (6,  1),
(7,  1),  (7,  6),
(8,  1),  (8,  7),
(9,  11), (9,  1),  (9,  8), (9, 7),
(10, 10), (10, 12), (10, 5);

-- ------------------------------------------------------------
-- 9. Course Reviews / Ratings
-- ------------------------------------------------------------
INSERT IGNORE INTO course_reviews (id, course_id, user_id, rating, review_text, created_at, updated_at) VALUES
(1,  1, 2, 5, 'Clear explanations and great practice problems. Highly recommended for calculus beginners.',          NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY),
(2,  1, 4, 4, 'Solid course, though I wish there were more challenging exercises near the end.',                       NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 18 DAY),
(3,  3, 3, 5, 'The DSA course made interview prep so much easier. Well-structured lessons.',                              NOW() - INTERVAL 22 DAY, NOW() - INTERVAL 22 DAY),
(4,  3, 5, 4, 'Good pacing and helpful examples. The graph section could be deeper.',                                       NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 19 DAY),
(5,  4, 3, 4, 'Great intro to ML. The neural network lesson was a bit fast, but overall very useful.',                    NOW() - INTERVAL 21 DAY, NOW() - INTERVAL 21 DAY),
(6,  4, 6, 5, 'Excellent balance of theory and hands-on examples. Loved the PyTorch intro.',                                NOW() - INTERVAL 17 DAY, NOW() - INTERVAL 17 DAY),
(7,  5, 5, 5, 'CRISPR module was fascinating. Perfect for biology students.',                                               NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 16 DAY),
(8,  6, 6, 4, 'Good physics refresher. The problem sets really help cement the concepts.',                                  NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),
(9,  7, 7, 5, 'Engaging narrative style. I finally understand the lead-up to WWI.',                                         NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 14 DAY),
(10, 8, 7, 4, 'Fun prompts and supportive structure. Good for building a writing habit.',                                   NOW() - INTERVAL 13 DAY, NOW() - INTERVAL 13 DAY),
(11, 9, 2, 5, 'Comprehensive bootcamp. The React and Spring Boot sections tie together nicely.',                            NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 12 DAY),
(12, 9, 8, 3, 'A lot of content but moves quickly. Better suited for people with some coding background.',                NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),
(13, 10, 3, 4, 'Clear statistics course with practical Python examples. Regression section is especially strong.',          NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 11 DAY),
(14, 10, 4, 5, 'Exactly what I needed to bridge the gap between theory and applied data science.',                         NOW() - INTERVAL 9 DAY,  NOW() - INTERVAL 9 DAY);

SET FOREIGN_KEY_CHECKS = 1;
