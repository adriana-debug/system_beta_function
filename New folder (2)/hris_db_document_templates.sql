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
-- Table structure for table `document_templates`
--

DROP TABLE IF EXISTS `document_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_templates` (
  `template_id` int unsigned NOT NULL AUTO_INCREMENT,
  `template_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_type` enum('IR','NTE','VerbalWarning','CoachingLog','WrittenWarning','Suspension','Termination','LeaveApproval','TrainingCertificate','EmploymentContract','COE','Clearance','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_content` longtext COLLATE utf8mb4_unicode_ci COMMENT 'HTML/Markdown template with placeholders',
  `placeholders` json DEFAULT NULL COMMENT 'List of available placeholders',
  `version` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`template_id`),
  UNIQUE KEY `template_code` (`template_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_templates`
--

LOCK TABLES `document_templates` WRITE;
/*!40000 ALTER TABLE `document_templates` DISABLE KEYS */;
INSERT INTO `document_templates` VALUES (1,'TPL-NTE-001','Notice to Explain Template','NTE','<div class=\"document\">\r\n<h1>NOTICE TO EXPLAIN</h1>\r\n<p>Date: {{current_date}}</p>\r\n<p>To: {{employee_name}}</p>\r\n<p>Employee ID: {{employee_code}}</p>\r\n<p>Department: {{department}}</p>\r\n<p>Position: {{position}}</p>\r\n\r\n<p>Dear {{employee_name}},</p>\r\n\r\n<p>This is to inform you that you are being required to explain in writing, within five (5) days from receipt of this notice, why no disciplinary action should be taken against you for the following violation:</p>\r\n\r\n<p><strong>Incident Date:</strong> {{incident_date}}</p>\r\n<p><strong>Violation:</strong> {{violation}}</p>\r\n\r\n<p>You are hereby directed to submit your written explanation to the Human Resources Department.</p>\r\n\r\n<p>Failure to submit your written explanation within the prescribed period shall be construed as a waiver of your right to be heard.</p>\r\n\r\n<p>For your compliance.</p>\r\n\r\n<p>Very truly yours,</p>\r\n<p>Human Resources Department</p>\r\n</div>','[\"current_date\", \"employee_name\", \"employee_code\", \"department\", \"position\", \"incident_date\", \"violation\"]','1.0',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(2,'TPL-VW-001','Verbal Warning Template','VerbalWarning','<div class=\"document\">\r\n<h1>VERBAL WARNING NOTICE</h1>\r\n<p>Date: {{warning_date}}</p>\r\n<p>Employee: {{employee_name}} ({{employee_code}})</p>\r\n<p>Department: {{department}}</p>\r\n<p>Position: {{position}}</p>\r\n\r\n<p>This document serves as a record that a verbal warning was issued to the above-named employee for the following:</p>\r\n\r\n<p><strong>Violation:</strong> {{violation}}</p>\r\n\r\n<p>The employee has been counseled regarding this matter and reminded of the company policies. A repeat of this or similar offense may result in more serious disciplinary action.</p>\r\n\r\n<p>Issued by: {{issued_by}}</p>\r\n<p>Witnessed by: {{witness}}</p>\r\n\r\n<p>Employee Acknowledgment:</p>\r\n<p>_____________________________</p>\r\n<p>Signature over Printed Name</p>\r\n</div>','[\"warning_date\", \"employee_name\", \"employee_code\", \"department\", \"position\", \"violation\", \"issued_by\", \"witness\"]','1.0',1,'2026-01-12 06:50:05','2026-01-12 06:50:05'),(3,'TPL-CL-001','Coaching Log Template','CoachingLog','<div class=\"document\">\r\n<h1>COACHING LOG</h1>\r\n<p>Session Date: {{session_date}}</p>\r\n<p>Employee: {{employee_name}} ({{employee_code}})</p>\r\n<p>Coach: {{coach_name}}</p>\r\n\r\n<h2>Topics Discussed:</h2>\r\n<p>{{topics}}</p>\r\n\r\n<h2>Action Items:</h2>\r\n<p>{{action_items}}</p>\r\n\r\n<h2>Target Completion Date:</h2>\r\n<p>{{target_date}}</p>\r\n\r\n<h2>Employee Feedback:</h2>\r\n<p>{{employee_feedback}}</p>\r\n\r\n<p>Coach Signature: _________________ Date: _______</p>\r\n<p>Employee Signature: ______________ Date: _______</p>\r\n</div>','[\"session_date\", \"employee_name\", \"employee_code\", \"coach_name\", \"topics\", \"action_items\", \"target_date\", \"employee_feedback\"]','1.0',1,'2026-01-12 06:50:05','2026-01-12 06:50:05');
/*!40000 ALTER TABLE `document_templates` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 15:59:36
