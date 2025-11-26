const express = require('express')
const router = express.Router();
const db = require("../db")
const authmiddlewarer = require("../auth");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/upload', upload.array('file'), async (req, res) => {
    let { feedNo, userId } = req.body;
    const files = req.files;

    // 프론트에서 보낸 imgType 받기
    // 파일이 1개면 문자열("M"), 여러 개면 배열(["M", "C"])로 들어옵니다.
    const imgTypes = req.body.imgType;

    try {
        let results = [];
        let host = `${req.protocol}://${req.get("host")}/`;

        // [수정 1] for...of 대신 일반 for문을 써서 인덱스(i)를 사용합니다.
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let filename = file.filename;
            // destination 경로 처리는 서버 정적 파일 설정에 따라 다를 수 있습니다.
            // 보통은 'uploads/' 같은 폴더명이 포함되므로 중복되지 않게 주의하세요.
            let destination = host + file.destination + file.filename;

            // [수정 2] imgType 처리 (배열인지 문자열인지 확인)
            let currentImgType;
            if (Array.isArray(imgTypes)) {
                // 여러 개일 때는 배열에서 인덱스로 가져옴
                currentImgType = imgTypes[i];
            } else {
                // 1개일 때는 그냥 문자열 변수임
                currentImgType = imgTypes;
            }

            let query = "INSERT INTO FEED_IMG(FEEDNO, IMGNAME, IMGPATH, CDATE, UDATE, IMGTYPE, USERID) VALUES(?, ?, ?, NOW(), NOW(), ?, ?)";

            // db.query는 비동기이므로 await를 사용하여 순차적으로 처리하거나 Promise.all을 쓸 수 있습니다.
            // 여기서는 순차 처리 그대로 유지했습니다.
            let result = await db.query(query, [feedNo, filename, destination, currentImgType, userId]);
            results.push(result);
        }

        res.json({
            message: "result",
            result: results
        });

    } catch (err) {
        console.log("에러 발생!" + err);
        res.status(500).send("Server Error");
    }
});

router.get("/:userId", async (req, res) => {

    let { userId } = req.params;
    try {
        let sql = "SELECT * "
            + "FROM TBL_FEED F "
            + "INNER JOIN TBL_FEED_IMG I ON F.ID = I.FEEDID "
            + "WHERE F.USERID = ?";
        let [list] = await db.query(sql, [userId]);
        res.json({
            list: list,
            result: "success"
        })
    } catch (error) {
        console.log(error);

    }
})

router.get("/like/:feedNo/:userId", async (req, res) => {

    let { feedNo, userId } = req.params;
    try {
        let sql = "SELECT * FROM FEED_LIKE WHERE USERID = ? AND FEEDNO = ?";
        let [list] = await db.query(sql, [userId, feedNo]);
        if (list.length > 0) {
            let sqlDelete = "DELETE FROM FEED_LIKE WHERE USERID = ? AND FEEDNO = ?";
            let result = await db.query(sqlDelete, [userId, feedNo]);
            return (res.json({
                result: result,
                msg: "좋아요 삭제"
            }))
        }
        let sqlInsert = "INSERT INTO FEED_LIKE(FEEDNO, USERID, CDATE) VALUES(?, ?, NOW())"
        let result = await db.query(sqlInsert, [feedNo, userId]);
        return (res.json({
            result: result,
            msg: "좋아요 추가"
        }))
    } catch (error) {
        console.log(error);

    }
})

router.get("/bookmark/:feedNo/:userId", async (req, res) => {

    let { feedNo, userId } = req.params;
    try {
        let sql = "SELECT * FROM BOOKMARK WHERE USERID = ? AND FEEDNO = ?";
        let [list] = await db.query(sql, [userId, feedNo]);
        if (list.length > 0) {
            let sqlDelete = "DELETE FROM BOOKMARK WHERE USERID = ? AND FEEDNO = ?";
            let result = await db.query(sqlDelete, [userId, feedNo]);
            return (res.json({
                result: result,
                msg: "북마크 삭제"
            }))
        }
        let sqlInsert = "INSERT INTO BOOKMARK(FEEDNO, USERID, CDATE) VALUES(?, ?, NOW())"
        let result = await db.query(sqlInsert, [feedNo, userId]);
        return (res.json({
            result: result,
            msg: "북마크 추가"
        }))
    } catch (error) {
        console.log(error);

    }
})

router.get("/comment/:feedNo", async (req, res) => {
    let { feedNo } = req.params;
    try {
        let sql = "SELECT * FROM FEED_COMMENT WHERE FEEDNO = ?";
        let [list] = await db.query(sql, [feedNo]);

        res.json({
            list : list,
            result: "success"
        })
    } catch (error) {
        console.log(error);

    }
})

router.post("/comment", async (req, res) => {
    let { feedNo, userId, content } = req.body;
    try {
        let sql = "INSERT INTO FEED_COMMENT(FEEDNO, CONTENT, USERID, CDATE, UDATE) VALUES(?, ?, ?, NOW(), NOW())";
        let result = await db.query(sql, [feedNo, content, userId]);

        res.json({
            result : result,
            result: "댓글 작성 성공"
        })
    } catch (error) {
        console.log(error);

    }
})

router.get("/:userId/:feedCount", async (req, res) => {
    let { feedCount, userId } = req.params;
    let limit = parseInt(feedCount);

    try {
        let sql = `
            SELECT 
                F.*, 
                ANY_VALUE(I.IMGPATH) AS IMGPATH, 
                COUNT(DISTINCT L.LIKENO) AS LIKE_COUNT,
                COUNT(DISTINCT CASE WHEN L.USERID = ? THEN 1 END) AS MY_LIKE,
                COUNT(DISTINCT B.BOOKMARKNO) AS MY_BOOKMARK 
            FROM FEED F 
            LEFT JOIN FEED_IMG I ON F.FEEDNO = I.FEEDNO AND I.IMGTYPE = 'M' 
            LEFT JOIN FEED_LIKE L ON F.FEEDNO = L.FEEDNO 
            LEFT JOIN BOOKMARK B ON F.FEEDNO = B.FEEDNO AND B.USERID = ?
            WHERE F.USERID = ? 
               OR F.USERID IN (
                   SELECT FOLLOWINGID FROM FOLLOW WHERE FOLLOWID = ?
               ) 
            GROUP BY F.FEEDNO
            ORDER BY F.CDATE DESC 
            LIMIT ? OFFSET 0
        `;

        // 파라미터 순서: [MY_LIKE용 userId, WHERE절 userId, WHERE절 userId, LIMIT 숫자]
        let [list] = await db.query(sql, [userId, userId, userId, userId, limit]);

        res.json({ list: list, result: "success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});



router.post("/", async (req, res) => {
    console.log(req.body);

    let { userId, content } = req.body;
    try {
        let sql = "INSERT INTO FEED(USERID, CONTENT, CDATE, UDATE) VALUES(? , ?, NOW(), NOW())"
        let result = await db.query(sql, [userId, content]);
        res.json({
            msg: "추가완료",
            result: result
        })
    } catch (error) {
        console.log(error);

    }
})

module.exports = router;