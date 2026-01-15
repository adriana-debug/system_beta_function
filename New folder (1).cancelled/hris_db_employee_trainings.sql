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
-- Table structure for table `employee_trainings`
--

DROP TABLE IF EXISTS `employee_trainings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_trainings` (
  `training_id` int unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int unsigned NOT NULL,
  `program_id` int unsigned DEFAULT NULL,
  `training_request_id` int unsigned DEFAULT NULL,
  `training_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `training_date` date NOT NULL,
  `completion_date` date DEFAULT NULL,
  `status` enum('Scheduled','In Progress','Completed','Cancelled','No Show') COLLATE utf8mb4_unicode_ci DEFAULT 'Scheduled',
  `score` decimal(5,2) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT NULL,
  `certification_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certification_date` date DEFAULT NULL,
  `certification_expiry` date DEFAULT NULL,
  `certificate_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`training_id`),
  KEY `program_id` (`program_id`),
  KEY `training_request_id` (`training_request_id`),
  KEY `idx_emp_training_employee` (`employee_id`),
  KEY `idx_emp_training_date` (`training_date`),
  CONSTRAINT `employee_trainings_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `employee_trainings_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `training_programs` (`program_id`) ON DELETE SET NULL,
  CONSTRAINT `employee_trainings_ibfk_3` FOREIGN KEY (`training_request_id`) REFERENCES `training_requests` (`training_request_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_trainings`
--

LOCK TABLES `employee_trainings` WRITE;
/*!40000 ALTER TABLE `employee_trainings` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_trainings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 16:00:11
