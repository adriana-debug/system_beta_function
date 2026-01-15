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
-- Table structure for table `ir_nte_logs`
--

DROP TABLE IF EXISTS `ir_nte_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ir_nte_logs` (
  `case_id` int unsigned NOT NULL AUTO_INCREMENT,
  `case_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., IR-2024-001',
  `employee_id` int unsigned NOT NULL,
  `case_type` enum('IR','NTE','IR_NTE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NTE' COMMENT 'IR=Incident Report, NTE=Notice to Explain',
  `violation_type_id` int unsigned DEFAULT NULL,
  `violation_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_date` date NOT NULL,
  `incident_time` time DEFAULT NULL,
  `incident_location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_filed` date NOT NULL,
  `filed_by` int unsigned DEFAULT NULL COMMENT 'Employee who filed the case',
  `nte_served_date` date DEFAULT NULL COMMENT 'Date NTE was served to employee',
  `nte_received_date` date DEFAULT NULL COMMENT 'Date employee received NTE',
  `nte_deadline` date DEFAULT NULL COMMENT 'Deadline for explanation',
  `has_explanation_letter` tinyint(1) DEFAULT '0',
  `explanation_letter_date` date DEFAULT NULL,
  `explanation_letter_content` text COLLATE utf8mb4_unicode_ci,
  `explanation_letter_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `investigation_notes` text COLLATE utf8mb4_unicode_ci,
  `investigation_by` int unsigned DEFAULT NULL,
  `investigation_date` date DEFAULT NULL,
  `hearing_date` date DEFAULT NULL,
  `hearing_time` time DEFAULT NULL,
  `hearing_location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hearing_attendees` text COLLATE utf8mb4_unicode_ci,
  `hearing_minutes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Open','Under Review','Pending Response','Hearing Scheduled','Resolved','Closed','Dismissed','Appealed') COLLATE utf8mb4_unicode_ci DEFAULT 'Open',
  `resolution_type` enum('Verbal Warning','Written Warning','Final Written Warning','Suspension','Demotion','Termination','Dismissed','Exonerated','Other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution_description` text COLLATE utf8mb4_unicode_ci,
  `resolution_date` date DEFAULT NULL,
  `resolved_by` int unsigned DEFAULT NULL,
  `sanction_start_date` date DEFAULT NULL,
  `sanction_end_date` date DEFAULT NULL,
  `sanction_days` int DEFAULT NULL,
  `supporting_documents` json DEFAULT NULL COMMENT 'Array of document URLs',
  `witness_statements` json DEFAULT NULL COMMENT 'Array of witness info',
  `hr_remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`case_id`),
  UNIQUE KEY `case_code` (`case_code`),
  KEY `violation_type_id` (`violation_type_id`),
  KEY `filed_by` (`filed_by`),
  KEY `investigation_by` (`investigation_by`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_irnte_employee` (`employee_id`),
  KEY `idx_irnte_case_code` (`case_code`),
  KEY `idx_irnte_status` (`status`),
  KEY `idx_irnte_incident_date` (`incident_date`),
  KEY `idx_irnte_date_filed` (`date_filed`),
  CONSTRAINT `ir_nte_logs_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE RESTRICT,
  CONSTRAINT `ir_nte_logs_ibfk_2` FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types` (`violation_type_id`) ON DELETE SET NULL,
  CONSTRAINT `ir_nte_logs_ibfk_3` FOREIGN KEY (`filed_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `ir_nte_logs_ibfk_4` FOREIGN KEY (`investigation_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `ir_nte_logs_ibfk_5` FOREIGN KEY (`resolved_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ir_nte_logs`
--

LOCK TABLES `ir_nte_logs` WRITE;
/*!40000 ALTER TABLE `ir_nte_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ir_nte_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 15:59:41
