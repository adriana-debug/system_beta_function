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
-- Table structure for table `employee_requirements`
--

DROP TABLE IF EXISTS `employee_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_requirements` (
  `requirement_id` int unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int unsigned NOT NULL,
  `pre_employment_medical` tinyint(1) DEFAULT '0',
  `pre_employment_medical_date` date DEFAULT NULL,
  `pre_employment_medical_expiry` date DEFAULT NULL,
  `pre_employment_medical_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nbi_clearance` tinyint(1) DEFAULT '0',
  `nbi_clearance_date` date DEFAULT NULL,
  `nbi_clearance_expiry` date DEFAULT NULL,
  `nbi_clearance_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barangay_clearance` tinyint(1) DEFAULT '0',
  `barangay_clearance_date` date DEFAULT NULL,
  `barangay_clearance_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `psa_birth_certificate` tinyint(1) DEFAULT '0',
  `psa_birth_certificate_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diploma_tor` tinyint(1) DEFAULT '0' COMMENT 'Diploma/Transcript of Records',
  `diploma_tor_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `government_ids` tinyint(1) DEFAULT '0',
  `government_ids_note` text COLLATE utf8mb4_unicode_ci,
  `signed_contract` tinyint(1) DEFAULT '0',
  `signed_contract_date` date DEFAULT NULL,
  `signed_contract_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sss_e1_form` tinyint(1) DEFAULT '0',
  `sss_e1_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `philhealth_member_form` tinyint(1) DEFAULT '0',
  `philhealth_form_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pagibig_member_form` tinyint(1) DEFAULT '0',
  `pagibig_form_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bir_form_2316` tinyint(1) DEFAULT '0',
  `bir_form_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_photos` tinyint(1) DEFAULT '0',
  `id_photos_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completion_percentage` decimal(5,2) DEFAULT '0.00' COMMENT 'Auto-calculated',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`requirement_id`),
  UNIQUE KEY `unique_employee_requirements` (`employee_id`),
  CONSTRAINT `employee_requirements_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_requirements`
--

LOCK TABLES `employee_requirements` WRITE;
/*!40000 ALTER TABLE `employee_requirements` DISABLE KEYS */;
INSERT INTO `employee_requirements` VALUES (2,2,0,NULL,NULL,NULL,0,NULL,NULL,NULL,0,NULL,NULL,0,NULL,0,NULL,0,NULL,0,NULL,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0.00,'2026-01-12 06:57:05','2026-01-12 06:57:05'),(3,3,0,NULL,NULL,NULL,0,NULL,NULL,NULL,0,NULL,NULL,0,NULL,0,NULL,0,NULL,0,NULL,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0,NULL,0.00,'2026-01-12 06:57:05','2026-01-12 06:57:05');
/*!40000 ALTER TABLE `employee_requirements` ENABLE KEYS */;
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
