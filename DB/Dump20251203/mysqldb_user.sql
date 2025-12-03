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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `USERID` varchar(50) NOT NULL COMMENT '아이디',
  `PWD` varchar(2000) NOT NULL COMMENT '비밀번호 (해시값 저장 고려)',
  `NAME` varchar(50) NOT NULL COMMENT '이름',
  `NICKNAME` varchar(50) NOT NULL COMMENT '닉네임',
  `INSTRUMENT` varchar(50) DEFAULT NULL COMMENT '악기 (주 연주 악기)',
  `AUTH` char(1) NOT NULL COMMENT '권한 (U: 일반 사용자, A: 관리자)',
  `GENDER` char(1) NOT NULL COMMENT '성별 (M: 남성, F: 여성)',
  `CDATE` datetime NOT NULL COMMENT '생성일자',
  `UDATE` datetime NOT NULL COMMENT '수정일자',
  `ADDR` varchar(255) NOT NULL,
  `PHONE` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='사용자 기본 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('garjee1005','$2b$10$gCwnuF0OncNA6ccXKzohT.uzO7oITmy9stnRSUcg6Z1bK8GyINWVO','정은성','정은성테스트','탬버린','A','M','2025-11-28 11:12:46','2025-11-28 12:16:47','경기 화성시 병점서로 63-21 (병점동) 210호','01055088024'),('user01','$2b$10$xNQIc0nn9bFmBLpAm56DXeoh.J70wpLg5c4MYA88GGiQDiVe6hs9i','유저1','유저1','드럼','U','M','2025-11-26 10:50:51','2025-12-01 17:38:36','인천광역시 부평구 청천2동','01011111111'),('user02','$2b$10$2nje2DFYfMrQvXNFMlFxx.4dqJfXNq0ykZ5kN7prRfj7AEJUiDRf.','유저2','유저2','피아노','A','M','2025-11-26 15:09:38','2025-11-26 15:09:38','서울','01022222222'),('user03','$2b$10$QZOEu2XpDkDf1aOzXHDJIuLT/6XbKswuUBtBGYdG3VKSxr3e.s29i','유저3','유저3','바이올린','A','F','2025-11-28 11:10:31','2025-11-28 11:10:31','제주특별자치도 서귀포시 가가로 15 (상예동)','01033333333');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
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
