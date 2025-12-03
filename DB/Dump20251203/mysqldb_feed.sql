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
-- Table structure for table `feed`
--

DROP TABLE IF EXISTS `feed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feed` (
  `FEEDNO` int NOT NULL AUTO_INCREMENT COMMENT '피드 번호 (PK)',
  `CONTENT` varchar(500) NOT NULL COMMENT '피드 내용',
  `USERID` varchar(50) NOT NULL COMMENT '작성한 유저 아이디 (FK)',
  `CDATE` datetime NOT NULL COMMENT '올린 날짜',
  `UDATE` datetime NOT NULL COMMENT '수정 날짜',
  PRIMARY KEY (`FEEDNO`),
  KEY `USERID` (`USERID`),
  CONSTRAINT `feed_ibfk_1` FOREIGN KEY (`USERID`) REFERENCES `user` (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='사용자 게시글(피드) 기본 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feed`
--

LOCK TABLES `feed` WRITE;
/*!40000 ALTER TABLE `feed` DISABLE KEYS */;
INSERT INTO `feed` VALUES (1,'12345','user01','2025-11-26 13:02:59','2025-11-26 13:02:59'),(2,'test','user01','2025-11-26 14:30:23','2025-11-26 14:30:23'),(3,'오늘 날씨가 좋다','user01','2025-11-26 14:31:25','2025-11-26 14:31:25'),(6,'오늘 날씨가 좋다','user01','2025-11-26 14:33:33','2025-11-26 14:33:33'),(7,'오늘 날씨가 좋다','user01','2025-11-26 14:34:01','2025-11-26 14:34:01'),(8,'오늘 날씨가 좋다','user01','2025-11-26 14:37:31','2025-11-26 14:37:31'),(11,'안녕반가워','user02','2025-11-26 15:11:58','2025-11-26 15:11:58'),(14,'오늘부터 시작!\n밴드 구해요~','garjee1005','2025-11-28 11:16:08','2025-11-28 11:16:08'),(15,'ㅇㅇ','user01','2025-12-01 16:34:51','2025-12-01 16:34:51'),(16,'이노래 너무 좋아요!!!!!!!1','user02','2025-12-01 17:38:12','2025-12-01 17:38:12'),(17,'베이스 연습중','garjee1005','2025-12-01 17:49:13','2025-12-01 17:49:13');
/*!40000 ALTER TABLE `feed` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03  9:54:10
