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
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `document_id` int unsigned NOT NULL AUTO_INCREMENT,
  `document_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., DOC-IR-2024-001',
  `document_type` enum('IR','NTE','VerbalWarning','CoachingLog','WrittenWarning','Suspension','Termination','LeaveApproval','TrainingCertificate','EmploymentContract','COE','Clearance','PayslipRequest','ServiceRecord','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` int unsigned DEFAULT NULL,
  `ir_nte_case_id` int unsigned DEFAULT NULL,
  `coaching_id` int unsigned DEFAULT NULL,
  `verbal_warning_id` int unsigned DEFAULT NULL,
  `written_warning_id` int unsigned DEFAULT NULL,
  `suspension_id` int unsigned DEFAULT NULL,
  `request_id` int unsigned DEFAULT NULL,
  `template_id` int unsigned DEFAULT NULL,
  `content_html` longtext COLLATE utf8mb4_unicode_ci COMMENT 'HTML content for preview/editing',
  `content_data` json DEFAULT NULL COMMENT 'Structured data used to generate document',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path to generated PDF',
  `file_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL COMMENT 'Size in bytes',
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'application/pdf',
  `status` enum('Draft','Generated','Pending Signature','Signed','Approved','Released','Archived','Voided') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `prepared_by` int unsigned DEFAULT NULL,
  `prepared_date` date DEFAULT NULL,
  `reviewed_by` int unsigned DEFAULT NULL,
  `reviewed_date` date DEFAULT NULL,
  `approved_by` int unsigned DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `acknowledged_by_employee` tinyint(1) DEFAULT '0',
  `acknowledgment_date` date DEFAULT NULL,
  `employee_signature_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` int DEFAULT '1',
  `parent_document_id` int unsigned DEFAULT NULL COMMENT 'Link to previous version',
  `is_confidential` tinyint(1) DEFAULT '0',
  `access_level` enum('Public','Department','HR Only','Management Only','Confidential') COLLATE utf8mb4_unicode_ci DEFAULT 'HR Only',
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  UNIQUE KEY `document_code` (`document_code`),
  KEY `ir_nte_case_id` (`ir_nte_case_id`),
  KEY `coaching_id` (`coaching_id`),
  KEY `verbal_warning_id` (`verbal_warning_id`),
  KEY `written_warning_id` (`written_warning_id`),
  KEY `suspension_id` (`suspension_id`),
  KEY `request_id` (`request_id`),
  KEY `template_id` (`template_id`),
  KEY `prepared_by` (`prepared_by`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `approved_by` (`approved_by`),
  KEY `parent_document_id` (`parent_document_id`),
  KEY `idx_document_type` (`document_type`),
  KEY `idx_document_employee` (`employee_id`),
  KEY `idx_document_status` (`status`),
  KEY `idx_document_created` (`created_at`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_10` FOREIGN KEY (`reviewed_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_11` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_12` FOREIGN KEY (`parent_document_id`) REFERENCES `documents` (`document_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`ir_nte_case_id`) REFERENCES `ir_nte_logs` (`case_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`coaching_id`) REFERENCES `coaching_logs` (`coaching_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_4` FOREIGN KEY (`verbal_warning_id`) REFERENCES `verbal_warnings` (`warning_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_5` FOREIGN KEY (`written_warning_id`) REFERENCES `written_warnings` (`written_warning_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_6` FOREIGN KEY (`suspension_id`) REFERENCES `suspensions` (`suspension_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_7` FOREIGN KEY (`request_id`) REFERENCES `requests` (`request_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_8` FOREIGN KEY (`template_id`) REFERENCES `document_templates` (`template_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_9` FOREIGN KEY (`prepared_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 15:59:35
