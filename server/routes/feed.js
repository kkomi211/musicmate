const express = require('express')
const router = express.Router();
const db = require("../db")
const authmiddlewarer = require("../auth");
const multer = require("multer");
const jwt = require('jsonwebtoken');

const JWT_KEY = "server_secret_key"

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
            + "FROM FEED F "
            + "INNER JOIN FEED_IMG I ON F.FEEDNO = I.FEEDNO "
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



router.get("/follower/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        // FOLLOW 테이블에서 FOLLOWINGID가 '나(userId)'인 사람들을 찾고,
        // 그 사람들의 정보(USERID, NICKNAME)와 프로필 사진을 가져옵니다.
        let sql = `
            SELECT 
                U.USERID, 
                U.NICKNAME,
                (SELECT IMGPATH 
                 FROM FEED_IMG 
                 WHERE USERID = U.USERID AND IMGTYPE = 'P' 
                 ORDER BY CDATE DESC LIMIT 1) AS IMGPATH
            FROM FOLLOW F
            INNER JOIN USER U ON F.FOLLOWID = U.USERID
            WHERE F.FOLLOWINGID = ?
        `;

        let [list] = await db.query(sql, [userId]);

        res.json({
            list: list,
            result: "success"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

// 2. 내가 팔로우하는 사람 목록 (팔로잉)
router.get("/following/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        // FOLLOW 테이블에서 FOLLOWID가 '나(userId)'인 데이터를 찾고,
        // 내가 팔로우한 상대방(FOLLOWINGID)의 정보를 가져옵니다.
        let sql = `
            SELECT 
                U.USERID, 
                U.NICKNAME,
                (SELECT IMGPATH 
                 FROM FEED_IMG 
                 WHERE USERID = U.USERID AND IMGTYPE = 'P' 
                 ORDER BY CDATE DESC LIMIT 1) AS IMGPATH
            FROM FOLLOW F
            INNER JOIN USER U ON F.FOLLOWINGID = U.USERID
            WHERE F.FOLLOWID = ?
        `;

        let [list] = await db.query(sql, [userId]);

        res.json({
            list: list,
            result: "success"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.get("/personal/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        let sql = `
            SELECT 
                U.*,
                (SELECT IMGPATH FROM FEED_IMG WHERE USERID = U.USERID AND IMGTYPE = 'P') AS IMGPATH,
                
                (SELECT COUNT(*) FROM FEED WHERE USERID = U.USERID) AS POST_COUNT, 
                (SELECT COUNT(*) FROM FOLLOW WHERE FOLLOWINGID = U.USERID) AS FOLLOWER_COUNT, 
                (SELECT COUNT(*) FROM FOLLOW WHERE FOLLOWID = U.USERID) AS FOLLOWING_COUNT 
            FROM USER U 
            WHERE U.USERID = ?
        `;

        let [list] = await db.query(sql, [userId]);

        res.json({
            list: list,
            result: "success"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.put('/user/update', upload.single('file'), async (req, res) => {
    const { userId, nickname, instrument } = req.body;
    const file = req.file; // 업로드된 파일 객체

    try {
        // 1. 텍스트 정보(닉네임, 악기) 수정 - USER 테이블 업데이트
        // INSTRUMENT 컬럼이 USER 테이블에 있다고 가정
        let updateUserSql = "UPDATE USER SET NICKNAME = ?, INSTRUMENT = ?, UDATE = NOW() WHERE USERID = ?";
        await db.query(updateUserSql, [nickname, instrument, userId]);

        // 2. 파일이 전송된 경우 - 프로필 이미지 저장 (FEED_IMG 테이블)
        if (file) {
            let host = `${req.protocol}://${req.get("host")}/`;
            let filename = file.filename;
            let destination = host + file.destination + file.filename; // 이미지 접근 URL

            // [변경] 프로필 사진이 이미 있는지 확인
            let checkSql = "SELECT IMGNO FROM FEED_IMG WHERE USERID = ? AND IMGTYPE = 'P'";
            let [rows] = await db.query(checkSql, [userId]);

            if (rows.length > 0) {
                // 이미 있으면 UPDATE
                let updateImgSql = "UPDATE FEED_IMG SET IMGNAME = ?, IMGPATH = ?, UDATE = NOW() WHERE USERID = ? AND IMGTYPE = 'P'";
                await db.query(updateImgSql, [filename, destination, userId]);
            } else {
                // 없으면 INSERT
                // IMGTYPE = 'P' (프로필)로 저장, FEEDNO는 NULL
                let insertImgSql = "INSERT INTO FEED_IMG(FEEDNO, IMGNAME, IMGPATH, CDATE, UDATE, IMGTYPE, USERID) VALUES(NULL, ?, ?, NOW(), NOW(), 'P', ?)";
                await db.query(insertImgSql, [filename, destination, userId]);
            }
        }

        let selectSql = "SELECT * FROM USER WHERE USERID = ?"
        let [list] = await db.query(selectSql, [userId]);
        let user = {
            userId: list[0].USERID,
            name: list[0].NAME,
            nickname: list[0].NICKNAME,
            auth: list[0].AUTH
        }
        token = jwt.sign(user, JWT_KEY, { expiresIn: '1h' });

        res.json({
            result: "success",
            msg: "프로필이 수정되었습니다.",
            token: token
        });

    } catch (error) {
        console.error("프로필 수정 중 오류 발생:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

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

router.delete("/:feedNo", async (req, res) => {
    let { feedNo } = req.params;
    try {
        let sqlImg = "DELETE FROM FEED_IMG WHERE FEEDNO = ?"
        let sqlComment = "DELETE FROM FEED_COMMENT WHERE FEEDNO = ?"
        let sqlLike = "DELETE FROM FEED_LIKE WHERE FEEDNO = ?"
        let sqlBookmark = "DELETE FROM BOOKMARK WHERE FEEDNO = ?"
        let sql = "DELETE FROM FEED WHERE FEEDNO = ?";

        let result2 = await db.query(sqlImg, [feedNo]);
        let result3 = await db.query(sqlComment, [feedNo]);
        let result4 = await db.query(sqlLike, [feedNo]);
        let result5 = await db.query(sqlBookmark, [feedNo]);
        let result1 = await db.query(sql, [feedNo]);
        return (res.json({
            result: "success"
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
        // [수정] FEED_COMMENT(C)와 USER(U) 테이블을 조인하여 NICKNAME을 가져옵니다.
        let sql = `
            SELECT C.*, U.NICKNAME 
            FROM FEED_COMMENT C
            LEFT JOIN USER U ON C.USERID = U.USERID
            WHERE C.FEEDNO = ?
            ORDER BY C.CDATE ASC
        `;
        let [list] = await db.query(sql, [feedNo]);

        let imgSql = "SELECT * FROM FEED_IMG WHERE FEEDNO = ?";
        let [imgList] = await db.query(imgSql, [feedNo]);

        res.json({
            list: list,
            imgList: imgList,
            result: "success"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.post("/comment", async (req, res) => {
    let { feedNo, userId, content } = req.body;
    try {
        // 1. 댓글 작성 (FEED_COMMENT 테이블)
        let sql = "INSERT INTO FEED_COMMENT(FEEDNO, CONTENT, USERID, CDATE, UDATE) VALUES(?, ?, ?, NOW(), NOW())";
        let result = await db.query(sql, [feedNo, content, userId]);

        // 2. 알림 추가 (ALERT 테이블)
        // 2-1. 먼저 피드 작성자(주인)의 ID를 찾습니다.
        let findOwnerSql = "SELECT USERID FROM FEED WHERE FEEDNO = ?";
        let [ownerRows] = await db.query(findOwnerSql, [feedNo]);

        if (ownerRows.length > 0) {
            let ownerId = ownerRows[0].USERID;

            // 2-2. 본인이 본인 글에 댓글을 단 경우가 아닐 때만 알림 추가
            if (ownerId !== userId) {
                let alertSql = `
                    INSERT INTO ALERT (USERID, STATUS, CDATE, KIND, FEEDNO, SENDERID) 
                    VALUES (?, 'N', NOW(), 'F', ?, ?)
                `;
                // 파라미터: [받는사람ID(피드주인), 피드번호, 보낸사람ID(댓글작성자)]
                await db.query(alertSql, [ownerId, feedNo, userId]);
            }
        }

        res.json({
            result: result,
            result2: "success",
            msg: "댓글 작성 성공"
        });
    } catch (error) {
        console.error("댓글 작성 중 오류:", error);
        res.status(500).json({ result: "fail", msg: "서버 오류" });
    }
});

router.delete("/comment/:commentNo", async (req, res) => {
    let { commentNo } = req.params;
    try {
        let sql = "DELETE FROM FEED_COMMENT WHERE COMMENTNO = ?";
        let result = await db.query(sql, [commentNo]);

        res.json({
            result: result,
            result2: "success",
            msg: "댓글 삭제 성공"
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
                ANY_VALUE(U.NICKNAME) AS NICKNAME,
                
                -- [추가됨] 작성자 프로필 이미지 (USER_IMGPATH)
                (SELECT IMGPATH 
                 FROM FEED_IMG 
                 WHERE USERID = F.USERID AND IMGTYPE = 'P' 
                 ORDER BY CDATE DESC LIMIT 1) AS USER_IMGPATH,

                ANY_VALUE(I.IMGPATH) AS IMGPATH, -- 피드 메인 이미지
                
                COUNT(DISTINCT L.LIKENO) AS LIKE_COUNT,
                COUNT(DISTINCT CASE WHEN L.USERID = ? THEN 1 END) AS MY_LIKE,
                COUNT(DISTINCT B.BOOKMARKNO) AS MY_BOOKMARK 
            FROM FEED F 
            LEFT JOIN USER U ON F.USERID = U.USERID 
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

        // 파라미터 순서: [MY_LIKE용, MY_BOOKMARK용, WHERE절(본인), 팔로우서브쿼리, LIMIT]
        let [list] = await db.query(sql, [userId, userId, userId, userId, limit]);

        res.json({ list: list, result: "success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.get("/personal/:userId/:feedCount", async (req, res) => {
    let { feedCount, userId } = req.params;
    let limit = parseInt(feedCount);

    try {
        let sql = `
            SELECT 
                F.*, 
                ANY_VALUE(U.NICKNAME) AS NICKNAME, 
                ANY_VALUE(I.IMGPATH) AS IMGPATH, 
                COUNT(DISTINCT L.LIKENO) AS LIKE_COUNT,
                COUNT(DISTINCT CASE WHEN L.USERID = ? THEN 1 END) AS MY_LIKE,
                COUNT(DISTINCT B.BOOKMARKNO) AS MY_BOOKMARK 
            FROM FEED F 
            LEFT JOIN USER U ON F.USERID = U.USERID 
            LEFT JOIN FEED_IMG I ON F.FEEDNO = I.FEEDNO AND I.IMGTYPE = 'M' 
            LEFT JOIN FEED_LIKE L ON F.FEEDNO = L.FEEDNO 
            LEFT JOIN BOOKMARK B ON F.FEEDNO = B.FEEDNO AND B.USERID = ?
            WHERE F.USERID = ?  -- [수정] 팔로잉 조건 삭제하고 이 조건만 남김
            GROUP BY F.FEEDNO
            ORDER BY F.CDATE DESC 
            LIMIT ? OFFSET 0
        `;

        // [수정] 쿼리에서 ? 개수가 줄었으므로 파라미터도 4개로 줄입니다.
        // 순서: [MY_LIKE용, MY_BOOKMARK용, WHERE절(작성자), LIMIT]
        let [list] = await db.query(sql, [userId, userId, userId, limit]);

        res.json({ list: list, result: "success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.get("/checkFollow/:myId/:targetId", async (req, res) => {
    let { myId, targetId } = req.params;
    try {
        let sql = "SELECT COUNT(*) AS cnt FROM FOLLOW WHERE FOLLOWID = ? AND FOLLOWINGID = ?";
        let [rows] = await db.query(sql, [myId, targetId]);

        // cnt가 0보다 크면 팔로우 중(true), 아니면 false
        let isFollowing = rows[0].cnt > 0;

        res.json({
            result: "success",
            isFollowing: isFollowing
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.get("/bookmark/list/:userId/:feedCount", async (req, res) => {
    let { userId, feedCount } = req.params;
    let limit = parseInt(feedCount);

    try {
        let sql = `
            SELECT 
                F.*, 
                ANY_VALUE(U.NICKNAME) AS NICKNAME, 
                ANY_VALUE(I.IMGPATH) AS IMGPATH, 
                COUNT(DISTINCT L.LIKENO) AS LIKE_COUNT,
                COUNT(DISTINCT CASE WHEN L.USERID = ? THEN 1 END) AS MY_LIKE,
                -- 북마크 리스트이므로 MY_BOOKMARK는 무조건 1(true)로 설정하거나 계산
                1 AS MY_BOOKMARK
            FROM FEED F 
            -- [핵심] BOOKMARK 테이블과 INNER JOIN하여 내가 북마크한 글만 필터링
            INNER JOIN BOOKMARK B_MAIN ON F.FEEDNO = B_MAIN.FEEDNO AND B_MAIN.USERID = ? 
            LEFT JOIN USER U ON F.USERID = U.USERID 
            LEFT JOIN FEED_IMG I ON F.FEEDNO = I.FEEDNO AND I.IMGTYPE = 'M' 
            LEFT JOIN FEED_LIKE L ON F.FEEDNO = L.FEEDNO 
            GROUP BY F.FEEDNO
            ORDER BY ANY_VALUE(B_MAIN.CDATE) DESC -- [수정] 정렬 기준 컬럼도 ANY_VALUE()로 감싸줌
            LIMIT ? OFFSET 0
        `;

        // 파라미터 순서: [MY_LIKE확인용UserId, 북마크필터링UserId, LIMIT]
        let [list] = await db.query(sql, [userId, userId, limit]);

        res.json({ list: list, result: "success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

// 2. 팔로우 토글(추가/삭제) API
router.post("/follow", async (req, res) => {
    let { myId, targetId } = req.body;
    try {
        // 이미 팔로우 중인지 확인
        let checkSql = "SELECT COUNT(*) AS cnt FROM FOLLOW WHERE FOLLOWID = ? AND FOLLOWINGID = ?";
        let [rows] = await db.query(checkSql, [myId, targetId]);

        if (rows[0].cnt > 0) {
            // 이미 팔로우 중이면 -> 언팔로우(삭제)
            let deleteSql = "DELETE FROM FOLLOW WHERE FOLLOWID = ? AND FOLLOWINGID = ?";
            await db.query(deleteSql, [myId, targetId]);
            res.json({ result: "success", status: "unfollowed" });
        } else {
            // 팔로우 안한 상태면 -> 팔로우(추가)
            let insertSql = "INSERT INTO FOLLOW(FOLLOWID, FOLLOWINGID, CDATE) VALUES(?, ?, NOW())";
            await db.query(insertSql, [myId, targetId]);
            res.json({ result: "success", status: "followed" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.get("/message/inbox/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        let sql = `
            SELECT DISTINCT 
                U.USERID, U.NICKNAME,
                (SELECT IMGPATH FROM FEED_IMG WHERE USERID = U.USERID AND IMGTYPE = 'P' ORDER BY CDATE DESC LIMIT 1) AS IMGPATH
            FROM MESSAGE M
            INNER JOIN USER U 
                ON (M.SENDERID = U.USERID OR M.RECEIVERID = U.USERID)
            WHERE (M.SENDERID = ? OR M.RECEIVERID = ?) 
              AND U.USERID != ?
        `;

        let [list] = await db.query(sql, [userId, userId, userId]);
        res.json({ list: list, result: "success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.post("/search", async (req, res) => {
    // req.body에서 검색 파라미터를 읽어옵니다.
    const { q: searchTerm, type: searchType, userId: myUserId } = req.body;

    // 안전을 위해 검색어를 대소문자 구분 없이 사용할 수 있도록 처리
    const searchPattern = `%${searchTerm}%`;

    let results = { users: [], feeds: [] };

    try {
        // 1. 사용자 검색 (기존 유지)
        if (searchType === 'user' || searchType === 'all') {
            let userSql = `
                SELECT 
                    U.USERID, 
                    U.NICKNAME,
                    (SELECT IMGPATH 
                     FROM FEED_IMG 
                     WHERE USERID = U.USERID AND IMGTYPE = 'P' 
                     ORDER BY CDATE DESC LIMIT 1) AS IMGPATH
                FROM USER U
                WHERE U.USERID LIKE ? OR U.NICKNAME LIKE ?
                LIMIT 10
            `;
            let [userList] = await db.query(userSql, [searchPattern, searchPattern]);
            results.users = userList;
        }

        // 2. 피드 검색 (수정됨: MY_BOOKMARK 추가)
        if (searchType === 'feed' || searchType === 'all') {
            let feedSql = `
                SELECT 
                    F.FEEDNO, 
                    F.CONTENT, 
                    F.CDATE, 
                    F.USERID,
                    ANY_VALUE(U.NICKNAME) AS NICKNAME,
                    
                    -- [이미지 1] 피드 메인 이미지
                    (SELECT IMGPATH 
                     FROM FEED_IMG 
                     WHERE FEEDNO = F.FEEDNO AND IMGTYPE = 'M' 
                     LIMIT 1) AS IMGPATH,

                    -- [이미지 2] 작성자 프로필 이미지
                    (SELECT IMGPATH 
                     FROM FEED_IMG 
                     WHERE USERID = F.USERID AND IMGTYPE = 'P' 
                     ORDER BY CDATE DESC LIMIT 1) AS USER_IMGPATH,

                    -- [카운트] 좋아요 수
                    COUNT(DISTINCT L.LIKENO) AS LIKE_COUNT,
                    
                    -- [상태 1] 내가 좋아요 눌렀는지 (1이면 true, 0이면 false)
                    COUNT(DISTINCT CASE WHEN L.USERID = ? THEN 1 END) AS MY_LIKE,

                    -- [상태 2] 내가 북마크 했는지 (추가됨)
                    (SELECT COUNT(*) FROM BOOKMARK WHERE FEEDNO = F.FEEDNO AND USERID = ?) AS MY_BOOKMARK

                FROM FEED F
                INNER JOIN USER U ON F.USERID = U.USERID
                LEFT JOIN FEED_LIKE L ON F.FEEDNO = L.FEEDNO
                WHERE F.CONTENT LIKE ? 
                GROUP BY F.FEEDNO
                ORDER BY F.CDATE DESC
                LIMIT 10
            `;
            
            // 파라미터 순서: [좋아요체크용ID, 북마크체크용ID, 검색어]
            // myUserId가 두 번 들어가는 것에 주의하세요!
            let [feedList] = await db.query(feedSql, [myUserId, myUserId, searchPattern]);
            results.feeds = feedList;
        }

        // 최종 결과 반환
        res.json({ result: "success", ...results });

    } catch (error) {
        console.error("통합 검색 오류:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
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