mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: lumina_media
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `approval_records`
--

DROP TABLE IF EXISTS `approval_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_records` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant' COMMENT 'ç§Ÿæˆ·ID',
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å·¥ä½œæµID',
  `node_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'èŠ‚ç‚¹ID',
  `action` enum('APPROVE','REJECT','RETURN_FOR_REVISION','TRANSFER','EXPEDITE') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å®¡æ‰¹åŠ¨ä½œ',
  `actor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å®¡æ‰¹äººID',
  `comments` text COLLATE utf8mb4_unicode_ci COMMENT 'å®¡æ‰¹æ„è§',
  `attachments` text COLLATE utf8mb4_unicode_ci COMMENT 'é™„ä»¶URLï¼ˆé€—å·åˆ†éš”ï¼‰',
  `transfer_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'è½¬äº¤ç›®æ ‡ç”¨æˆ·ID',
  `is_expedited` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'åŠ æ€¥æ ‡è®°',
  `previous_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'å®¡æ‰¹å‰çŠ¶æ€',
  `new_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'å®¡æ‰¹åŽçŠ¶æ€',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IPåœ°å€',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT 'ç”¨æˆ·ä»£ç†',
  `device` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'è®¾å¤‡ä¿¡æ¯',
  `location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'åœ°ç†ä½ç½®',
  `metadata` json DEFAULT NULL COMMENT 'å…ƒæ•°æ®',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_workflow_id` (`workflow_id`),
  KEY `idx_node_id` (`node_id`),
  KEY `idx_actor_id` (`actor_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='å®¡æ‰¹è®°å½•è¡¨';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `content_drafts`
--

DROP TABLE IF EXISTS `content_drafts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content_drafts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”ç”¨æˆ·ID',
  `platform_type` enum('XHS','WECHAT_MP') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'é€‚é…å¹³å°',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'AIç”Ÿæˆçš„æ ‡é¢˜',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'AIç”Ÿæˆçš„æ­£æ–‡',
  `media_urls` json DEFAULT NULL COMMENT 'é˜¿é‡Œäº‘OSSä¸Šçš„å›¾ç‰‡/è§†é¢‘é“¾æŽ¥ï¼ˆJSONæ•°ç»„ï¼‰',
  `tags` json DEFAULT NULL COMMENT 'è¯é¢˜æ ‡ç­¾ï¼ˆJSONæ•°ç»„ï¼‰',
  `generated_by` enum('AI_GENERATED','MANUAL','TEMPLATE','HYBRID') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ç”Ÿæˆæ–¹å¼æžšä¸¾',
  `quality_score` decimal(5,2) DEFAULT NULL COMMENT 'è´¨é‡è¯„åˆ† (0-100)',
  `ai_generated_content` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„AIç”Ÿæˆè¯¦æƒ…',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'æ›´æ–°æ—¶é—´',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  PRIMARY KEY (`id`,`tenant_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_platform_type` (`platform_type`),
  KEY `idx_content_drafts_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='å†…å®¹è‰ç¨¿åº“'
