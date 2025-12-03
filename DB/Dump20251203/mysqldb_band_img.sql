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
-- Table structure for table `band_img`
--

DROP TABLE IF EXISTS `band_img`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `band_img` (
  `BANDIMGNO` int NOT NULL AUTO_INCREMENT COMMENT '이미지 번호 (PK)',
  `BANDNO` int NOT NULL COMMENT '관련 모집글 번호 (FK)',
  `IMGNAME` varchar(500) NOT NULL COMMENT '이미지 이름/파일명',
  `IMGPATH` varchar(500) NOT NULL COMMENT '이미지 저장 경로/URL',
  `IMGTYPE` char(1) NOT NULL COMMENT '이미지 종류 (M: 썸네일, C: 일반 사진)',
  `CDATE` datetime NOT NULL COMMENT '생성 날짜',
  PRIMARY KEY (`BANDIMGNO`),
  KEY `BANDNO` (`BANDNO`),
  CONSTRAINT `band_img_ibfk_1` FOREIGN KEY (`BANDNO`) REFERENCES `band_board` (`BANDNO`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='밴드 모집글 첨부 이미지 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `band_img`
--

LOCK TABLES `band_img` WRITE;
/*!40000 ALTER TABLE `band_img` DISABLE KEYS */;
INSERT INTO `band_img` VALUES (1,1,'1764227391331-ì²­ëë°´ë.jpg','http://localhost:3010/uploads/1764227391331-ì²­ëë°´ë.jpg','M','2025-11-27 16:09:51'),(2,3,'1764228490878-hihi.jpg','http://localhost:3010/uploads/1764228490878-hihi.jpg','M','2025-11-27 16:28:10'),(3,3,'1764228490882-kimbab.jpg','http://localhost:3010/uploads/1764228490882-kimbab.jpg','C','2025-11-27 16:28:10'),(4,3,'1764228490882-kimchi.jpg','http://localhost:3010/uploads/1764228490882-kimchi.jpg','C','2025-11-27 16:28:10');
/*!40000 ALTER TABLE `band_img` ENABLE KEYS */;
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
