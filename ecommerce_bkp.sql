-- MySQL dump 10.13  Distrib 8.3.0, for Win64 (x86_64)
--
-- Host: localhost    Database: ecommerce
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `name` varchar(70) NOT NULL COMMENT 'Recipient name',
  `mobile` varchar(10) NOT NULL COMMENT 'Recipient''s mobile-number',
  `pincode` varchar(6) NOT NULL COMMENT 'Address pincode',
  `address_text` varchar(255) NOT NULL COMMENT 'House/Flat #, Floor, Bldg, Street/Road, Locality, Landmark',
  `address_type` enum('Home','Work') NOT NULL DEFAULT 'Home',
  PRIMARY KEY (`id`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A user can have multiple addresses';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (2,7,'Rahp','8887776665','400708','Mastercard, 11th flr, Bldg. No. 9 <ADDR_LINE_SEPARATOR>Sec20 - Mindspace, Airoli W, Navi Mumbai','Work'),(3,7,'rahul p','7776665554','400708','602 6th floor, bldg#4 <ADDR_LINE_SEPARATOR>sector 20, Mindspace, airoli w, navi-mumbai','Work'),(22,7,'batman','9823749933','872344','batman apt.  LOL <ADDR_LINE_SEPARATOR>batman gotham city','Work'),(23,7,'superman','9423296783','123123','aksjdkaj dlk <ADDR_LINE_SEPARATOR>ljals jfla sdf ja','Work'),(31,7,'aniket sonawane','8725637843','677635','kalyan kolshewadi <ADDR_LINE_SEPARATOR>kalyan EAST - 425001','Home');
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `mobile` varchar(10) NOT NULL COMMENT 'User authenticate/registration to be done using mobile and OTP',
  `password` varchar(60) DEFAULT NULL COMMENT 'Bcrypt password hash. Could be set later by user. If set, user will have option to choose either OTP or password to login',
  `email` varchar(254) DEFAULT NULL COMMENT 'Email would be added during the 1st checkout for mailing the invoice and order updates',
  `name` varchar(70) DEFAULT NULL COMMENT 'First name Last name. Could be set later by user.',
  `gender` enum('Male','Female') DEFAULT NULL COMMENT 'Gender Could be set later by user.',
  `default_billing_addr` int unsigned DEFAULT NULL COMMENT 'Default Billing Address. `address.id`',
  `default_shipping_addr` int unsigned DEFAULT NULL COMMENT 'Default Shipping Address. `address.id`',
  `user_group_id` tinyint unsigned NOT NULL DEFAULT '1' COMMENT 'Customer-group based on their behaviours. By default value is 1 i.e. ''New'' customer. `user_group.id`',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mobile` (`mobile`),
  KEY `idx_email` (`email`) COMMENT 'Email will be checked to be unique during the 1st checkout',
  KEY `fk_user_group_id` (`user_group_id`),
  KEY `fk_default_billing_addr` (`default_billing_addr`),
  KEY `fk_default_shipping_addr` (`default_shipping_addr`),
  CONSTRAINT `fk_default_billing_addr` FOREIGN KEY (`default_billing_addr`) REFERENCES `address` (`id`),
  CONSTRAINT `fk_default_shipping_addr` FOREIGN KEY (`default_shipping_addr`) REFERENCES `address` (`id`),
  CONSTRAINT `fk_user_group_id` FOREIGN KEY (`user_group_id`) REFERENCES `user_group` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='-- `password` is optional. We will authenticate user with mobile OTP all/most of the time.\n-- `email` will be checked for uniqueness during 1st checkout and could be verified later, hence indexed.\n-- rest of the NULL fields could be set by the user at a later point of time.\n-- `user_group_id` will be updated post 1st order placed by the user.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (3,'8768763434',NULL,NULL,NULL,NULL,NULL,NULL,1,'2024-08-02 23:48:18','2024-08-02 23:48:18'),(4,'7776665544',NULL,NULL,NULL,NULL,NULL,NULL,6,'2024-08-02 23:50:37','2024-08-03 13:30:08'),(5,'9989987878',NULL,NULL,NULL,NULL,NULL,NULL,1,'2024-08-02 23:53:34','2024-08-02 23:53:34'),(6,'7666326046',NULL,NULL,NULL,NULL,NULL,NULL,1,'2024-08-03 13:57:52','2024-08-03 13:57:52'),(7,'7666016757','aaaaaa','rahp@gmail.com','rahp','Male',22,22,1,'2024-08-03 14:01:35','2024-09-17 16:48:41');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_group`
--

DROP TABLE IF EXISTS `user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_group` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `user_group_code` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='-- Stores the ''categories'' of users based on their activities and purchases. \n-- This may be updated in redis so that users'' categorisation will be available while logging in.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_group`
--

LOCK TABLES `user_group` WRITE;
/*!40000 ALTER TABLE `user_group` DISABLE KEYS */;
INSERT INTO `user_group` VALUES (1,'New'),(2,'Inactive: 90+ Days'),(3,'Inactive: 30-90 Days'),(4,'Inactive: 10-30 Days'),(5,'Inactive: 2-9 Days'),(6,'Fraud/Blacklisted'),(7,'Active: Day1 - Day72'),(8,'Active: Day73 - Day144'),(9,'Active: Day145+');
/*!40000 ALTER TABLE `user_group` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-17 16:52:04