/*!50100 PARTITION BY KEY (tenant_id)
PARTITIONS 16 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customer_profiles`
--

DROP TABLE IF EXISTS `customer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_profiles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”ç”¨æˆ·ID',
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å®¢æˆ·åç§°',
  `customer_type` enum('ENTERPRISE','SME','INDIVIDUAL_BUSINESS','INDIVIDUAL','GOVERNMENT','NON_PROFIT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENTERPRISE' COMMENT 'å®¢æˆ·ç±»åž‹æžšä¸¾',
  `industry` enum('RETAIL','ECOMMERCE','RESTAURANT','EDUCATION','HEALTHCARE','FINANCE','REAL_ESTATE','TRAVEL_HOTEL','MANUFACTURING','TECHNOLOGY','MEDIA_ENTERTAINMENT','AUTOMOTIVE','FASHION_BEAUTY','SPORTS_FITNESS','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTHER' COMMENT 'è¡Œä¸šåˆ†ç±»æžšä¸¾',
  `data_sources` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„æ•°æ®æºä¿¡æ¯',
  `profile_data` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„å®¢æˆ·æ¡£æ¡ˆæ•°æ®',
  `behavior_insights` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„è¡Œä¸ºæ´žå¯Ÿæ•°æ®',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'æ›´æ–°æ—¶é—´',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  `is_preset` tinyint(1) DEFAULT '0' COMMENT 'æ˜¯å¦ä¸ºé¢„ç½®æ¼”ç¤ºæ•°æ®',
  `demo_scenario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'æ¼”ç¤ºåœºæ™¯åç§°',
  PRIMARY KEY (`id`,`tenant_id`),
  KEY `idx_user_id_customer_type` (`user_id`,`customer_type`),
  KEY `idx_industry_created_at` (`industry`,`created_at`),
  KEY `idx_customer_profiles_user_industry` (`user_id`,`industry`),
  KEY `idx_customer_profiles_tenant_id` (`tenant_id`),
  KEY `idx_customer_profiles_is_preset` (`is_preset`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='å®¢æˆ·æ¡£æ¡ˆ'
/*!50100 PARTITION BY KEY (tenant_id)
PARTITIONS 16 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customer_segments`
--

DROP TABLE IF EXISTS `customer_segments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_segments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `customer_profile_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”å®¢æˆ·æ¡£æ¡ˆID',
  `segment_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'åˆ†ç¾¤åç§°',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'åˆ†ç¾¤æè¿°',
  `criteria` json NOT NULL COMMENT 'JSONæ ¼å¼çš„åˆ†ç¾¤è§„åˆ™',
  `member_count` int NOT NULL DEFAULT '0' COMMENT 'æˆå‘˜æ•°é‡',
  `member_ids` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„æˆå‘˜IDåˆ—è¡¨',
  `segment_insights` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„åˆ†ç¾¤æ´žå¯Ÿæ•°æ®',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'æ›´æ–°æ—¶é—´',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  PRIMARY KEY (`id`),
  KEY `idx_customer_profile_id_segment_name` (`customer_profile_id`,`segment_name`),
  KEY `idx_customer_segments_member_count` (`member_count` DESC),
  KEY `idx_customer_segments_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='å®¢æˆ·åˆ†ç¾¤';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_import_jobs`
--

DROP TABLE IF EXISTS `data_import_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_import_jobs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `customer_profile_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”å®¢æˆ·æ¡£æ¡ˆID',
  `source_type` enum('CSV','EXCEL','JSON','DATABASE','API','MANUAL','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CSV' COMMENT 'æ•°æ®æºç±»åž‹æžšä¸¾',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'æ–‡ä»¶å­˜å‚¨è·¯å¾„',
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'åŽŸå§‹æ–‡ä»¶å',
  `record_count` int NOT NULL DEFAULT '0' COMMENT 'æ€»è®°å½•æ•°',
  `success_count` int NOT NULL DEFAULT '0' COMMENT 'æˆåŠŸå¯¼å…¥è®°å½•æ•°',
  `failed_count` int NOT NULL DEFAULT '0' COMMENT 'å¯¼å…¥å¤±è´¥è®°å½•æ•°',
  `status` enum('PENDING','PROCESSING','SUCCESS','FAILED','PARTIAL_SUCCESS','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT 'å¯¼å…¥çŠ¶æ€æžšä¸¾',
  `error_message` text COLLATE utf8mb4_unicode_ci COMMENT 'é”™è¯¯ä¿¡æ¯',
  `validation_errors` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„éªŒè¯é”™è¯¯åˆ—è¡¨',
  `summary` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„å¯¼å…¥æ‘˜è¦',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'å¤‡æ³¨ä¿¡æ¯',
  `import_data` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„å¯¼å…¥æ•°æ®ï¼ˆåŽŸå§‹æ•°æ®æˆ–å¤„ç†åŽçš„æ•°æ®ï¼‰',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `started_at` timestamp NULL DEFAULT NULL COMMENT 'å¼€å§‹å¤„ç†æ—¶é—´',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'å®Œæˆæ—¶é—´',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  PRIMARY KEY (`id`),
  KEY `idx_customer_profile_id_status` (`customer_profile_id`,`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_data_import_jobs_status_date` (`status`,`created_at`),
  KEY `idx_data_import_jobs_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='æ•°æ®å¯¼å…¥ä»»åŠ¡';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feature_configs`
--

DROP TABLE IF EXISTS `feature_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feature_configs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `feature_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'åŠŸèƒ½åç§°',
  `feature_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'åŠŸèƒ½å”¯ä¸€æ ‡è¯†ï¼ˆå¦‚customer-analyticsï¼‰',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'åŠŸèƒ½æè¿°',
  `module_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å¯¹åº”çš„æ¨¡å—å',
  `tenant_types` json NOT NULL COMMENT 'é€‚ç”¨çš„ç§Ÿæˆ·ç±»åž‹æ•°ç»„',
  `required_permissions` json DEFAULT NULL COMMENT 'æ‰€éœ€æƒé™åˆ—è¡¨ï¼ˆmodule:actionæ ¼å¼ï¼‰',
  `is_enabled_by_default` tinyint(1) DEFAULT '1' COMMENT 'æ˜¯å¦é»˜è®¤å¯ç”¨',
  `requires_ai` tinyint(1) DEFAULT '0' COMMENT 'æ˜¯å¦éœ€è¦AIæœåŠ¡',
  `requires_publish` tinyint(1) DEFAULT '0' COMMENT 'æ˜¯å¦éœ€è¦å‘å¸ƒåŠŸèƒ½',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feature_configs_feature_key` (`feature_key`),
  KEY `idx_feature_configs_feature_key` (`feature_key`),
  KEY `idx_feature_configs_module_name` (`module_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='åŠŸèƒ½é…ç½®è¡¨';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `government_contents`
--

DROP TABLE IF EXISTS `government_contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `government_contents` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issuing_authority` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `content_text` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `compliance_score` decimal(5,2) DEFAULT NULL,
  `is_preset` tinyint(1) DEFAULT '0' COMMENT 'æ˜¯å¦ä¸ºé¢„ç½®æ¼”ç¤ºæ•°æ®',
  `demo_scenario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'æ¼”ç¤ºåœºæ™¯åç§°',
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_content_type` (`content_type`),
  KEY `idx_is_preset` (`is_preset`),
  KEY `idx_demo_scenario` (`demo_scenario`),
  KEY `idx_government_contents_is_preset` (`is_preset`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `marketing_campaigns`
--

DROP TABLE IF EXISTS `marketing_campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketing_campaigns` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”ç”¨æˆ·ID',
  `customer_profile_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'å…³è”å®¢æˆ·æ¡£æ¡ˆID',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'æ´»åŠ¨åç§°',
  `campaign_type` enum('ONLINE','OFFLINE','HYBRID') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'æ´»åŠ¨ç±»åž‹æžšä¸¾',
  `target_audience` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„ç›®æ ‡å—ä¼—æè¿°',
  `budget` decimal(10,2) DEFAULT '0.00' COMMENT 'é¢„ç®—é‡‘é¢',
  `status` enum('DRAFT','ACTIVE','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT' COMMENT 'æ´»åŠ¨çŠ¶æ€æžšä¸¾',
  `start_date` date DEFAULT NULL COMMENT 'å¼€å§‹æ—¥æœŸ',
  `end_date` date DEFAULT NULL COMMENT 'ç»“æŸæ—¥æœŸ',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  `is_preset` tinyint(1) DEFAULT '0' COMMENT 'æ˜¯å¦ä¸ºé¢„ç½®æ¼”ç¤ºæ•°æ®',
  PRIMARY KEY (`id`),
  KEY `idx_user_id_status` (`user_id`,`status`),
  KEY `idx_start_date_end_date` (`start_date`,`end_date`),
  KEY `idx_campaigns_date_range` (`start_date`,`end_date`,`status`),
  KEY `idx_customer_profile_id_status` (`customer_profile_id`,`status`),
  KEY `idx_marketing_campaigns_tenant_id` (`tenant_id`),
  KEY `idx_marketing_campaigns_is_preset` (`is_preset`),
  CONSTRAINT `fk_marketing_campaigns_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='è¥é”€æ´»åŠ¨';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `marketing_strategies`
--

DROP TABLE IF EXISTS `marketing_strategies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketing_strategies` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `campaign_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”è¥é”€æ´»åŠ¨ID',
  `strategy_type` enum('CONTENT','CHANNEL','TIMING','BUDGET_ALLOCATION') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ç­–ç•¥ç±»åž‹æžšä¸¾',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ç­–ç•¥æè¿°',
  `implementation_plan` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„å®žæ–½è®¡åˆ’',
  `expected_roi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confidence_score` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generated_by` enum('AI_GENERATED','MANUAL','TEMPLATE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AI_GENERATED' COMMENT 'ç”Ÿæˆæ–¹å¼æžšä¸¾',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `customer_profile_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'å…³è”å®¢æˆ·æ¡£æ¡ˆID',
  `campaign_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'æ´»åŠ¨åç§°',
  `target_audience_analysis` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„ç›®æ ‡å—ä¼—åˆ†æž',
  `core_idea` text COLLATE utf8mb4_unicode_ci COMMENT 'æ ¸å¿ƒåˆ›æ„',
  `xhs_content` text COLLATE utf8mb4_unicode_ci COMMENT 'å°çº¢ä¹¦æ–‡æ¡ˆå†…å®¹',
  `wechat_full_plan` json DEFAULT NULL COMMENT 'å¾®ä¿¡å…¨æ¡ˆæ·±åº¦æ–¹æ¡ˆï¼ˆJSONæ ¼å¼ï¼‰',
  `recommended_execution_time` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„æŽ¨èæ‰§è¡Œæ—¶é—´',
  `expected_performance_metrics` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„é¢„æœŸæ•ˆæžœæŒ‡æ ‡',
  `execution_steps` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„æ‰§è¡Œæ­¥éª¤è®¡åˆ’',
  `risk_assessment` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„é£Žé™©è¯„ä¼°',
  `budget_allocation` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„é¢„ç®—åˆ†é…æ–¹æ¡ˆ',
  `ai_response_raw` text COLLATE utf8mb4_unicode_ci COMMENT 'AIåŽŸå§‹å“åº”æ–‡æœ¬',
  `generated_content_ids` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„ç”Ÿæˆå†…å®¹IDæ•°ç»„',
  `content_platforms` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„å†…å®¹å¹³å°æ•°ç»„',
  `ai_engine` enum('QWEN','GEMINI','FALLBACK') COLLATE utf8mb4_unicode_ci DEFAULT 'FALLBACK',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  PRIMARY KEY (`id`,`tenant_id`),
  KEY `idx_campaign_id` (`campaign_id`),
  KEY `idx_strategy_type` (`strategy_type`),
  KEY `idx_confidence_score` (`confidence_score`),
  KEY `idx_strategies_confidence` (`campaign_id`,`confidence_score` DESC),
  KEY `idx_marketing_strategies_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='è¥é”€ç­–ç•¥'
/*!50100 PARTITION BY KEY (tenant_id)
PARTITIONS 16 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tenant_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'é€‚ç”¨ç§Ÿæˆ·ç±»åž‹',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_module_action_tenant` (`module`,`action`,`tenant_id`),
  KEY `idx_permissions_tenant_id` (`tenant_id`),
  KEY `idx_permissions_module` (`module`),
  KEY `idx_permissions_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `publish_tasks`
--

DROP TABLE IF EXISTS `publish_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publish_tasks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `draft_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”å†…å®¹è‰ç¨¿ID',
  `account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”ç¤¾äº¤è´¦å·ID',
  `status` enum('PENDING','PROCESSING','SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT 'ä»»åŠ¡çŠ¶æ€',
  `scheduled_at` timestamp NULL DEFAULT NULL COMMENT 'è®¡åˆ’å‘å¸ƒæ—¶é—´',
  `published_at` timestamp NULL DEFAULT NULL COMMENT 'å®žé™…å®Œæˆæ—¶é—´',
  `post_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'å‘å¸ƒæˆåŠŸåŽçš„çº¿ä¸Šé“¾æŽ¥',
  `error_message` text COLLATE utf8mb4_unicode_ci COMMENT 'å¤±è´¥åŽŸå› è®°å½•',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  PRIMARY KEY (`id`,`tenant_id`),
  KEY `idx_draft_id` (`draft_id`),
  KEY `idx_account_id` (`account_id`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled_at` (`scheduled_at`),
  KEY `idx_publish_tasks_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='å‘å¸ƒä»»åŠ¡é˜Ÿåˆ—'
/*!50100 PARTITION BY KEY (tenant_id)
PARTITIONS 16 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `idx_role_permissions_role_id` (`role_id`),
  KEY `idx_role_permissions_permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tenant_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'é€‚ç”¨ç§Ÿæˆ·ç±»åž‹',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name_tenant` (`name`,`tenant_id`),
  KEY `idx_roles_tenant_id` (`tenant_id`),
  KEY `idx_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `social_accounts`
--

DROP TABLE IF EXISTS `social_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_accounts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”ç”¨æˆ·ID',
  `platform` enum('XHS','WECHAT_MP') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å¹³å°æžšä¸¾ (å°çº¢ä¹¦/å¾®ä¿¡å…¬ä¼—å·)',
  `account_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'è´¦å·æ˜¾ç¤ºåç§°',
  `credentials` json DEFAULT NULL COMMENT 'åŠ å¯†å­˜å‚¨çš„Cookie/Session/Tokenç­‰',
  `status` enum('ACTIVE','EXPIRED','RE_AUTH_REQUIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT 'è´¦å·çŠ¶æ€',
  `last_used_at` timestamp NULL DEFAULT NULL COMMENT 'æœ€åŽä¸€æ¬¡ä½¿ç”¨æ—¶é—´',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_platform` (`platform`),
  KEY `idx_status` (`status`),
  KEY `idx_social_accounts_tenant_id` (`tenant_id`),
  CONSTRAINT `fk_social_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ç¤¾äº¤è´¦å·ç®¡ç†';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenant_feature_toggles`
--

DROP TABLE IF EXISTS `tenant_feature_toggles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_feature_toggles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ç§Ÿæˆ·ID',
  `feature_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'åŠŸèƒ½å”¯ä¸€æ ‡è¯†',
  `is_enabled` tinyint(1) DEFAULT '1' COMMENT 'æ˜¯å¦å¯ç”¨',
  `enabled_at` timestamp NULL DEFAULT NULL COMMENT 'å¯ç”¨æ—¶é—´',
  `disabled_at` timestamp NULL DEFAULT NULL COMMENT 'ç¦ç”¨æ—¶é—´',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_feature` (`tenant_id`,`feature_key`),
  KEY `idx_tenant_feature_toggles_tenant_id` (`tenant_id`),
  KEY `idx_tenant_feature_toggles_feature_key` (`feature_key`),
  CONSTRAINT `tenant_feature_toggles_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ç§Ÿæˆ·åŠŸèƒ½å¼€å…³è¡¨';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','suspended','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_behaviors`
--

DROP TABLE IF EXISTS `user_behaviors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_behaviors` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å…³è”ç”¨æˆ·ID',
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ä¼šè¯æ ‡è¯†',
  `event_type` enum('PAGE_VIEW','CONTENT_CREATE','PUBLISH_TASK','LOGIN','LOGOUT','CAMPAIGN_CREATE','STRATEGY_GENERATE','REPORT_VIEW') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'äº‹ä»¶ç±»åž‹æžšä¸¾',
  `event_data` json DEFAULT NULL COMMENT 'JSONæ ¼å¼çš„äº‹ä»¶è¯¦æƒ…',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'äº‹ä»¶å‘ç”Ÿæ—¶é—´',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  PRIMARY KEY (`id`,`tenant_id`),
  KEY `idx_user_id_timestamp` (`user_id`,`timestamp`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_user_behaviors_composite` (`user_id`,`event_type`,`timestamp`),
  KEY `idx_user_behaviors_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ç”¨æˆ·è¡Œä¸ºè®°å½•'
/*!50100 PARTITION BY KEY (tenant_id)
PARTITIONS 16 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `idx_user_roles_user_id` (`user_id`),
  KEY `idx_user_roles_role_id` (`role_id`),
  KEY `idx_user_roles_tenant_id` (`tenant_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ç™»å½•å',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'åŠ å¯†åŽçš„å¯†ç ',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'è”ç³»é‚®ç®±',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_users_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ç³»ç»Ÿç”¨æˆ·';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflow_nodes`
--

DROP TABLE IF EXISTS `workflow_nodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_nodes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant' COMMENT 'ç§Ÿæˆ·ID',
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å·¥ä½œæµID',
  `node_index` int NOT NULL COMMENT 'èŠ‚ç‚¹ç´¢å¼•ï¼ˆé¡ºåºï¼‰',
  `node_type` enum('EDITOR','AI','MANAGER','LEGAL','PARALLEL','SEQUENTIAL') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'èŠ‚ç‚¹ç±»åž‹',
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'èŠ‚ç‚¹åç§°',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'èŠ‚ç‚¹æè¿°',
  `status` enum('DRAFT','EDITOR_REVIEW','AI_CHECK','MANAGER_REVIEW','LEGAL_REVIEW','APPROVED','PUBLISHED','REJECTED','NEEDS_REVISION','WITHDRAWN','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT' COMMENT 'èŠ‚ç‚¹çŠ¶æ€',
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'èŠ‚ç‚¹å¤„ç†äººID',
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'èŠ‚ç‚¹å¤„ç†è§’è‰²',
  `is_mandatory` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'æ˜¯å¦ä¸ºå¿…å®¡èŠ‚ç‚¹',
  `is_parallel` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'æ˜¯å¦ä¸ºå¹¶è¡ŒèŠ‚ç‚¹',
  `parallel_group` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'å¹¶è¡Œç»„æ ‡è¯†',
  `timeout_hours` int DEFAULT NULL COMMENT 'è¶…æ—¶æ—¶é—´ï¼ˆå°æ—¶ï¼‰',
  `started_at` timestamp NULL DEFAULT NULL COMMENT 'èŠ‚ç‚¹å¼€å§‹æ—¶é—´',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'èŠ‚ç‚¹å®Œæˆæ—¶é—´',
  `timeout_at` timestamp NULL DEFAULT NULL COMMENT 'èŠ‚ç‚¹è¶…æ—¶æ—¶é—´',
  `result` json DEFAULT NULL COMMENT 'èŠ‚ç‚¹å¤„ç†ç»“æžœ',
  `config` json DEFAULT NULL COMMENT 'èŠ‚ç‚¹é…ç½®',
  `dependencies` text COLLATE utf8mb4_unicode_ci COMMENT 'å‰ç½®èŠ‚ç‚¹IDï¼ˆé€—å·åˆ†éš”ï¼‰',
  `metadata` json DEFAULT NULL COMMENT 'èŠ‚ç‚¹å…ƒæ•°æ®',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'æ›´æ–°æ—¶é—´',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_workflow_id` (`workflow_id`),
  KEY `idx_node_type` (`node_type`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_parallel_group` (`parallel_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='å·¥ä½œæµèŠ‚ç‚¹è¡¨';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflow_notifications`
--

DROP TABLE IF EXISTS `workflow_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant' COMMENT 'ç§Ÿæˆ·ID',
  `type` enum('TASK_ASSIGNED','PENDING_APPROVAL','APPROVAL_COMPLETED','APPROVAL_TIMEOUT','WORKFLOW_STATUS_CHANGED','URGENT_APPROVAL') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'é€šçŸ¥ç±»åž‹',
  `recipient_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'æŽ¥æ”¶äººID',
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'å·¥ä½œæµID',
  `node_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'èŠ‚ç‚¹ID',
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'é€šçŸ¥æ ‡é¢˜',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'é€šçŸ¥å†…å®¹',
  `status` enum('PENDING','SENT','READ','ACTIONED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT 'é€šçŸ¥çŠ¶æ€',
  `channels` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å‘é€æ¸ é“ï¼ˆé€—å·åˆ†éš”ï¼‰',
  `sent_at` timestamp NULL DEFAULT NULL COMMENT 'å‘é€æ—¶é—´',
  `read_at` timestamp NULL DEFAULT NULL COMMENT 'é˜…è¯»æ—¶é—´',
  `actioned_at` timestamp NULL DEFAULT NULL COMMENT 'åŠ¨ä½œæ—¶é—´',
  `priority` tinyint NOT NULL DEFAULT '3' COMMENT 'é€šçŸ¥ä¼˜å…ˆçº§ (1-5)',
  `is_silent` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'æ˜¯å¦é™é»˜é€šçŸ¥',
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'æ˜¯å¦é‡å¤é€šçŸ¥',
  `recurrence_interval` int DEFAULT NULL COMMENT 'é‡å¤é—´éš”ï¼ˆåˆ†é’Ÿï¼‰',
  `next_send_at` timestamp NULL DEFAULT NULL COMMENT 'ä¸‹æ¬¡å‘é€æ—¶é—´',
  `retry_count` int NOT NULL DEFAULT '0' COMMENT 'é‡è¯•æ¬¡æ•°',
  `max_retries` int NOT NULL DEFAULT '3' COMMENT 'æœ€å¤§é‡è¯•æ¬¡æ•°',
  `failure_reason` text COLLATE utf8mb4_unicode_ci COMMENT 'å¤±è´¥åŽŸå› ',
  `metadata` json DEFAULT NULL COMMENT 'é€šçŸ¥å…ƒæ•°æ®',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'æ›´æ–°æ—¶é—´',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_recipient_id` (`recipient_id`),
  KEY `idx_workflow_id` (`workflow_id`),
  KEY `idx_node_id` (`node_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='å·¥ä½œæµé€šçŸ¥è¡¨';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflows`
--

DROP TABLE IF EXISTS `workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflows` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID ä¸»é”®',
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default-tenant' COMMENT 'ç§Ÿæˆ·ID',
  `content_draft_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'å†…å®¹è‰ç¨¿ID',
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'åˆ›å»ºè€…ç”¨æˆ·ID',
  `title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'å·¥ä½œæµæ ‡é¢˜',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'å·¥ä½œæµæè¿°',
  `status` enum('DRAFT','EDITOR_REVIEW','AI_CHECK','MANAGER_REVIEW','LEGAL_REVIEW','APPROVED','PUBLISHED','REJECTED','NEEDS_REVISION','WITHDRAWN','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT' COMMENT 'å·¥ä½œæµçŠ¶æ€',
  `priority` tinyint NOT NULL DEFAULT '3' COMMENT 'ä¼˜å…ˆçº§ (1-5, 1æœ€ä½Ž, 5æœ€é«˜)',
  `is_expedited` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'æ˜¯å¦ä¸ºåŠ æ€¥æµç¨‹',
  `expected_completion_at` timestamp NULL DEFAULT NULL COMMENT 'æœŸæœ›å®Œæˆæ—¶é—´',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'å®žé™…å®Œæˆæ—¶é—´',
  `config` json DEFAULT NULL COMMENT 'å·¥ä½œæµé…ç½® (èŠ‚ç‚¹é…ç½®ã€å®¡æ‰¹è§„åˆ™ç­‰)',
  `current_node_index` int NOT NULL DEFAULT '0' COMMENT 'å½“å‰æ´»è·ƒèŠ‚ç‚¹ç´¢å¼•',
  `completed_nodes_count` int NOT NULL DEFAULT '0' COMMENT 'å·²å®ŒæˆèŠ‚ç‚¹æ•°é‡',
  `total_nodes_count` int NOT NULL DEFAULT '0' COMMENT 'æ€»èŠ‚ç‚¹æ•°é‡',
  `approval_history` json DEFAULT NULL COMMENT 'å®¡æ‰¹åŽ†å²è®°å½•ï¼ˆæ‘˜è¦ä¿¡æ¯ï¼‰',
  `metadata` json DEFAULT NULL COMMENT 'å…ƒæ•°æ® (ä¿®æ”¹æ¬¡æ•°ã€è€—æ—¶ç»Ÿè®¡ç­‰)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'åˆ›å»ºæ—¶é—´',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'æ›´æ–°æ—¶é—´',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_content_draft_id` (`content_draft_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_is_expedited` (`is_expedited`),
  KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ä¸‰å®¡ä¸‰æ ¡å·¥ä½œæµä¸»è¡¨';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-04  0:28:18
