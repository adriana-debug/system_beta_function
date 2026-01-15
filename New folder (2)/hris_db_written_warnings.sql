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
-- Table structure for table `written_warnings`
--

DROP TABLE IF EXISTS `written_warnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `written_warnings` (
  `written_warning_id` int unsigned NOT NULL AUTO_INCREMENT,
  `warning_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., WW-2024-001',
  `employee_id` int unsigned NOT NULL,
  `ir_nte_case_id` int unsigned DEFAULT NULL COMMENT 'Link to IR/NTE',
  `warning_level` enum('First Written Warning','Second Written Warning','Final Written Warning') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'First Written Warning',
  `warning_date` date NOT NULL,
  `violation_type_id` int unsigned DEFAULT NULL,
  `violation_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `previous_warnings_summary` text COLLATE utf8mb4_unicode_ci,
  `issued_by` int unsigned NOT NULL,
  `approved_by` int unsigned DEFAULT NULL,
  `employee_received` tinyint(1) DEFAULT '0',
  `received_date` date DEFAULT NULL,
  `employee_signature` tinyint(1) DEFAULT '0',
  `employee_remarks` text COLLATE utf8mb4_unicode_ci,
  `improvement_plan` text COLLATE utf8mb4_unicode_ci,
  `improvement_deadline` date DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `consequence_if_repeated` text COLLATE utf8mb4_unicode_ci,
  `document_id` int unsigned DEFAULT NULL COMMENT 'Link to generated document',
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`written_warning_id`),
  UNIQUE KEY `warning_code` (`warning_code`),
  KEY `ir_nte_case_id` (`ir_nte_case_id`),
  KEY `violation_type_id` (`violation_type_id`),
  KEY `issued_by` (`issued_by`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_written_employee` (`employee_id`),
  KEY `idx_written_date` (`warning_date`),
  KEY `idx_written_level` (`warning_level`),
  CONSTRAINT `written_warnings_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE RESTRICT,
  CONSTRAINT `written_warnings_ibfk_2` FOREIGN KEY (`ir_nte_case_id`) REFERENCES `ir_nte_logs` (`case_id`) ON DELETE SET NULL,
  CONSTRAINT `written_warnings_ibfk_3` FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types` (`violation_type_id`) ON DELETE SET NULL,
  CONSTRAINT `written_warnings_ibfk_4` FOREIGN KEY (`issued_by`) REFERENCES `employees` (`employee_id`) ON DELETE RESTRICT,
  CONSTRAINT `written_warnings_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `written_warnings`
--

LOCK TABLES `written_warnings` WRITE;
/*!40000 ALTER TABLE `written_warnings` DISABLE KEYS */;
/*!40000 ALTER TABLE `written_warnings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 15:59:38
