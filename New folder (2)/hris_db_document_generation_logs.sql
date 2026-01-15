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
-- Table structure for table `document_generation_logs`
--

DROP TABLE IF EXISTS `document_generation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_generation_logs` (
  `log_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `document_id` int unsigned DEFAULT NULL,
  `document_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_table` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` enum('GENERATED','REGENERATED','PREVIEWED','PRINTED','EXPORTED','EMAILED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_used` int unsigned DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `actor_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `success` tinyint(1) DEFAULT '1',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `template_used` (`template_used`),
  KEY `idx_docgen_document` (`document_id`),
  KEY `idx_docgen_source` (`source_table`,`source_record_id`),
  KEY `idx_docgen_created` (`created_at`),
  CONSTRAINT `document_generation_logs_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`) ON DELETE SET NULL,
  CONSTRAINT `document_generation_logs_ibfk_2` FOREIGN KEY (`template_used`) REFERENCES `document_templates` (`template_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_generation_logs`
--

LOCK TABLES `document_generation_logs` WRITE;
/*!40000 ALTER TABLE `document_generation_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_generation_logs` ENABLE KEYS */;
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
