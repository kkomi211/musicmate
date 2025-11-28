const express = require('express');
const router = express.Router();
const db = require("../db"); // DB 연결 설정 경로에 맞게 수정해주세요

// 1. 합주실 등록 API
// URL: /ensemble/add
router.post("/add", async (req, res) => {
    // 클라이언트에서 보낸 데이터 받기
    const { name, addr, phone } = req.body;

    try {
        // ENSEMBLE_ROOM 테이블에 데이터 삽입
        let sql = "INSERT INTO ENSEMBLE_ROOM(NAME, ADDR, PHONE, CDATE) VALUES(?, ?, ?, NOW())";
        
        let [result] = await db.query(sql, [name, addr, phone]);
        
        res.json({
            result: "success",
            msg: "합주실이 등록되었습니다.",
            ensembleNo: result.insertId // 생성된 합주실 번호 반환
        });

    } catch (error) {
        console.error("합주실 등록 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 2. 합주실 목록 조회 API
// URL: /ensemble/list
router.get("/list", async (req, res) => {
    try {
        // 최신순(CDATE DESC)으로 정렬하여 모든 합주실 데이터 가져오기
        let sql = "SELECT * FROM ENSEMBLE_ROOM ORDER BY CDATE DESC";
        
        let [list] = await db.query(sql);
        
        res.json({
            result: "success",
            list: list
        });
        
    } catch (error) {
        console.error("합주실 목록 조회 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

module.exports = router;