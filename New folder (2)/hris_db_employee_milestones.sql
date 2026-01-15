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
-- Table structure for table `employee_milestones`
--

DROP TABLE IF EXISTS `employee_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_milestones` (
  `milestone_id` int unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int unsigned NOT NULL,
  `milestone_type` enum('Promotion','Award','Recognition','Tenure','Regularization','Transfer','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `milestone_date` date NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., Promoted to Senior Developer, Employee of the Month',
  `description` text COLLATE utf8mb4_unicode_ci,
  `previous_position_id` int unsigned DEFAULT NULL,
  `new_position_id` int unsigned DEFAULT NULL,
  `previous_grade` enum('A','B','C','D','E') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_grade` enum('A','B','C','D','E') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary_adjustment` decimal(12,2) DEFAULT NULL,
  `approved_by` int unsigned DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `document_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`milestone_id`),
  KEY `previous_position_id` (`previous_position_id`),
  KEY `new_position_id` (`new_position_id`),
  KEY `approved_by` (`approved_by`),
  KEY `document_id` (`document_id`),
  KEY `idx_milestone_employee` (`employee_id`),
  KEY `idx_milestone_date` (`milestone_date`),
  CONSTRAINT `employee_milestones_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `employee_milestones_ibfk_2` FOREIGN KEY (`previous_position_id`) REFERENCES `positions` (`position_id`) ON DELETE SET NULL,
  CONSTRAINT `employee_milestones_ibfk_3` FOREIGN KEY (`new_position_id`) REFERENCES `positions` (`position_id`) ON DELETE SET NULL,
  CONSTRAINT `employee_milestones_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `employee_milestones_ibfk_5` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_milestones`
--

LOCK TABLES `employee_milestones` WRITE;
/*!40000 ALTER TABLE `employee_milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_milestones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 15:59:40
