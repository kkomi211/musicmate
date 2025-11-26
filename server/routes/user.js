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

router.post("/join", async (req, res) => {
    let { userId, pwd, name, nickname, gender, instrument, addr } = req.body;
    console.log(req.body);

    try {
        const hashPwd = await bcrypt.hash(pwd, 10);
        let sql = "INSERT INTO USER() VALUES(?, ?, ?, ?, ?, 'A', ?, NOW(), NOW(), ?)"
        let result = await db.query(sql, [userId, hashPwd, name, nickname, instrument, gender, addr]);
        res.json({
            result: result,
            msg: "회원가입 완료"
        })
    } catch (error) {
        console.log(error);

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




module.exports = router;