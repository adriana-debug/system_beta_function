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
-- Table structure for table `violation_types`
--

DROP TABLE IF EXISTS `violation_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violation_types` (
  `violation_type_id` int unsigned NOT NULL AUTO_INCREMENT,
  `violation_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `violation_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('Minor','Major','Grave') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `recommended_action` text COLLATE utf8mb4_unicode_ci,
  `labor_code_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Reference to Philippine Labor Code',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`violation_type_id`),
  UNIQUE KEY `violation_code` (`violation_code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violation_types`
--

LOCK TABLES `violation_types` WRITE;
/*!40000 ALTER TABLE `violation_types` DISABLE KEYS */;
INSERT INTO `violation_types` VALUES (1,'TARD','Habitual Tardiness','Minor','Frequent late arrivals to work','Verbal Warning -> Written Warning','Company Policy',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(2,'ABS','Unauthorized Absence','Minor','Absence without approved leave','Verbal Warning -> Written Warning','Company Policy',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(3,'AWOL','Absence Without Official Leave','Major','Extended unauthorized absence (3+ consecutive days)','NTE -> Possible Termination','Art. 297',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(4,'INSUB','Insubordination','Major','Willful disobedience of lawful orders','NTE -> Written Warning -> Termination','Art. 297(a)',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(5,'MISC','Serious Misconduct','Grave','Serious breach of duties or gross misconduct','NTE -> Termination','Art. 297(a)',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(6,'NEGLIG','Gross Negligence','Major','Gross and habitual neglect of duties','NTE -> Written Warning -> Termination','Art. 297(b)',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(7,'FRAUD','Fraud/Dishonesty','Grave','Fraud, willful breach of trust, or dishonesty','NTE -> Termination','Art. 297(c)',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(8,'CRIME','Crime/Offense','Grave','Commission of crime or offense against employer','NTE -> Termination','Art. 297(d)',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(9,'DRESS','Dress Code Violation','Minor','Non-compliance with dress code policy','Verbal Warning','Company Policy',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(10,'PERF','Performance Issue','Minor','Below standard work performance','Coaching -> PIP','Company Policy',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(11,'HARASS','Harassment','Grave','Workplace harassment or bullying','NTE -> Termination','RA 7877 / RA 11313',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(12,'SAFETY','Safety Violation','Major','Violation of workplace safety rules','NTE -> Written Warning','OSH Standards',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(13,'DATA','Data Privacy Violation','Major','Unauthorized access or disclosure of personal data','NTE -> Termination','RA 10173',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(14,'CONFLICT','Workplace Conflict','Minor','Interpersonal conflict affecting work','Mediation -> Coaching','Company Policy',1,'2026-01-12 06:50:05','2026-01-12 06:50:05');
/*!40000 ALTER TABLE `violation_types` ENABLE KEYS */;
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
