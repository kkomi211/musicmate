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
-- Table structure for table `chat_message`
--

DROP TABLE IF EXISTS `chat_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_message` (
  `MESSAGENO` int NOT NULL AUTO_INCREMENT COMMENT '채팅 번호 (PK)',
  `CHATROOMNO` int NOT NULL COMMENT '채팅방 번호 (FK)',
  `CONTENT` varchar(200) NOT NULL COMMENT '채팅 내용',
  `USERID` varchar(50) NOT NULL COMMENT '메시지를 보낸 유저 아이디 (FK)',
  `CDATE` datetime NOT NULL COMMENT '생성 날짜',
  `UDATE` datetime NOT NULL COMMENT '수정 날짜',
  PRIMARY KEY (`MESSAGENO`),
  KEY `CHATROOMNO` (`CHATROOMNO`),
  KEY `USERID` (`USERID`),
  CONSTRAINT `chat_message_ibfk_1` FOREIGN KEY (`CHATROOMNO`) REFERENCES `chat_room` (`CHATROOMNO`),
  CONSTRAINT `chat_message_ibfk_2` FOREIGN KEY (`USERID`) REFERENCES `user` (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='채팅방 메시지 내용 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_message`
--

LOCK TABLES `chat_message` WRITE;
/*!40000 ALTER TABLE `chat_message` DISABLE KEYS */;
INSERT INTO `chat_message` VALUES (1,1,'안녕!','user01','2025-11-27 13:57:14','2025-11-27 13:57:14'),(2,1,'방갑다 친구야','user01','2025-11-27 13:57:29','2025-11-27 13:57:29'),(3,1,'ㅎㅇ ㅋㅋ','user02','2025-11-27 13:58:12','2025-11-27 13:58:12'),(4,2,'저 밴드 하고 싶어용 ','garjee1005','2025-11-28 11:13:20','2025-11-28 11:13:20'),(5,2,'밴드 하실래요??','user01','2025-11-28 15:39:04','2025-11-28 15:39:04'),(6,2,'대답좀 ㅋㅋ','user01','2025-12-01 14:54:19','2025-12-01 14:54:19'),(7,2,'ㅇ','user01','2025-12-01 14:54:21','2025-12-01 14:54:21'),(8,2,'ㅇ','user01','2025-12-01 14:54:21','2025-12-01 14:54:21'),(9,1,'머행','user01','2025-12-01 15:08:52','2025-12-01 15:08:52'),(10,1,'ㅇㅇㅇ','user01','2025-12-01 16:03:26','2025-12-01 16:03:26'),(11,1,'ㅇㅇㅇㅇㅇㅇ','user01','2025-12-01 16:18:57','2025-12-01 16:18:57');
/*!40000 ALTER TABLE `chat_message` ENABLE KEYS */;
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
