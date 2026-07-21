-- ============================================================
-- Seed data — run AFTER init.sql
-- ============================================================

USE `booksdb`;

-- --------------------------------------------------------
-- Users
-- admin123 and user123 (bcrypt hashed, cost 10)
-- --------------------------------------------------------
INSERT IGNORE INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Admin',    'admin@bookstore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('John Doe', 'user@bookstore.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER');

-- NOTE: The hash above is for the literal string "password".
-- To use admin123 / user123 you must run: node database/seed.js
-- (the .js seed hashes them properly with bcrypt)

-- --------------------------------------------------------
-- Categories – Level 1
-- --------------------------------------------------------
INSERT IGNORE INTO `categories` (`id`, `name`, `level`, `parent_id`) VALUES
(1, 'Fiction',     1, NULL),
(2, 'Non-Fiction', 1, NULL);

-- Level 2
INSERT IGNORE INTO `categories` (`id`, `name`, `level`, `parent_id`) VALUES
(3, 'Romance',   2, 1),
(4, 'Adventure', 2, 1),
(5, 'Biography', 2, 2),
(6, 'Technology',2, 2);

-- Level 3
INSERT IGNORE INTO `categories` (`id`, `name`, `level`, `parent_id`) VALUES
(7,  'Classic',       3, 3),
(8,  'Quest',         3, 4),
(9,  'Autobiography', 3, 5),
(10, 'Programming',   3, 6);

-- --------------------------------------------------------
-- Books
-- --------------------------------------------------------
INSERT INTO `books` (`title`, `author`, `description`, `category_id`) VALUES
('The Great Gatsby',                  'F. Scott Fitzgerald', 'A novel set in the Jazz Age on Long Island, near New York City. The story is narrated by Nick Carraway.',                              7),
('Pride and Prejudice',               'Jane Austen',         'A romantic novel following Elizabeth Bennet as she deals with issues of manners, upbringing, morality and marriage.',                7),
('The Alchemist',                     'Paulo Coelho',        'A philosophical novel following a young Andalusian shepherd on his journey to the pyramids of Egypt.',                              8),
('To Kill a Mockingbird',             'Harper Lee',          'A novel about racial injustice and the loss of innocence in the American South.',                                                  7),
('1984',                              'George Orwell',       'A dystopian novel set in a totalitarian society under constant surveillance.',                                                      1),
('The Hobbit',                        'J.R.R. Tolkien',      'Bilbo Baggins is swept into an epic quest to reclaim the lost Dwarf Kingdom of Erebor.',                                          8),
('The Catcher in the Rye',            'J.D. Salinger',       'A teenager narrates his experiences in New York City after being expelled from prep school.',                                      1),
('Atomic Habits',                     'James Clear',         'A practical guide on how tiny changes in behavior can lead to remarkable results.',                                                2),
('Sapiens',                           'Yuval Noah Harari',   'A brief history of humankind from the Stone Age to the present.',                                                                  2),
('The Da Vinci Code',                 'Dan Brown',           'A mystery thriller following symbologist Robert Langdon investigating a murder in the Louvre Museum.',                              4),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling',  'A young boy discovers he is a wizard and begins his education at Hogwarts.',                                                      1),
('The Lord of the Rings',             'J.R.R. Tolkien',      'An epic quest to destroy a powerful ring that could give a dark lord domination over the world.',                                  8),
('Brave New World',                   'Aldous Huxley',       'A dystopian novel set in a futuristic World State where citizens are conditioned for contentment.',                                1),
('The Hunger Games',                  'Suzanne Collins',     'In a dystopian future, teenagers are forced to participate in a televised death match.',                                           4),
('Gone with the Wind',                'Margaret Mitchell',   'A historical novel set during the American Civil War following the life of Scarlett O''Hara.',                                    3),
('Dune',                              'Frank Herbert',       'An epic science fiction novel set in a distant future amidst a feudal interstellar society.',                                      4),
('The Shining',                       'Stephen King',        'A writer becomes the winter caretaker of a haunted hotel and descends into madness.',                                              1),
('Steve Jobs',                        'Walter Isaacson',     'The exclusive biography of Steve Jobs based on more than forty interviews.',                                                       9),
('Clean Code',                        'Robert C. Martin',    'A handbook of agile software craftsmanship with best practices for writing clean maintainable code.',                              10),
('The Pragmatic Programmer',          'Andrew Hunt',         'A guide to improve your craft and build better software.',                                                                        10),
('Educated',                          'Tara Westover',       'A memoir by a woman who grows up in a survivalist family and eventually earns a PhD from Cambridge.',                             9),
('The Midnight Library',              'Matt Haig',           'A library between life and death where each book represents a different life you could have lived.',                               1),
('Where the Crawdads Sing',           'Delia Owens',         'A girl raises herself in the marshes of North Carolina while being a suspect in a murder case.',                                  3),
('The Power of Habit',                'Charles Duhigg',      'An exploration of the science behind habit creation and reformation.',                                                             2),
('Thinking, Fast and Slow',           'Daniel Kahneman',     'An examination of the two systems that drive the way we think and make choices.',                                                 2);
