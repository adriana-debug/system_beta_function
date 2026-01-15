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
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `request_id` int unsigned NOT NULL AUTO_INCREMENT,
  `request_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., REQ-2024-001',
  `employee_id` int unsigned NOT NULL,
  `request_type` enum('Leave','Training','Equipment','Overtime','Schedule Change','Certificate Request','Payroll Concern','Document Request','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `urgency` enum('Low','Medium','High','Critical') COLLATE utf8mb4_unicode_ci DEFAULT 'Medium',
  `status` enum('Draft','Pending','Approved','Rejected','Cancelled','In Progress','Completed','Fulfilled','On Hold') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `current_approver_id` int unsigned DEFAULT NULL,
  `approval_level` int DEFAULT '1',
  `date_submitted` date DEFAULT NULL,
  `date_needed` date DEFAULT NULL,
  `date_resolved` date DEFAULT NULL,
  `resolved_by` int unsigned DEFAULT NULL,
  `resolution_notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  UNIQUE KEY `request_code` (`request_code`),
  KEY `current_approver_id` (`current_approver_id`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_request_employee` (`employee_id`),
  KEY `idx_request_type` (`request_type`),
  KEY `idx_request_status` (`status`),
  KEY `idx_request_date` (`date_submitted`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE RESTRICT,
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`current_approver_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `requests_ibfk_3` FOREIGN KEY (`resolved_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 15:59:39
