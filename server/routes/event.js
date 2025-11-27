const express = require('express');
const router = express.Router();
const db = require("../db"); // DB 연결 설정 경로에 맞게 수정해주세요

// 1. 이벤트 등록 API
// URL: /event/add
router.post("/add", async (req, res) => {
    // 클라이언트에서 보낸 데이터 받기
    const { title, content, sdate, edate, userId } = req.body;

    try {
        // EVENT 테이블에 데이터 삽입
        // EVENTNO는 Auto Increment라고 가정
        let sql = `
            INSERT INTO EVENT (TITLE, CONTENT, SDATE, EDATE, USERID, CDATE) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        let [result] = await db.query(sql, [title, content, sdate, edate, userId]);

        res.json({
            result: "success",
            msg: "이벤트가 등록되었습니다.",
            eventNo: result.insertId 
        });

    } catch (error) {
        console.error("이벤트 등록 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 2. 이벤트 목록 조회 API
// URL: /event/list
router.get("/list", async (req, res) => {
    try {
        // 최신순(CDATE DESC)으로 정렬하여 모든 이벤트 가져오기
        let sql = "SELECT * FROM EVENT ORDER BY CDATE DESC";
        
        let [list] = await db.query(sql);
        
        res.json({
            result: "success",
            list: list
        });
        
    } catch (error) {
        console.error("이벤트 목록 조회 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 3. 이벤트 상세 조회 API (추후 상세 페이지 필요 시 사용)
// URL: /event/detail/:eventNo
router.get("/detail/:eventNo", async (req, res) => {
    let { eventNo } = req.params;
    try {
        let sql = "SELECT * FROM EVENT WHERE EVENTNO = ?";
        let [rows] = await db.query(sql, [eventNo]);

        if (rows.length > 0) {
            res.json({ result: "success", info: rows[0] });
        } else {
            res.json({ result: "fail", msg: "존재하지 않는 이벤트입니다." });
        }
    } catch (error) {
        console.error("이벤트 상세 조회 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

router.delete("/:eventNo", async (req, res) => {
    let { eventNo } = req.params;
    try {
        let sql = "DELETE FROM EVENT WHERE EVENTNO = ?";
        let [result] = await db.query(sql, [eventNo]);

        if (result.affectedRows > 0) {
            res.json({ result: "success", msg: "삭제되었습니다." });
        } else {
            res.json({ result: "fail", msg: "삭제할 이벤트를 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("이벤트 삭제 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

module.exports = router;