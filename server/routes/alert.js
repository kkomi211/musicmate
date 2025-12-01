const express = require('express');
const router = express.Router();
const db = require("../db");

// 1. 읽지 않은 알림 개수 확인
router.get("/unread/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        let sql = "SELECT COUNT(*) AS CNT FROM ALERT WHERE USERID = ? AND STATUS = 'N'";
        let [rows] = await db.query(sql, [userId]);
        res.json({ result: "success", hasUnread: rows[0].CNT > 0, count: rows[0].CNT });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: "fail" });
    }
});

// 2. [수정] 알림 목록 조회 (닉네임, 피드내용 조인)
router.get("/list/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        // ALERT 테이블을 기준으로 보낸 사람(USER)과 피드(FEED) 정보를 조인
        let sql = `
            SELECT 
                A.*, 
                U.NICKNAME AS SENDER_NICKNAME,
                F.CONTENT AS FEED_CONTENT
            FROM ALERT A
            LEFT JOIN USER U ON A.SENDERID = U.USERID
            LEFT JOIN FEED F ON A.FEEDNO = F.FEEDNO
            WHERE A.USERID = ? 
            ORDER BY A.CDATE DESC
        `;
        let [rows] = await db.query(sql, [userId]);
        res.json({ result: "success", list: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 3. 개별 알림 읽음 처리
router.put("/read/:alertNo", async (req, res) => {
    let { alertNo } = req.params;
    try {
        let sql = "UPDATE ALERT SET STATUS = 'Y' WHERE ALERTNO = ?";
        await db.query(sql, [alertNo]);
        res.json({ result: "success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: "fail" });
    }
});

// 4. 모든 알림 읽음 처리
router.put("/readAll/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        let sql = "UPDATE ALERT SET STATUS = 'Y' WHERE USERID = ? AND STATUS = 'N'";
        await db.query(sql, [userId]);
        res.json({ result: "success", msg: "모든 알림 읽음 처리 완료" });
    } catch (error) {
        console.error("전체 읽음 처리 오류:", error);
        res.status(500).json({ result: "fail" });
    }
});

// 5. 알림 삭제
router.delete("/:alertNo", async (req, res) => {
    let { alertNo } = req.params;
    try {
        let sql = "DELETE FROM ALERT WHERE ALERTNO = ?";
        await db.query(sql, [alertNo]);
        res.json({ result: "success", msg: "삭제 완료" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: "fail" });
    }
});

module.exports = router;