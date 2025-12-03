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
-- Table structure for table `feed_comment`
--

DROP TABLE IF EXISTS `feed_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feed_comment` (
  `COMMENTNO` int NOT NULL AUTO_INCREMENT COMMENT '댓글 번호 (PK)',
  `FEEDNO` int NOT NULL COMMENT '댓글이 달린 피드 번호 (FK)',
  `CONTENT` varchar(200) NOT NULL COMMENT '댓글 내용',
  `USERID` varchar(50) NOT NULL COMMENT '댓글 작성 유저 아이디 (FK)',
  `CDATE` datetime NOT NULL COMMENT '생성 날짜',
  `UDATE` datetime NOT NULL COMMENT '수정 날짜',
  PRIMARY KEY (`COMMENTNO`),
  KEY `FEEDNO` (`FEEDNO`),
  KEY `USERID` (`USERID`),
  CONSTRAINT `feed_comment_ibfk_1` FOREIGN KEY (`FEEDNO`) REFERENCES `feed` (`FEEDNO`),
  CONSTRAINT `feed_comment_ibfk_2` FOREIGN KEY (`USERID`) REFERENCES `user` (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='피드 댓글 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feed_comment`
--

LOCK TABLES `feed_comment` WRITE;
/*!40000 ALTER TABLE `feed_comment` DISABLE KEYS */;
INSERT INTO `feed_comment` VALUES (3,11,'쿠키런이다','user01','2025-11-26 17:29:38','2025-11-26 17:29:38'),(4,11,'ㅎㅇㅎㅇ','user02','2025-11-26 17:35:58','2025-11-26 17:35:58'),(8,2,'ㅇㅇ','user01','2025-11-27 11:28:34','2025-11-27 11:28:34'),(13,14,'밴드 하실래요??','user01','2025-11-28 15:38:48','2025-11-28 15:38:48'),(24,11,'ㅇㅇ','user01','2025-12-01 10:07:25','2025-12-01 10:07:25'),(25,14,'테스트~~','user01','2025-12-01 15:58:19','2025-12-01 15:58:19'),(26,11,'ㅋㅋ','user01','2025-12-01 16:28:22','2025-12-01 16:28:22'),(27,7,'ㅇㅇ','user01','2025-12-01 16:49:58','2025-12-01 16:49:58'),(28,16,'ㅇㅈ이요','user01','2025-12-01 17:38:28','2025-12-01 17:38:28');
/*!40000 ALTER TABLE `feed_comment` ENABLE KEYS */;
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
