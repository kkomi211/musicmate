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
-- Table structure for table `feed_img`
--

DROP TABLE IF EXISTS `feed_img`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feed_img` (
  `IMGNO` int NOT NULL AUTO_INCREMENT COMMENT '이미지 번호 (PK)',
  `IMGNAME` varchar(500) NOT NULL COMMENT '이미지 이름/파일명',
  `USERID` varchar(50) NOT NULL COMMENT '업로드한 유저 아이디 (FK)',
  `IMGPATH` varchar(500) NOT NULL COMMENT '이미지 저장 경로/URL',
  `IMGTYPE` char(1) NOT NULL COMMENT '이미지 종류 (P: 프로필, M: 썸네일, C: 일반피드사진)',
  `FEEDNO` int DEFAULT NULL COMMENT '관련 피드 번호 (FK)',
  `CDATE` datetime NOT NULL COMMENT '올린 날짜',
  `UDATE` datetime NOT NULL COMMENT '수정 날짜',
  PRIMARY KEY (`IMGNO`),
  KEY `USERID` (`USERID`),
  CONSTRAINT `feed_img_ibfk_1` FOREIGN KEY (`USERID`) REFERENCES `user` (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='이미지 및 미디어 파일 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feed_img`
--

LOCK TABLES `feed_img` WRITE;
/*!40000 ALTER TABLE `feed_img` DISABLE KEYS */;
INSERT INTO `feed_img` VALUES (4,'1764137518891-cookie.jpg','user02','http://localhost:3010/uploads/1764137518891-cookie.jpg','M',11,'2025-11-26 15:11:58','2025-11-26 15:11:58'),(5,'1764209331047-kimbab.jpg','user01','http://localhost:3010/uploads/1764209331047-kimbab.jpg','P',NULL,'2025-11-27 11:08:51','2025-11-27 11:08:51'),(6,'1764574491501-ãåã®ãã¼ã­ã¼ã¢ã«ããã¢ FINAL SEASONãOPãã³ã¯ã¬ã¸ããæ å Type-3ï¼OPãã¼ãï¼ãTHE REVOããã«ãã°ã©ãã£ãã£ï¼ãã­ã¢ã«OP.mp4','user01','http://localhost:3010/uploads/1764574491501-ãåã®ãã¼ã­ã¼ã¢ã«ããã¢ FINAL SEASONãOPãã³ã¯ã¬ã¸ããæ å Type-3ï¼OPãã¼ãï¼ãTHE REVOããã«ãã°ã©ãã£ãã£ï¼ãã­ã¢ã«OP.mp4','M',15,'2025-12-01 16:34:51','2025-12-01 16:34:51'),(7,'1764578292065-[MV] íë¡ë¡ (HANRORO) - ì¬ëíê² ë  ê±°ì¼ (Landing in Love).mp4','user02','http://localhost:3010/uploads/1764578292065-[MV] íë¡ë¡ (HANRORO) - ì¬ëíê² ë  ê±°ì¼ (Landing in Love).mp4','M',16,'2025-12-01 17:38:12','2025-12-01 17:38:12'),(8,'1764578953046-YTDown.com_YouTube_Media_0-2KzDxOw70_002_720p.mp4','garjee1005','http://localhost:3010/uploads/1764578953046-YTDown.com_YouTube_Media_0-2KzDxOw70_002_720p.mp4','M',17,'2025-12-01 17:49:13','2025-12-01 17:49:13');
/*!40000 ALTER TABLE `feed_img` ENABLE KEYS */;
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
