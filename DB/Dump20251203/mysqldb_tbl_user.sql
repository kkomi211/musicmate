-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: mysqldb
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `tbl_user`
--

DROP TABLE IF EXISTS `tbl_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_user` (
  `userId` varchar(50) NOT NULL,
  `pwd` varchar(100) NOT NULL,
  `userName` varchar(50) NOT NULL,
  `addr` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cdatetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `udatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `follower` int DEFAULT '0',
  `following` int DEFAULT '0',
  `intro` varchar(300) DEFAULT '안녕하세요?',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_user`
--

LOCK TABLES `tbl_user` WRITE;
/*!40000 ALTER TABLE `tbl_user` DISABLE KEYS */;
INSERT INTO `tbl_user` VALUES ('1','$2b$10$NafmlA7T6d2Py2JJXgRcqeE1pDpHq5CasWB8QK87P6JB1g8PuEK/.','12',NULL,NULL,'2025-11-14 17:41:38','2025-11-14 17:41:38',0,0,'안녕하세요?'),('123','$2b$10$DNC0hH3N2SCZrFVUfpsjyeQLeRevn.gXeB5FZzYNF.Kz97ykkxyzS','123',NULL,NULL,'2025-11-21 13:07:19','2025-11-21 13:07:19',0,0,'안녕하세요?'),('123112','$2b$10$yCbyrysuf74Rl/VKRvucJOej.R23j69SrMdaLaI/FVXu0XXEspHbu','123',NULL,NULL,'2025-11-21 12:51:38','2025-11-21 12:51:38',0,0,'안녕하세요?'),('3234','$2b$10$uVD4/O91noASeagJmzXsMOMqJqgl.GCn8eQNTPD7VSKR3k49SPvBK','3333',NULL,NULL,'2025-11-21 12:51:15','2025-11-21 12:51:15',0,0,'안녕하세요?'),('333333','$2b$10$un6ND8TuhtLT9NvCroGqTuoCSmTRjoW.TNSHAV3T6O9.wHVFVz6dy','3333',NULL,NULL,'2025-11-21 12:33:46','2025-11-21 12:33:46',0,0,'안녕하세요?'),('garjee1005','$2b$10$D.wPn/QNFi8qrQlGwqKCIOB/IPMgC/zjRV6R4PqVQ/NqtaquOEPfu','정은성',NULL,NULL,'2025-11-24 09:34:29','2025-11-24 09:34:29',0,0,'안녕하세요?'),('test123','$2b$10$H7YQ0.fb7yNhbvwjF303puqflseI1CPZK8BMJKFgz5Pan28vKVfii','1234',NULL,NULL,'2025-11-14 17:49:58','2025-11-14 17:49:58',0,0,'안녕하세요?'),('user001','pwd1','홍길동','서울','010-1111-2222','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user002','pwd2','김철수','인천','010-2233-4455','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user003','pwd3','이영희','대전','010-3344-5566','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user004','pwd4','박지민','광주','010-4455-6677','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user005','pwd5','최민수','서울','010-5566-7788','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user006','pwd6','정수진','부산','010-6677-8899','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user007','pwd7','김하늘','인천','010-7788-9900','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user008','pwd8','이상훈','울산','010-8899-1000','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user009','pwd9','박세영','대구','010-9900-1111','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?'),('user01','$2b$10$uzlvJM6/pQsCpVNxlY7ezeWr559pJoOqY5RtdaOgsXazLBKeDoycW','유저1',NULL,NULL,'2025-11-21 14:35:29','2025-11-21 14:35:29',0,0,'안녕하세요?'),('user010','pwd10','정예린','경기','010-1001-1222','2025-11-14 11:13:25','2025-11-14 11:13:25',0,0,'안녕하세요?');
/*!40000 ALTER TABLE `tbl_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03  9:54:11
