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
-- Table structure for table `tbl_product`
--

DROP TABLE IF EXISTS `tbl_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_product` (
  `productId` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,0) NOT NULL,
  `stock` int DEFAULT '0',
  `category` varchar(50) DEFAULT NULL,
  `isAvailable` varchar(1) DEFAULT NULL,
  `cdatetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `udatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`productId`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_product`
--

LOCK TABLES `tbl_product` WRITE;
/*!40000 ALTER TABLE `tbl_product` DISABLE KEYS */;
INSERT INTO `tbl_product` VALUES (50,'게이밍 마우스','RGB 조명이 있는 고성능 마우스',45000,80,'전자기기','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(51,'핸드크림','보습력이 뛰어난 핸드크림',8500,200,'생활용품','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(52,'여성 청바지','스트레치 데님 청바지',35900,35,'의류','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(53,'휴대폰 케이스','아이폰 14 전용 실리콘 케이스',12000,75,'전자기기','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(54,'LED 스탠드','조도 조절 가능한 LED 책상용 스탠드',33000,60,'생활용품','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(55,'노트북 쿨링패드','노트북 발열 방지를 위한 쿨링패드',27000,40,'전자기기','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(56,'스포츠 양말','운동용 흡한속건 기능성 양말',5900,300,'의류','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(57,'텀블러 500ml','보온보냉 가능한 스테인리스 텀블러',21000,90,'생활용품','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(58,'USB-C 충전기','65W 고속충전기',39000,100,'전자기기','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(59,'면 화장솜','100매입 무형광 화장솜',3000,180,'생활용품','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(60,'여성 니트','겨울용 따뜻한 브이넥 니트',49900,22,'의류','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(61,'샤워볼','거품 잘 나는 목욕용 샤워볼',2500,150,'생활용품','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(62,'블루투스 스피커','휴대용 미니 블루투스 스피커',42000,45,'전자기기','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(63,'에코백','캔버스 소재 친환경 에코백',17900,110,'의류','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(64,'헤어드라이기','1200W 강풍모드 드라이기',32000,55,'생활용품','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(65,'휴대용 선풍기','USB 충전식 미니 선풍기',15000,130,'전자기기','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(66,'기모 레깅스','겨울용 따뜻한 기모 레깅스',22900,38,'의류','Y','2025-11-20 12:40:17','2025-11-20 12:40:17'),(68,'11',NULL,12,0,NULL,NULL,'2025-11-20 16:13:24','2025-11-20 16:13:24'),(69,'123',NULL,123,0,NULL,NULL,'2025-11-20 16:13:54','2025-11-20 16:13:54'),(70,'ㅂㅈㄷㄱ',NULL,1234,0,NULL,NULL,'2025-11-20 16:30:43','2025-11-20 16:30:43');
/*!40000 ALTER TABLE `tbl_product` ENABLE KEYS */;
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
