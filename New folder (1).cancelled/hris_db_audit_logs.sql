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
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `audit_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `table_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Table that was affected',
  `record_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Primary key of affected record',
  `action_type` enum('INSERT','UPDATE','DELETE','SELECT','LOGIN','LOGOUT','PASSWORD_CHANGE','PERMISSION_CHANGE','EXPORT','PRINT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int unsigned DEFAULT NULL COMMENT 'User who performed the action',
  `actor_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Denormalized for immutability',
  `actor_ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actor_user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actor_session_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL COMMENT 'Previous values (for UPDATE/DELETE)',
  `new_values` json DEFAULT NULL COMMENT 'New values (for INSERT/UPDATE)',
  `changed_fields` json DEFAULT NULL COMMENT 'List of fields that were changed',
  `module` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g., Employees, Compliance, Requests',
  `action_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Human-readable description',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_audit_table` (`table_name`),
  KEY `idx_audit_record` (`record_id`),
  KEY `idx_audit_action` (`action_type`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_module` (`module`),
  KEY `idx_audit_table_record` (`table_name`,`record_id`),
  KEY `idx_audit_user_date` (`user_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Immutable audit trail - DO NOT UPDATE OR DELETE';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'employees','1','INSERT',1,'Test Employee',NULL,NULL,NULL,NULL,'{\"email\": \"test@example.com\", \"last_name\": \"Employee\", \"date_hired\": \"2026-01-12\", \"first_name\": \"Test\", \"position_id\": null, \"department_id\": null, \"employee_code\": \"TEST-001\", \"employment_type\": \"Probationary\", \"employment_status\": \"Active\"}',NULL,'Employees','New employee created: TEST-001 - Test Employee','2026-01-12 06:50:05'),(2,'employees','1','UPDATE',NULL,NULL,NULL,NULL,NULL,'{\"email\": \"test@example.com\", \"grade\": \"C\", \"last_name\": \"Employee\", \"first_name\": \"Test\", \"employee_code\": \"TEST-001\", \"employment_status\": \"Active\"}','{\"email\": \"test@example.com\", \"grade\": \"C\", \"last_name\": \"Employee\", \"first_name\": \"Updated\", \"employee_code\": \"TEST-001\", \"employment_status\": \"Active\"}','[\"first_name\"]','Employees','Employee updated: TEST-001','2026-01-12 06:50:05'),(3,'employees','1','DELETE',NULL,NULL,NULL,NULL,NULL,'{\"email\": \"test@example.com\", \"last_name\": \"Employee\", \"date_hired\": \"2026-01-12\", \"first_name\": \"Updated\", \"employee_code\": \"TEST-001\", \"employment_status\": \"Active\"}',NULL,NULL,'Employees','Employee deleted: TEST-001 - Updated Employee','2026-01-12 06:50:06'),(4,'employees','2','INSERT',NULL,NULL,NULL,NULL,NULL,NULL,'{\"email\": \"juan.delacruz@example.com\", \"last_name\": \"Dela Cruz\", \"date_hired\": \"2010-06-01\", \"first_name\": \"Juan\", \"position_id\": null, \"department_id\": null, \"employee_code\": \"EMP-001\", \"employment_type\": \"Probationary\", \"employment_status\": \"Active\"}',NULL,'Employees','New employee created: EMP-001 - Juan Dela Cruz','2026-01-12 06:57:05'),(5,'employees','3','INSERT',NULL,NULL,NULL,NULL,NULL,NULL,'{\"email\": \"maria.reyes@example.com\", \"last_name\": \"Reyes\", \"date_hired\": \"2015-09-15\", \"first_name\": \"Maria\", \"position_id\": null, \"department_id\": null, \"employee_code\": \"EMP-002\", \"employment_type\": \"Probationary\", \"employment_status\": \"Active\"}',NULL,'Employees','New employee created: EMP-002 - Maria Reyes','2026-01-12 06:57:05');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
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
