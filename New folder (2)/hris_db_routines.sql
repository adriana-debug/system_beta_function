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
-- Temporary view structure for view `vw_employee_directory`
--

DROP TABLE IF EXISTS `vw_employee_directory`;
/*!50001 DROP VIEW IF EXISTS `vw_employee_directory`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_employee_directory` AS SELECT 
 1 AS `employee_id`,
 1 AS `employee_code`,
 1 AS `full_name`,
 1 AS `email`,
 1 AS `mobile_phone`,
 1 AS `department_name`,
 1 AS `campaign_name`,
 1 AS `position_title`,
 1 AS `employment_type`,
 1 AS `employment_status`,
 1 AS `grade`,
 1 AS `date_hired`,
 1 AS `years_of_service`,
 1 AS `requirements_completion`,
 1 AS `profile_photo_url`,
 1 AS `supervisor_code`,
 1 AS `supervisor_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_employee_compliance_summary`
--

DROP TABLE IF EXISTS `vw_employee_compliance_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_employee_compliance_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_employee_compliance_summary` AS SELECT 
 1 AS `employee_id`,
 1 AS `employee_code`,
 1 AS `employee_name`,
 1 AS `department_name`,
 1 AS `total_ir_nte_cases`,
 1 AS `active_cases`,
 1 AS `verbal_warnings_count`,
 1 AS `written_warnings_count`,
 1 AS `suspension_count`,
 1 AS `coaching_sessions_count`,
 1 AS `last_coaching_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_audit_summary`
--

DROP TABLE IF EXISTS `vw_audit_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_audit_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_audit_summary` AS SELECT 
 1 AS `audit_date`,
 1 AS `module`,
 1 AS `action_type`,
 1 AS `action_count`,
 1 AS `unique_users`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_ir_nte_cases`
--

DROP TABLE IF EXISTS `vw_ir_nte_cases`;
/*!50001 DROP VIEW IF EXISTS `vw_ir_nte_cases`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_ir_nte_cases` AS SELECT 
 1 AS `case_id`,
 1 AS `case_code`,
 1 AS `employee_code`,
 1 AS `employee_name`,
 1 AS `department_name`,
 1 AS `campaign_name`,
 1 AS `case_type`,
 1 AS `violation_name`,
 1 AS `violation_category`,
 1 AS `incident_date`,
 1 AS `date_filed`,
 1 AS `nte_received_date`,
 1 AS `has_explanation_letter`,
 1 AS `status`,
 1 AS `resolution_type`,
 1 AS `resolution_date`,
 1 AS `resolved_by_name`,
 1 AS `hr_remarks`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_pending_requests`
--

DROP TABLE IF EXISTS `vw_pending_requests`;
/*!50001 DROP VIEW IF EXISTS `vw_pending_requests`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_pending_requests` AS SELECT 
 1 AS `request_id`,
 1 AS `request_code`,
 1 AS `request_type`,
 1 AS `subject`,
 1 AS `employee_code`,
 1 AS `requester_name`,
 1 AS `department_name`,
 1 AS `urgency`,
 1 AS `status`,
 1 AS `date_submitted`,
 1 AS `date_needed`,
 1 AS `current_approver`,
 1 AS `approval_level`,
 1 AS `days_pending`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_employee_directory`
--

/*!50001 DROP VIEW IF EXISTS `vw_employee_directory`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_employee_directory` AS select `e`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',ifnull(`e`.`middle_name`,''),' ',`e`.`last_name`) AS `full_name`,`e`.`email` AS `email`,`e`.`mobile_phone` AS `mobile_phone`,`d`.`department_name` AS `department_name`,`c`.`campaign_name` AS `campaign_name`,`p`.`position_title` AS `position_title`,`e`.`employment_type` AS `employment_type`,`e`.`employment_status` AS `employment_status`,`e`.`grade` AS `grade`,`e`.`date_hired` AS `date_hired`,timestampdiff(YEAR,`e`.`date_hired`,curdate()) AS `years_of_service`,`er`.`completion_percentage` AS `requirements_completion`,`e`.`profile_photo_url` AS `profile_photo_url`,`sup`.`employee_code` AS `supervisor_code`,concat(`sup`.`first_name`,' ',`sup`.`last_name`) AS `supervisor_name` from (((((`employees` `e` left join `departments` `d` on((`e`.`department_id` = `d`.`department_id`))) left join `campaigns` `c` on((`e`.`campaign_id` = `c`.`campaign_id`))) left join `positions` `p` on((`e`.`position_id` = `p`.`position_id`))) left join `employee_requirements` `er` on((`e`.`employee_id` = `er`.`employee_id`))) left join `employees` `sup` on((`e`.`immediate_supervisor_id` = `sup`.`employee_id`))) where (`e`.`is_active` = true) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_employee_compliance_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_employee_compliance_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_employee_compliance_summary` AS select `e`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`d`.`department_name` AS `department_name`,(select count(0) from `ir_nte_logs` where (`ir_nte_logs`.`employee_id` = `e`.`employee_id`)) AS `total_ir_nte_cases`,(select count(0) from `ir_nte_logs` where ((`ir_nte_logs`.`employee_id` = `e`.`employee_id`) and (`ir_nte_logs`.`status` in ('Open','Under Review','Pending Response')))) AS `active_cases`,(select count(0) from `verbal_warnings` where (`verbal_warnings`.`employee_id` = `e`.`employee_id`)) AS `verbal_warnings_count`,(select count(0) from `written_warnings` where (`written_warnings`.`employee_id` = `e`.`employee_id`)) AS `written_warnings_count`,(select count(0) from `suspensions` where (`suspensions`.`employee_id` = `e`.`employee_id`)) AS `suspension_count`,(select count(0) from `coaching_logs` where (`coaching_logs`.`employee_id` = `e`.`employee_id`)) AS `coaching_sessions_count`,(select max(`coaching_logs`.`session_date`) from `coaching_logs` where (`coaching_logs`.`employee_id` = `e`.`employee_id`)) AS `last_coaching_date` from (`employees` `e` left join `departments` `d` on((`e`.`department_id` = `d`.`department_id`))) where (`e`.`is_active` = true) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_audit_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_audit_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_audit_summary` AS select cast(`audit_logs`.`created_at` as date) AS `audit_date`,`audit_logs`.`module` AS `module`,`audit_logs`.`action_type` AS `action_type`,count(0) AS `action_count`,count(distinct `audit_logs`.`user_id`) AS `unique_users` from `audit_logs` group by cast(`audit_logs`.`created_at` as date),`audit_logs`.`module`,`audit_logs`.`action_type` order by `audit_date` desc,`audit_logs`.`module`,`audit_logs`.`action_type` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_ir_nte_cases`
--

/*!50001 DROP VIEW IF EXISTS `vw_ir_nte_cases`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_ir_nte_cases` AS select `ir`.`case_id` AS `case_id`,`ir`.`case_code` AS `case_code`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`d`.`department_name` AS `department_name`,`c`.`campaign_name` AS `campaign_name`,`ir`.`case_type` AS `case_type`,`vt`.`violation_name` AS `violation_name`,`vt`.`category` AS `violation_category`,`ir`.`incident_date` AS `incident_date`,`ir`.`date_filed` AS `date_filed`,`ir`.`nte_received_date` AS `nte_received_date`,`ir`.`has_explanation_letter` AS `has_explanation_letter`,`ir`.`status` AS `status`,`ir`.`resolution_type` AS `resolution_type`,`ir`.`resolution_date` AS `resolution_date`,concat(`rb`.`first_name`,' ',`rb`.`last_name`) AS `resolved_by_name`,`ir`.`hr_remarks` AS `hr_remarks` from (((((`ir_nte_logs` `ir` join `employees` `e` on((`ir`.`employee_id` = `e`.`employee_id`))) left join `departments` `d` on((`e`.`department_id` = `d`.`department_id`))) left join `campaigns` `c` on((`e`.`campaign_id` = `c`.`campaign_id`))) left join `violation_types` `vt` on((`ir`.`violation_type_id` = `vt`.`violation_type_id`))) left join `employees` `rb` on((`ir`.`resolved_by` = `rb`.`employee_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_pending_requests`
--

/*!50001 DROP VIEW IF EXISTS `vw_pending_requests`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_pending_requests` AS select `r`.`request_id` AS `request_id`,`r`.`request_code` AS `request_code`,`r`.`request_type` AS `request_type`,`r`.`subject` AS `subject`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `requester_name`,`d`.`department_name` AS `department_name`,`r`.`urgency` AS `urgency`,`r`.`status` AS `status`,`r`.`date_submitted` AS `date_submitted`,`r`.`date_needed` AS `date_needed`,concat(`a`.`first_name`,' ',`a`.`last_name`) AS `current_approver`,`r`.`approval_level` AS `approval_level`,(to_days(curdate()) - to_days(`r`.`date_submitted`)) AS `days_pending` from (((`requests` `r` join `employees` `e` on((`r`.`employee_id` = `e`.`employee_id`))) left join `departments` `d` on((`e`.`department_id` = `d`.`department_id`))) left join `employees` `a` on((`r`.`current_approver_id` = `a`.`employee_id`))) where (`r`.`status` in ('Pending','In Progress')) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 15:59:41
