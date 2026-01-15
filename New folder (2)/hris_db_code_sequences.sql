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
-- Table structure for table `code_sequences`
--

DROP TABLE IF EXISTS `code_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `code_sequences` (
  `sequence_id` int unsigned NOT NULL AUTO_INCREMENT,
  `sequence_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prefix` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_value` int unsigned DEFAULT '0',
  `padding_length` int DEFAULT '3',
  `year_reset` tinyint(1) DEFAULT '1' COMMENT 'Reset sequence each year',
  `last_reset_year` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sequence_id`),
  UNIQUE KEY `sequence_name` (`sequence_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `code_sequences`
--

LOCK TABLES `code_sequences` WRITE;
/*!40000 ALTER TABLE `code_sequences` DISABLE KEYS */;
INSERT INTO `code_sequences` VALUES (1,'EMPLOYEE','EMP-',0,3,0,NULL,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(2,'IR_NTE','IR-',0,3,1,NULL,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(3,'REQUEST','REQ-',1,3,1,2026,'2026-01-12 06:50:05','2026-01-12 06:50:06'),(4,'DOCUMENT','DOC-',0,4,1,NULL,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(5,'VERBAL_WARNING','VW-',0,3,1,NULL,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(6,'WRITTEN_WARNING','WW-',0,3,1,NULL,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(7,'COACHING','CL-',0,3,1,NULL,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(8,'SUSPENSION','SUS-',0,3,1,NULL,'2026-01-12 06:50:05','2026-01-12 06:50:05');
/*!40000 ALTER TABLE `code_sequences` ENABLE KEYS */;
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
