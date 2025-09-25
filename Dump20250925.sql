-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: urbandb
-- ------------------------------------------------------
-- Server version	9.4.0

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
-- Table structure for table `complaint_list`
--

DROP TABLE IF EXISTS `complaint_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_list` (
  `list_id` int NOT NULL AUTO_INCREMENT,
  `problem_id` int DEFAULT NULL,
  `dept_id` int DEFAULT NULL,
  PRIMARY KEY (`list_id`),
  KEY `problem_id` (`problem_id`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `complaint_list_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problem` (`problem_id`),
  CONSTRAINT `complaint_list_ibfk_2` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_list`
--

LOCK TABLES `complaint_list` WRITE;
/*!40000 ALTER TABLE `complaint_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaint_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_status_history`
--

DROP TABLE IF EXISTS `complaint_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `staff_id` (`staff_id`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `complaint_status_history_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `complaint_status_history_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `complaint_status_history_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_status_history`
--

LOCK TABLES `complaint_status_history` WRITE;
/*!40000 ALTER TABLE `complaint_status_history` DISABLE KEYS */;
INSERT INTO `complaint_status_history` VALUES (1,1,1,'In Progress',1,'2025-09-23 20:46:34'),(2,1,NULL,'Resolved',1,'2025-09-23 20:49:40'),(3,2,6,'In Progress',6,'2025-09-24 01:51:20'),(4,2,NULL,'Resolved',6,'2025-09-24 01:52:43'),(5,3,1,'In Progress',1,'2025-09-24 03:28:26'),(6,4,1,'In Progress',1,'2025-09-24 03:28:43'),(7,5,1,'In Progress',1,'2025-09-24 03:28:55'),(8,6,1,'In Progress',1,'2025-09-24 03:29:11'),(9,7,1,'In Progress',1,'2025-09-24 03:29:23'),(10,8,1,'In Progress',1,'2025-09-24 03:29:33'),(11,9,1,'In Progress',1,'2025-09-24 03:29:43'),(12,10,1,'In Progress',1,'2025-09-24 03:29:56'),(13,11,1,'In Progress',1,'2025-09-24 03:30:12'),(14,13,6,'In Progress',6,'2025-09-24 03:43:43'),(15,11,1,'Resolved',1,'2025-09-25 20:46:17'),(16,10,1,'Resolved',1,'2025-09-25 20:46:36'),(17,13,1,'In Progress',1,'2025-09-25 20:47:10'),(18,12,1,'In Progress',1,'2025-09-25 20:47:28');
/*!40000 ALTER TABLE `complaint_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `complaint_summary_view`
--

DROP TABLE IF EXISTS `complaint_summary_view`;
/*!50001 DROP VIEW IF EXISTS `complaint_summary_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `complaint_summary_view` AS SELECT 
 1 AS `status`,
 1 AS `complaint_count`,
 1 AS `avg_resolution_days`,
 1 AS `earliest_complaint`,
 1 AS `latest_complaint`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `complaint_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `problem_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `photo_url` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `priority` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`complaint_id`),
  KEY `user_id` (`user_id`),
  KEY `problem_id` (`problem_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`problem_id`) REFERENCES `problem` (`problem_id`),
  CONSTRAINT `complaints_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,2,1,1,'Mineral Water Issues','Mineral Water Issues in Residential Area',NULL,'Resolved','2025-09-23 20:38:27','2025-09-23 20:49:40','High'),(2,2,2,2,'Broken Road After Rain','Broken Road After Rain in Instituation area',NULL,'Resolved','2025-09-23 21:00:54','2025-09-24 01:52:43','High'),(3,2,3,3,'Drain Issue ','Water overflow from drain',NULL,'In Progress','2025-09-24 03:13:35','2025-09-24 03:28:26','High'),(4,2,4,4,'Power Supply','Power supply issue near residence',NULL,'In Progress','2025-09-24 03:14:14','2025-09-24 03:28:43','High'),(5,2,5,2,'water logging','SEEMS NO ONE CARES..facing issue till sunday',NULL,'In Progress','2025-09-24 03:20:04','2025-09-24 03:28:55','High'),(6,2,6,5,'broken drain','please fix',NULL,'In Progress','2025-09-24 03:21:48','2025-09-24 03:29:11','High'),(7,2,7,6,'sound pollution ','devastating',NULL,'In Progress','2025-09-24 03:22:45','2025-09-24 03:29:23','High'),(8,2,4,7,'power cutoff','ffrquency increased',NULL,'In Progress','2025-09-24 03:23:38','2025-09-24 03:29:33','High'),(9,2,5,8,'water logging','plesae do fast',NULL,'In Progress','2025-09-24 03:24:17','2025-09-24 03:29:43','High'),(10,2,8,9,'pipe broke','polluted',NULL,'Resolved','2025-09-24 03:25:12','2025-09-25 20:46:36','High'),(11,2,9,3,'burst pipe','water leakage',NULL,'Resolved','2025-09-24 03:25:53','2025-09-25 20:46:17','Medium'),(12,2,10,10,'power leakage','why so frequent',NULL,'In Progress','2025-09-24 03:27:17','2025-09-25 20:47:28','Medium'),(13,2,11,11,'Water ','water is everywhere',NULL,'In Progress','2025-09-24 03:43:09','2025-09-25 20:47:10','High');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `dept_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Water','All Water related Issue'),(2,'Road','All Road Related issues');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comments` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `feedback_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `ward` varchar(20) DEFAULT NULL,
  `zone` varchar(20) DEFAULT NULL,
  `area_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Ward 2','North','Residential Area A'),(2,'Ward 1','North','Park Road'),(3,'Ward 1','South','Hospital Road'),(4,'Ward 2','East','Commercial Area'),(5,'Ward 2','East','Metro Station'),(6,'Ward 2','West','Farmers Market'),(7,'Ward 3','Central','Convention Center'),(8,'Ward 1','North','Commercial Complex'),(9,'Ward 2','Central','Court Complex'),(10,'Ward 3','South','Sports Complex'),(11,'Ward 2','North','Shopping Center');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem`
--

DROP TABLE IF EXISTS `problem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem` (
  `problem_id` int NOT NULL AUTO_INCREMENT,
  `problem_name` varchar(100) NOT NULL,
  `problem_description` text,
  PRIMARY KEY (`problem_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem`
--

LOCK TABLES `problem` WRITE;
/*!40000 ALTER TABLE `problem` DISABLE KEYS */;
INSERT INTO `problem` VALUES (1,'Water Quality','Problem related to Water Quality'),(2,'Road Damage','Problem related to Road Damage'),(3,'Sewage Overflow','Problem related to Sewage Overflow'),(4,'Power Outage','Problem related to Power Outage'),(5,'Water Pressure','Problem related to Water Pressure'),(6,'Water Leak','Problem related to Water Leak'),(7,'Noise Pollution','Problem related to Noise Pollution'),(8,'Other','Problem related to Other'),(9,'Pothole','Problem related to Pothole'),(10,'Garbage Collection','Problem related to Garbage Collection'),(11,'Street Light','Problem related to Street Light');
/*!40000 ALTER TABLE `problem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `revoked_assignments_view`
--

DROP TABLE IF EXISTS `revoked_assignments_view`;
/*!50001 DROP VIEW IF EXISTS `revoked_assignments_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `revoked_assignments_view` AS SELECT 
 1 AS `assignment_reference`,
 1 AS `complaint_id`,
 1 AS `staff_id`,
 1 AS `complaint_title`,
 1 AS `staff_name`,
 1 AS `revoked_by_name`,
 1 AS `department`,
 1 AS `assigned_at`,
 1 AS `revoked_at`,
 1 AS `revoke_reason`,
 1 AS `days_assigned`,
 1 AS `progress_notes`,
 1 AS `status_update`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `staff_assignments`
--

DROP TABLE IF EXISTS `staff_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_assignments` (
  `complaint_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `progress_notes` text,
  `status_update` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_by` int DEFAULT NULL,
  `revoke_reason` text,
  `is_revoked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`complaint_id`,`staff_id`),
  KEY `staff_id` (`staff_id`),
  KEY `fk_revoked_by` (`revoked_by`),
  CONSTRAINT `fk_revoked_by` FOREIGN KEY (`revoked_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `staff_assignments_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `staff_assignments_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_assignments`
--

LOCK TABLES `staff_assignments` WRITE;
/*!40000 ALTER TABLE `staff_assignments` DISABLE KEYS */;
INSERT INTO `staff_assignments` VALUES (1,1,'2025-09-23 20:46:34','Done It staff as soon as possible','In Progress','Water',NULL,NULL,NULL,0),(2,6,'2025-09-24 01:51:20','Do it asap staff','In Progress','Road',NULL,NULL,NULL,0),(3,1,'2025-09-24 03:28:26','solve','In Progress','Water',NULL,NULL,NULL,0),(4,1,'2025-09-24 03:28:43','solve','In Progress','Water',NULL,NULL,NULL,0),(5,1,'2025-09-24 03:28:55','solve','In Progress','Water',NULL,NULL,NULL,0),(6,1,'2025-09-24 03:29:11','solve','In Progress','Water',NULL,NULL,NULL,0),(7,1,'2025-09-24 03:29:23','solve','In Progress','Road',NULL,NULL,NULL,0),(8,1,'2025-09-24 03:29:33','solve','In Progress','Water',NULL,NULL,NULL,0),(9,1,'2025-09-24 03:29:43','solve','In Progress','Road',NULL,NULL,NULL,0),(10,1,'2025-09-24 03:29:56','solve\n[2025-09-25 20:46:36] Done','Resolved','Water',NULL,NULL,NULL,0),(11,1,'2025-09-24 03:30:12','solve\n[2025-09-25 20:46:17] Done','Resolved','Water',NULL,NULL,NULL,0),(12,1,'2025-09-25 20:47:28','Do it','In Progress','Water',NULL,NULL,NULL,0),(13,1,'2025-09-25 20:47:10','Do it','In Progress','Water',NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `staff_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `staff_workload_view`
--

DROP TABLE IF EXISTS `staff_workload_view`;
/*!50001 DROP VIEW IF EXISTS `staff_workload_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `staff_workload_view` AS SELECT 
 1 AS `staff_id`,
 1 AS `staff_name`,
 1 AS `staff_email`,
 1 AS `staff_phone`,
 1 AS `departments`,
 1 AS `active_cases`,
 1 AS `resolved_cases`,
 1 AS `total_assigned`,
 1 AS `avg_resolution_time`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `nid` varchar(20) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('user','staff','admin') DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `nid` (`nid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'8724522832','Tamim Sharif','tamimsharif2181@gmail.com','$2b$10$z0hAmbuuv1ZqCEg/6yMBgeOK9/DxrgakCck69nA8xSdTsC3QU.U1S','staff','01743536875',NULL,NULL),(2,'8724522834','Abu Salah','asjamil042@gmail.com','$2b$10$hEbYPIea4VLFY7TdE766YuI1WJKBzgJiDsZSrOlHBHYS.6kZM6Fzi','user','01743536873',NULL,NULL),(3,'8724522829','Tasnia Ashraf','tasniaashraf2181@gmail.com','$2b$10$EVqi5E8Gl0m6np0DF31h/OYZFRlHOphiw9bpwSz1bGJ22pMsnkcGm','admin','01743536886',NULL,NULL),(4,'8724522826','Tasnim Taz','taz123@gmail.com','$2b$10$.KcJSVxalDcI.2gkYMfIJekDnVmABTlHOy0226bsLrZ2koq7ol/3a','admin','01743536856',NULL,NULL),(5,'8724522849','Tasnia Ashraf Borsha','tasniaborsha2181@gmail.com','$2b$10$1f1fB5FanMbLe6jiF9ZkqeeDUp5Rn8M6veN4Z8wWf1CRyw39zT1.a','user','01743536825',NULL,NULL),(6,'8724522896','Rashed Islam','rashedul2181@gmail.com','$2b$10$m.GLYJQgBAVWgnhsvCyJg.JruR/xr2LyJv1tVo4CLmN90yWEQCiPi','staff','01743536869',NULL,NULL),(7,'1234567890','Admin User','admin@urbansolve.com','/OYZFRlHOphiw9bpwSz1bGJ22pMsnkcGm','admin','0123456789',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `complaint_summary_view`
--

/*!50001 DROP VIEW IF EXISTS `complaint_summary_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `complaint_summary_view` AS select `complaints`.`status` AS `status`,count(0) AS `complaint_count`,round(avg((case when (`complaints`.`status` = 'Resolved') then (to_days(`complaints`.`updated_at`) - to_days(`complaints`.`created_at`)) else NULL end)),1) AS `avg_resolution_days`,min(`complaints`.`created_at`) AS `earliest_complaint`,max(`complaints`.`created_at`) AS `latest_complaint` from `complaints` group by `complaints`.`status` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `revoked_assignments_view`
--

/*!50001 DROP VIEW IF EXISTS `revoked_assignments_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `revoked_assignments_view` AS select concat(`sa`.`complaint_id`,'-',`sa`.`staff_id`) AS `assignment_reference`,`sa`.`complaint_id` AS `complaint_id`,`sa`.`staff_id` AS `staff_id`,`c`.`title` AS `complaint_title`,`u_staff`.`name` AS `staff_name`,`u_admin`.`name` AS `revoked_by_name`,`sa`.`department` AS `department`,`sa`.`assigned_at` AS `assigned_at`,`sa`.`revoked_at` AS `revoked_at`,`sa`.`revoke_reason` AS `revoke_reason`,(to_days(`sa`.`revoked_at`) - to_days(`sa`.`assigned_at`)) AS `days_assigned`,`sa`.`progress_notes` AS `progress_notes`,`sa`.`status_update` AS `status_update` from (((`staff_assignments` `sa` join `complaints` `c` on((`sa`.`complaint_id` = `c`.`complaint_id`))) join `users` `u_staff` on((`sa`.`staff_id` = `u_staff`.`user_id`))) left join `users` `u_admin` on((`sa`.`revoked_by` = `u_admin`.`user_id`))) where (`sa`.`is_revoked` = 1) order by `sa`.`revoked_at` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `staff_workload_view`
--

/*!50001 DROP VIEW IF EXISTS `staff_workload_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `staff_workload_view` AS select `u`.`user_id` AS `staff_id`,`u`.`name` AS `staff_name`,`u`.`email` AS `staff_email`,`u`.`contact` AS `staff_phone`,group_concat(distinct `sa`.`department` separator ',') AS `departments`,count((case when ((`sa`.`status_update` <> 'Resolved') and (`sa`.`is_revoked` = 0)) then 1 end)) AS `active_cases`,count((case when ((`sa`.`status_update` = 'Resolved') and (`sa`.`is_revoked` = 0)) then 1 end)) AS `resolved_cases`,count((case when (`sa`.`is_revoked` = 0) then 1 end)) AS `total_assigned`,avg((case when ((`sa`.`status_update` = 'Resolved') and (`sa`.`is_revoked` = 0)) then (to_days(`c`.`updated_at`) - to_days(`sa`.`assigned_at`)) else NULL end)) AS `avg_resolution_time` from ((`users` `u` left join `staff_assignments` `sa` on((`u`.`user_id` = `sa`.`staff_id`))) left join `complaints` `c` on((`sa`.`complaint_id` = `c`.`complaint_id`))) where (`u`.`role` = 'staff') group by `u`.`user_id`,`u`.`name`,`u`.`email`,`u`.`contact` order by `total_assigned` desc */;
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

-- Dump completed on 2025-09-25 22:22:55
