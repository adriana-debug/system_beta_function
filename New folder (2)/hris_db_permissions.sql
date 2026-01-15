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
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `permission_id` int unsigned NOT NULL AUTO_INCREMENT,
  `permission_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `permission_code` (`permission_code`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'employee.view','View Employees','Employees',NULL,'2026-01-12 06:50:05'),(2,'employee.create','Create Employees','Employees',NULL,'2026-01-12 06:50:05'),(3,'employee.edit','Edit Employees','Employees',NULL,'2026-01-12 06:50:05'),(4,'employee.delete','Delete Employees','Employees',NULL,'2026-01-12 06:50:05'),(5,'employee.export','Export Employee Data','Employees',NULL,'2026-01-12 06:50:05'),(6,'compliance.view','View Compliance Records','Compliance',NULL,'2026-01-12 06:50:05'),(7,'compliance.create','Create IR/NTE Cases','Compliance',NULL,'2026-01-12 06:50:05'),(8,'compliance.edit','Edit Compliance Records','Compliance',NULL,'2026-01-12 06:50:05'),(9,'compliance.resolve','Resolve IR/NTE Cases','Compliance',NULL,'2026-01-12 06:50:05'),(10,'request.view','View Requests','Requests',NULL,'2026-01-12 06:50:05'),(11,'request.create','Create Requests','Requests',NULL,'2026-01-12 06:50:05'),(12,'request.approve','Approve Requests','Requests',NULL,'2026-01-12 06:50:05'),(13,'document.view','View Documents','Documents',NULL,'2026-01-12 06:50:05'),(14,'document.generate','Generate Documents','Documents',NULL,'2026-01-12 06:50:05'),(15,'document.print','Print Documents','Documents',NULL,'2026-01-12 06:50:05'),(16,'audit.view','View Audit Logs','Audit',NULL,'2026-01-12 06:50:05'),(17,'audit.export','Export Audit Logs','Audit',NULL,'2026-01-12 06:50:05'),(18,'admin.settings','Manage System Settings','Admin',NULL,'2026-01-12 06:50:05'),(19,'admin.users','Manage Users','Admin',NULL,'2026-01-12 06:50:05'),(20,'admin.roles','Manage Roles','Admin',NULL,'2026-01-12 06:50:05');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
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
