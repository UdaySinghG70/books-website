-- ============================================================
-- Books Website – Database Setup
-- Run this in phpMyAdmin > SQL tab (against booksdb)
-- Or: mysql -u root booksdb < database/init.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `booksdb`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `booksdb`;

-- --------------------------------------------------------
-- Users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(191) NOT NULL,
  `email`      VARCHAR(191) NOT NULL,
  `password`   VARCHAR(191) NOT NULL,
  `role`       ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Categories (3-level tree via self-reference)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(191) NOT NULL,
  `level`     TINYINT      NOT NULL COMMENT '1=root 2=sub 3=leaf',
  `parent_id` INT          NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_parent_id_idx` (`parent_id`),
  CONSTRAINT `categories_parent_fk`
    FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Books
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `books` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(191) NOT NULL,
  `author`      VARCHAR(191) NOT NULL,
  `description` TEXT         NULL,
  `cover_image` VARCHAR(512) NULL,
  `category_id` INT          NULL DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `books_category_id_idx` (`category_id`),
  CONSTRAINT `books_category_fk`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Favorites
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `favorites` (
  `id`         INT      NOT NULL AUTO_INCREMENT,
  `user_id`    INT      NOT NULL,
  `book_id`    INT      NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_user_book_unique` (`user_id`, `book_id`),
  KEY `favorites_book_id_idx` (`book_id`),
  CONSTRAINT `favorites_user_fk`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorites_book_fk`
    FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
