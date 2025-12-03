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
-- Table structure for table `sell`
--

DROP TABLE IF EXISTS `sell`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sell` (
  `SELLNO` int NOT NULL AUTO_INCREMENT COMMENT '판매글 번호 (PK)',
  `TITLE` varchar(50) NOT NULL COMMENT '제목',
  `CONTENT` varchar(500) NOT NULL COMMENT '내용',
  `PRICE` int NOT NULL COMMENT '가격',
  `STATUS` char(1) NOT NULL COMMENT '상태 (N: 판매 종료, Y: 판매 중)',
  `USERID` varchar(50) NOT NULL COMMENT '판매자 유저 아이디 (FK)',
  `PRODUCT` char(1) NOT NULL COMMENT '상품 종류 (I: 악기, S: 악보, E: 기타)',
  `CDATE` datetime NOT NULL COMMENT '생성 날짜',
  PRIMARY KEY (`SELLNO`),
  KEY `USERID` (`USERID`),
  CONSTRAINT `sell_ibfk_1` FOREIGN KEY (`USERID`) REFERENCES `user` (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='중고 악기/악보 판매 게시글 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sell`
--

LOCK TABLES `sell` WRITE;
/*!40000 ALTER TABLE `sell` DISABLE KEYS */;
INSERT INTO `sell` VALUES (2,'야먀하 피아노 판매합니다','좀 비싸요 ㅎ',27000000,'Y','user01','I','2025-11-27 15:34:56'),(3,'나는 반딧불악보 판매합니다','총 6페이지 입니다!',1500,'Y','user01','S','2025-11-27 15:37:41'),(4,'저희 아이 피아노 개인 교습해주실분 구해요 시급 15000','주 2회 2시간씩 하실분 찾습니다',15000,'N','user02','E','2025-11-27 15:41:51'),(5,'test','test',1234,'Y','user01','I','2025-11-27 15:53:41'),(6,'test2','test2',12345141,'Y','user01','I','2025-11-27 15:53:48'),(8,'test55','test55',1234555,'Y','user01','I','2025-11-27 15:54:06');
/*!40000 ALTER TABLE `sell` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03  9:54:12
