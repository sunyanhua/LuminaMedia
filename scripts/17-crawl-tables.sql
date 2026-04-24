-- Migration: Create crawl_tasks and crawl_queues tables
-- Date: 2026-04-24

-- Create crawl_tasks table
CREATE TABLE IF NOT EXISTS `crawl_tasks` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `tenant_id` VARCHAR(36) NOT NULL,
  `source_url` VARCHAR(2000) NOT NULL,
  `mode` ENUM('SINGLE', 'PROJECT', 'SITE') NOT NULL DEFAULT 'SINGLE',
  `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `total_urls` INT NOT NULL DEFAULT 0,
  `crawled_count` INT NOT NULL DEFAULT 0,
  `failed_count` INT NOT NULL DEFAULT 0,
  `started_at` DATETIME NULL,
  `completed_at` DATETIME NULL,
  `category` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tenant_status` (`tenant_id`, `status`),
  INDEX `idx_tenant_created` (`tenant_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create crawl_queues table
CREATE TABLE IF NOT EXISTS `crawl_queues` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `task_id` VARCHAR(36) NOT NULL,
  `url` VARCHAR(2000) NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `priority` INT NOT NULL DEFAULT 0,
  `error` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_task_status` (`task_id`, `status`),
  INDEX `idx_url` (`url`(255)),
  CONSTRAINT `fk_crawl_queue_task` FOREIGN KEY (`task_id`) REFERENCES `crawl_tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
