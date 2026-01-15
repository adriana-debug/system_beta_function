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
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `employee_id` int unsigned NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., EMP-001',
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `suffix` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Jr., Sr., III, etc.',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nationality` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Filipino',
  `religion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personal_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landline_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanent_address_line1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanent_address_line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanent_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanent_province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanent_postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanent_country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Philippines',
  `present_address_line1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `present_address_line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `present_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `present_province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `present_postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `present_country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Philippines',
  `tin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tax Identification Number',
  `sss_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Social Security System',
  `philhealth_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Philippine Health Insurance',
  `pagibig_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Pag-IBIG Fund / HDMF',
  `department_id` int unsigned DEFAULT NULL,
  `campaign_id` int unsigned DEFAULT NULL,
  `position_id` int unsigned DEFAULT NULL,
  `employment_type` enum('Regular','Probationary','Contractual','Project-based','Consultant','Intern') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Probationary',
  `date_hired` date NOT NULL,
  `regularization_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL COMMENT 'For contractual/project-based',
  `employment_status` enum('Active','Resigned','Terminated','AWOL','On Leave','Suspended','End of Contract') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `separation_date` date DEFAULT NULL,
  `separation_reason` text COLLATE utf8mb4_unicode_ci,
  `grade` enum('A','B','C','D','E') COLLATE utf8mb4_unicode_ci DEFAULT 'C',
  `work_schedule` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Fixed' COMMENT 'Fixed, Flexi-time, Shifting, etc.',
  `shift_schedule` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `basic_salary` decimal(12,2) DEFAULT NULL,
  `pay_frequency` enum('Monthly','Semi-Monthly','Weekly','Daily') COLLATE utf8mb4_unicode_ci DEFAULT 'Semi-Monthly',
  `bio` text COLLATE utf8mb4_unicode_ci COMMENT 'Short description/title',
  `profile_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `immediate_supervisor_id` int unsigned DEFAULT NULL,
  `emergency_contact_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_relationship` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_address` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  UNIQUE KEY `email` (`email`),
  KEY `campaign_id` (`campaign_id`),
  KEY `position_id` (`position_id`),
  KEY `immediate_supervisor_id` (`immediate_supervisor_id`),
  KEY `idx_employee_code` (`employee_code`),
  KEY `idx_employee_email` (`email`),
  KEY `idx_employee_department` (`department_id`),
  KEY `idx_employee_status` (`employment_status`),
  KEY `idx_employee_name` (`last_name`,`first_name`),
  KEY `idx_employee_date_hired` (`date_hired`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`campaign_id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_4` FOREIGN KEY (`immediate_supervisor_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (2,'EMP-001','Juan','Santos','Dela Cruz',NULL,'Johnny','Male','1985-03-15','Married','Filipino','Catholic','juan.delacruz@example.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Probationary','2010-06-01',NULL,NULL,'Active',NULL,NULL,'C','Fixed',NULL,NULL,'Semi-Monthly',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2026-01-12 06:57:05','2026-01-12 06:57:05'),(3,'EMP-002','Maria','Lopez','Reyes',NULL,'Mai','Female','1990-07-22','Single','Filipino','Christian','maria.reyes@example.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,NULL,NULL,'Philippines',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Probationary','2015-09-15',NULL,NULL,'Active',NULL,NULL,'C','Fixed',NULL,NULL,'Semi-Monthly',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2026-01-12 06:57:05','2026-01-12 06:57:05');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
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
