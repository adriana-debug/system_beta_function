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
-- Table structure for table `equipment_requests`
--

DROP TABLE IF EXISTS `equipment_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment_requests` (
  `equipment_request_id` int unsigned NOT NULL AUTO_INCREMENT,
  `request_id` int unsigned NOT NULL,
  `employee_id` int unsigned NOT NULL,
  `equipment_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `equipment_description` text COLLATE utf8mb4_unicode_ci,
  `quantity` int DEFAULT '1',
  `specifications` text COLLATE utf8mb4_unicode_ci,
  `preferred_brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `urgency` enum('Low','Medium','High','Critical') COLLATE utf8mb4_unicode_ci DEFAULT 'Medium',
  `justification` text COLLATE utf8mb4_unicode_ci,
  `estimated_cost` decimal(12,2) DEFAULT NULL,
  `approved_by` int unsigned DEFAULT NULL,
  `fulfilled_by` int unsigned DEFAULT NULL,
  `fulfillment_date` date DEFAULT NULL,
  `asset_tag` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Asset tracking number if assigned',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`equipment_request_id`),
  KEY `request_id` (`request_id`),
  KEY `approved_by` (`approved_by`),
  KEY `fulfilled_by` (`fulfilled_by`),
  KEY `idx_equipment_employee` (`employee_id`),
  CONSTRAINT `equipment_requests_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`request_id`) ON DELETE CASCADE,
  CONSTRAINT `equipment_requests_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE RESTRICT,
  CONSTRAINT `equipment_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `equipment_requests_ibfk_4` FOREIGN KEY (`fulfilled_by`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment_requests`
--

LOCK TABLES `equipment_requests` WRITE;
/*!40000 ALTER TABLE `equipment_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipment_requests` ENABLE KEYS */;
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
