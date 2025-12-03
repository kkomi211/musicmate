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
-- Table structure for table `band_board`
--

DROP TABLE IF EXISTS `band_board`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `band_board` (
  `BANDNO` int NOT NULL AUTO_INCREMENT COMMENT '모집글 번호 (PK)',
  `TITLE` varchar(50) NOT NULL COMMENT '제목',
  `CONTENT` varchar(500) NOT NULL COMMENT '내용',
  `USERID` varchar(50) NOT NULL COMMENT '작성 유저 아이디 (FK)',
  `INST` varchar(100) NOT NULL COMMENT '모집 악기 및 파트',
  `EDATE` datetime NOT NULL COMMENT '모집 종료 날짜',
  `CDATE` datetime NOT NULL COMMENT '생성 날짜',
  `STATUS` char(1) NOT NULL COMMENT '모집 상태 (Y: 모집중, S: 모집종료)',
  PRIMARY KEY (`BANDNO`),
  KEY `USERID` (`USERID`),
  CONSTRAINT `band_board_ibfk_1` FOREIGN KEY (`USERID`) REFERENCES `user` (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='밴드원 모집 게시판 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `band_board`
--

LOCK TABLES `band_board` WRITE;
/*!40000 ALTER TABLE `band_board` DISABLE KEYS */;
INSERT INTO `band_board` VALUES (1,'청년밴드 베이스, 키보드 모집합니다!','저희 같이 연주 해봐요','user01','베이스, 키보드','2025-12-01 00:00:00','2025-11-27 16:09:51','Y'),(2,'test','ㅋㅋ','user01','기타','2025-11-27 00:00:00','2025-11-27 16:27:46','S'),(3,'ㅋㅋ','ㅋㅋ','user01','키보드','2025-12-06 00:00:00','2025-11-27 16:28:10','S'),(4,'test','ets','user01','test','2025-12-06 00:00:00','2025-11-27 16:39:19','Y');
/*!40000 ALTER TABLE `band_board` ENABLE KEYS */;
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
