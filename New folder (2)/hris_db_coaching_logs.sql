CREATE DATABASE  IF NOT EXISTS `hris_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `hris_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hris_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `coaching_logs`
--

DROP TABLE IF EXISTS `coaching_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coaching_logs` (
  `coaching_id` int unsigned NOT NULL AUTO_INCREMENT,
  `coaching_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., CL-2024-001',
  `employee_id` int unsigned NOT NULL,
  `session_date` date NOT NULL,
  `session_time` time DEFAULT NULL,
  `session_duration` int DEFAULT NULL COMMENT 'Duration in minutes',
  `session_type` enum('Performance','Behavior','Skills Development','Career Planning','Corrective','Mentoring','Other') COLLATE utf8mb4_unicode_ci DEFAULT 'Performance',
  `coach_id` int unsigned NOT NULL,
  `topics_discussed` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `strengths_identified` text COLLATE utf8mb4_unicode_ci,
  `areas_for_improvement` text COLLATE utf8mb4_unicode_ci,
  `action_items` text COLLATE utf8mb4_unicode_ci,
  `target_completion_date` date DEFAULT NULL,
  `next_session_date` date DEFAULT NULL,
  `follow_up_notes` text COLLATE utf8mb4_unicode_ci,
  `employee_feedback` text COLLATE utf8mb4_unicode_ci,
  `employee_signature` tinyint(1) DEFAULT '0',
  `employee_signature_date` date DEFAULT NULL,
  `status` enum('Scheduled','Completed','Cancelled','Rescheduled') COLLATE utf8mb4_unicode_ci DEFAULT 'Completed',
  `outcome` enum('Positive','Needs Improvement','Requires Follow-up','Escalated') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`coaching_id`),
  UNIQUE KEY `coaching_code` (`coaching_code`),
  KEY `idx_coaching_employee` (`employee_id`),
  KEY `idx_coaching_coach` (`coach_id`),
  KEY `idx_coaching_date` (`session_date`),
  CONSTRAINT `coaching_logs_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE RESTRICT,
  CONSTRAINT `coaching_logs_ibfk_2` FOREIGN KEY (`coach_id`) REFERENCES `employees` (`employee_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coaching_logs`
--

LOCK TABLES `coaching_logs` WRITE;
/*!40000 ALTER TABLE `coaching_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `coaching_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 15:59:37
