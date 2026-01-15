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
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `positions` (
  `position_id` int unsigned NOT NULL AUTO_INCREMENT,
  `position_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_description` text COLLATE utf8mb4_unicode_ci,
  `department_id` int unsigned DEFAULT NULL,
  `grade` enum('A','B','C','D','E') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'C',
  `min_salary` decimal(12,2) DEFAULT NULL,
  `max_salary` decimal(12,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`position_id`),
  UNIQUE KEY `position_code` (`position_code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `positions_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES (1,'CSR','Customer Service Representative',NULL,1,'C',NULL,NULL,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(2,'TL','Team Lead',NULL,1,'B',NULL,NULL,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(3,'SUP','Supervisor',NULL,1,'B',NULL,NULL,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(4,'MGR','Manager',NULL,1,'A',NULL,NULL,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(5,'HRS','HR Specialist',NULL,2,'C',NULL,NULL,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(6,'HRM','HR Manager',NULL,2,'A',NULL,NULL,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(7,'TRN','Trainer',NULL,6,'C',NULL,NULL,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(8,'QAS','QA Specialist',NULL,5,'C',NULL,NULL,1,'2026-01-12 06:50:05','2026-01-12 06:50:05');
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 16:00:12
