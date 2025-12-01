const express = require('express')
const router = express.Router();
const db = require("../db")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const JWT_KEY = "server_secret_key"


router.post("/login", async (req, res) => {
    let { userId, pwd } = req.body;
    try {
        let sql = "SELECT * FROM USER WHERE USERID = ?"
        let [list] = await db.query(sql, [userId]);
        let token = null;
        if (list.length == 0) {
            return (res.json({
                msg: "없는아이디입니다",
                result: "false",
                token: token
            }))
        }
        console.log(list[0]);
        
        const match = await bcrypt.compare(pwd, list[0].PWD);
        if (!match) {
            return (res.json({
                msg: "비밀번호가 다릅니다",
                result: "false",
                token: token
            }))
        }
        let user = {
            userId: list[0].USERID,
            name: list[0].NAME,
            nickname: list[0].NICKNAME,
            auth: list[0].AUTH
        }
        token = jwt.sign(user, JWT_KEY, { expiresIn: '1h' });
        return (res.json({
            info: list[0],
            msg: "로그인성공!",
            result: "success",
            token: token
        }))
    } catch (error) {
        console.log(error);

    }
})

router.get("/unread/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        // STATUS가 'N' (안읽음)인 알림의 개수를 셉니다.
        let sql = "SELECT COUNT(*) AS CNT FROM ALERT WHERE USERID = ? AND STATUS = 'N'";
        let [rows] = await db.query(sql, [userId]);

        let unreadCount = rows[0].CNT;
        
        // 안 읽은 알림이 1개 이상이면 true, 아니면 false
        res.json({ 
            result: "success", 
            hasUnread: unreadCount > 0,
            count: unreadCount 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

router.post("/join", async (req, res) => {
    // [수정] phone 변수 추가
    let { userId, pwd, name, nickname, gender, instrument, addr, phone } = req.body;
    console.log("회원가입 요청 데이터:", req.body);

    try {
        const hashPwd = await bcrypt.hash(pwd, 10);
        
        // [수정] 컬럼명 명시 및 PHONE 컬럼 추가
        let sql = `
            INSERT INTO USER (USERID, PWD, NAME, NICKNAME, INSTRUMENT, AUTH, GENDER, ADDR, PHONE, CDATE, UDATE) 
            VALUES (?, ?, ?, ?, ?, 'U', ?, ?, ?, NOW(), NOW()) 
        `;
        
        // 파라미터 순서: [userId, hashPwd, name, nickname, instrument, gender, addr, phone]
        let result = await db.query(sql, [userId, hashPwd, name, nickname, instrument, gender, addr, phone]);
        
        res.json({
            result: "success",
            msg: "회원가입 완료"
        });
    } catch (error) {
        console.error("회원가입 에러:", error);
        res.status(500).json({ result: "fail", msg: "서버 오류가 발생했습니다." });
    }
})

router.get("/:userId", async (req, res) => {
    let { userId } = req.params;
    let result = "false";
    try {
        let sql = "SELECT * FROM USER WHERE USERID = ?"
        let [list] = await db.query(sql, [userId]);
        if (list.length > 0) {
            result = "success"
        }
        res.json({
            result: result,
            info: list[0]
        })
    } catch (error) {
        console.log(error);

    }
})

router.post("/findId", async (req, res) => {
    let { name, phone } = req.body;
    try {
        let sql = "SELECT USERID FROM USER WHERE NAME = ? AND PHONE = ?";
        let [rows] = await db.query(sql, [name, phone]);

        if (rows.length > 0) {
            res.json({
                result: "success",
                userId: rows[0].USERID // 찾은 아이디 반환
            });
        } else {
            res.json({ result: "fail", msg: "일치하는 정보가 없습니다." });
        }
    } catch (error) {
        console.error("아이디 찾기 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// [2] 비밀번호 찾기 (1단계: 유저 확인) API (VerifyUserForPwdReset)
// URL: /user/verifyUserForPwdReset
router.post("/verifyUserForPwdReset", async (req, res) => {
    let { userId, name, phone } = req.body;
    try {
        let sql = "SELECT USERID FROM USER WHERE USERID = ? AND NAME = ? AND PHONE = ?";
        let [rows] = await db.query(sql, [userId, name, phone]);

        if (rows.length > 0) {
            // 사용자 정보가 일치함
            res.json({ result: "success", msg: "본인 확인 완료" });
        } else {
            // 정보 불일치
            res.json({ result: "fail", msg: "일치하는 회원 정보가 없습니다." });
        }
    } catch (error) {
        console.error("비밀번호 재설정 확인 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// [3] 비밀번호 찾기 (2단계: 비밀번호 재설정) API (ResetPassword)
// URL: /user/resetPassword
router.post("/resetPassword", async (req, res) => {
    let { userId, newPwd } = req.body;
    try {
        // 새 비밀번호를 해싱
        const hashPwd = await bcrypt.hash(newPwd, 10);

        // PWD 업데이트
        let sql = "UPDATE USER SET PWD = ?, UDATE = NOW() WHERE USERID = ?";
        let [result] = await db.query(sql, [hashPwd, userId]);

        if (result.affectedRows > 0) {
            res.json({ result: "success", msg: "비밀번호가 성공적으로 변경되었습니다." });
        } else {
            res.json({ result: "fail", msg: "비밀번호 변경에 실패했습니다." });
        }
    } catch (error) {
        console.error("비밀번호 재설정 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

router.get("/nickname/:nickname", async (req, res) => {
    let { nickname } = req.params;
    let result = "false";
    try {
        let sql = "SELECT * FROM USER WHERE NICKNAME = ?"
        let [list] = await db.query(sql, [nickname]);
        if (list.length > 0) {
            result = "success"
        }
        res.json({
            result: result,
            info: list[0]
        })
    } catch (error) {
        console.log(error);

    }
})

router.post("/changePassword", async (req, res) => {
    const { userId, currentPwd, newPwd } = req.body;

    try {
        // 1. DB에서 해당 유저의 현재 비밀번호 해시 가져오기
        let selectSql = "SELECT PWD FROM USER WHERE USERID = ?";
        let [rows] = await db.query(selectSql, [userId]);

        if (rows.length === 0) {
            return res.json({ result: "fail", msg: "사용자 정보를 찾을 수 없습니다." });
        }
        
        const storedHash = rows[0].PWD;

        // 2. 현재 입력된 비밀번호와 저장된 해시 비교
        const match = await bcrypt.compare(currentPwd, storedHash);

        if (!match) {
            return res.json({ result: "fail", msg: "현재 비밀번호가 일치하지 않습니다." });
        }

        // 3. 새 비밀번호 해싱 (보안)
        const newHashPwd = await bcrypt.hash(newPwd, 10);

        // 4. DB 업데이트
        let updateSql = "UPDATE USER SET PWD = ?, UDATE = NOW() WHERE USERID = ?";
        let [result] = await db.query(updateSql, [newHashPwd, userId]);

        if (result.affectedRows > 0) {
            res.json({ result: "success", msg: "비밀번호가 성공적으로 변경되었습니다." });
        } else {
            // affectedRows가 0이지만 match는 true인 경우는 매우 드물거나 데이터베이스 문제일 수 있음
            res.json({ result: "fail", msg: "비밀번호 변경에 실패했습니다." });
        }

    } catch (error) {
        console.error("비밀번호 변경 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});






module.exports = router;