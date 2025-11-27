const express = require('express');
const router = express.Router();
const db = require("../db"); // DB 연결 설정 경로에 맞게 수정해주세요

// [1] 대화 목록(Inbox) 가져오기
// CHAT_ROOM 테이블을 조회하여 내가 참여 중인 방과 상대방 정보를 가져옵니다.
// URL: /message/inbox/:userId
router.get("/inbox/:userId", async (req, res) => {
    let { userId } = req.params;
    
    try {
        let sql = `
            SELECT 
                R.CHATROOMNO,
                CASE 
                    WHEN R.CHATID1 = ? THEN R.CHATID2
                    ELSE R.CHATID1 
                END AS USERID,                 
                U.NICKNAME,
                (SELECT IMGPATH 
                 FROM FEED_IMG 
                 WHERE USERID = U.USERID AND IMGTYPE = 'P' 
                 ORDER BY CDATE DESC LIMIT 1) AS IMGPATH                 
            FROM CHAT_ROOM R
            INNER JOIN USER U 
                ON U.USERID = CASE 
                    WHEN R.CHATID1 = ? THEN R.CHATID2
                    ELSE R.CHATID1 
                END
            WHERE R.CHATID1 = ? OR R.CHATID2 = ?
        `;
        
        // 파라미터 순서: [userId, userId, userId, userId] (총 4번)
        let [list] = await db.query(sql, [userId, userId, userId, userId]);
        
        res.json({
            list: list,
            result: "success"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// [2] 1:1 대화 내역 가져오기
// 두 사람 사이의 채팅방 번호를 찾고, 그 방의 메시지들을 가져옵니다.
router.get("/list/:myId/:targetId", async (req, res) => {
    let { myId, targetId } = req.params;
    try {
        // CHAT_ROOM과 CHAT_MESSAGE를 조인하여 대화 내역 조회
        let sql = `
            SELECT 
                M.MESSAGENO,
                M.CONTENT,
                M.CDATE,
                M.USERID AS SENDERID
            FROM CHAT_MESSAGE M
            INNER JOIN CHAT_ROOM R ON M.CHATROOMNO = R.CHATROOMNO
            WHERE (R.CHATID1 = ? AND R.CHATID2 = ?) 
               OR (R.CHATID1 = ? AND R.CHATID2 = ?)
            ORDER BY M.CDATE ASC
        `;
        
        let [list] = await db.query(sql, [myId, targetId, targetId, myId]);
        res.json({ list: list, result: "success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

// [3] 메시지 전송하기
// 채팅방이 존재하면 그 방에, 없으면 방을 새로 만들고 메시지를 저장합니다.
router.post("/send", async (req, res) => {
    let { senderId, receiverId, content } = req.body;
    try {
        // 1. 두 사람 사이의 채팅방이 이미 존재하는지 확인
        let findRoomSql = `
            SELECT CHATROOMNO FROM CHAT_ROOM 
            WHERE (CHATID1 = ? AND CHATID2 = ?) 
               OR (CHATID1 = ? AND CHATID2 = ?)
        `;
        let [rows] = await db.query(findRoomSql, [senderId, receiverId, receiverId, senderId]);
        
        let chatRoomNo;

        if (rows.length > 0) {
            // 방이 이미 있으면 그 방 번호 사용
            chatRoomNo = rows[0].CHATROOMNO;
        } else {
            // 방이 없으면 새로 생성 (CHAT_ROOM)
            let createRoomSql = "INSERT INTO CHAT_ROOM(CHATID1, CHATID2, CDATE) VALUES(?, ?, NOW())";
            let [result] = await db.query(createRoomSql, [senderId, receiverId]);
            chatRoomNo = result.insertId;
        }

        // 2. 메시지 저장 (CHAT_MESSAGE)
        // CHAT_MESSAGE 테이블 구조에 맞춰 컬럼명(CHATROOMNO, USERID, CONTENT) 사용
        let insertMsgSql = "INSERT INTO CHAT_MESSAGE(CHATROOMNO, CONTENT, USERID, CDATE, UDATE) VALUES(?, ?, ?, NOW(), NOW())";
        await db.query(insertMsgSql, [chatRoomNo, content, senderId]);

        res.json({ result: "success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

module.exports = router;