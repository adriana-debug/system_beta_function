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
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `leave_type_id` int unsigned NOT NULL AUTO_INCREMENT,
  `leave_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leave_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `max_days_per_year` int DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT '1',
  `requires_document` tinyint(1) DEFAULT '0',
  `is_convertible` tinyint(1) DEFAULT '0' COMMENT 'Convertible to cash',
  `is_cumulative` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`leave_type_id`),
  UNIQUE KEY `leave_code` (`leave_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
INSERT INTO `leave_types` VALUES (1,'VL','Vacation Leave','Annual vacation leave',15,1,0,1,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(2,'SL','Sick Leave','Leave due to illness',15,1,1,1,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(3,'EL','Emergency Leave','Emergency leave for urgent matters',3,1,0,0,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(4,'BL','Bereavement Leave','Leave for death of immediate family member',5,1,1,0,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(5,'ML','Maternity Leave','Leave for childbirth (105 days per RA 11210)',105,1,1,0,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(6,'PL','Paternity Leave','Leave for married male employees (7 days per RA 8187)',7,1,1,0,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(7,'SPL','Solo Parent Leave','Leave for solo parents (7 days per RA 8972)',7,1,1,0,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(8,'VAWCL','VAWC Leave','Leave for victims of VAWC (10 days per RA 9262)',10,1,1,0,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(9,'SIL','Service Incentive Leave','Mandatory 5-day SIL (per Labor Code)',5,1,0,1,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(10,'LWOP','Leave Without Pay','Unpaid leave',NULL,0,0,0,0,1,'2026-01-12 06:50:05','2026-01-12 06:50:05');
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
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
