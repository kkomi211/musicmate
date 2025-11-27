const express = require('express');
const router = express.Router();
const db = require("../db"); // DB 연결 설정 경로
const multer = require("multer");
const path = require("path");

// 이미지 업로드 설정 (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, Date.now() + '-' + basename + ext);
    }
});
const upload = multer({ storage });

// 1. 밴드 모집글 등록 (텍스트 정보)
// URL: /band/add
router.post("/add", async (req, res) => {
    const { userId, title, content, inst, edate, status } = req.body;

    try {
        let sql = `
            INSERT INTO BAND_BOARD (TITLE, CONTENT, USERID, INST, EDATE, STATUS, CDATE) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        let [result] = await db.query(sql, [title, content, userId, inst, edate, status || 'Y']);

        res.json({
            result: "success",
            msg: "모집글이 등록되었습니다.",
            bandNo: result.insertId 
        });

    } catch (error) {
        console.error("밴드 모집글 등록 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 2. 밴드 이미지 업로드
// URL: /band/upload
router.post('/upload', upload.array('file'), async (req, res) => {
    const { bandNo, userId } = req.body;
    const files = req.files; 
    const imgTypes = req.body.imgType; 

    try {
        let results = [];
        let host = `${req.protocol}://${req.get("host")}/`;

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let filename = file.filename;
            let destination = host + 'uploads/' + filename; 
            
            let currentImgType;
            if (Array.isArray(imgTypes)) {
                currentImgType = imgTypes[i];
            } else {
                currentImgType = imgTypes;
            }

            let sql = `
                INSERT INTO BAND_IMG (BANDNO, IMGNAME, IMGPATH, IMGTYPE, CDATE) 
                VALUES (?, ?, ?, ?, NOW())
            `;
            
            let [result] = await db.query(sql, [bandNo, filename, destination, currentImgType]);
            results.push(result);
        }

        res.json({
            message: "success",
            result: results
        });

    } catch (err) {
        console.error("밴드 이미지 업로드 에러:", err);
        res.status(500).send("Server Error");
    }
});

// 3. 밴드 모집글 목록 조회
// URL: /band/list
router.get("/list", async (req, res) => {
    try {
        let sql = `
            SELECT B.*, 
            U.NICKNAME,
            (SELECT IMGPATH FROM BAND_IMG WHERE BANDNO = B.BANDNO AND IMGTYPE = 'M' LIMIT 1) AS IMGPATH
            FROM BAND_BOARD B
            INNER JOIN USER U ON B.USERID = U.USERID
            ORDER BY B.CDATE DESC
        `;
        
        let [list] = await db.query(sql);
        res.json({ list: list, result: "success" });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

// 4. [추가] 밴드 모집글 상세 조회 API
// URL: /band/detail/:bandNo
router.get("/detail/:bandNo", async (req, res) => {
    let { bandNo } = req.params;
    try {
        // 1. 모집글 상세 정보 + 작성자 닉네임 + 작성자 프로필 사진
        let sqlInfo = `
            SELECT 
                B.*, 
                U.NICKNAME,
                -- 작성자 프로필 사진 (FEED_IMG 테이블의 P 타입 최신 1개)
                (SELECT IMGPATH 
                 FROM FEED_IMG 
                 WHERE USERID = B.USERID AND IMGTYPE = 'P' 
                 ORDER BY CDATE DESC LIMIT 1) AS USER_PROFILE
            FROM BAND_BOARD B
            INNER JOIN USER U ON B.USERID = U.USERID
            WHERE B.BANDNO = ?
        `;
        
        let [infoRows] = await db.query(sqlInfo, [bandNo]);
        
        if (infoRows.length > 0) {
            // 2. 밴드 관련 이미지 가져오기 (BAND_IMG 테이블)
            // 썸네일(M)이 먼저 오도록 정렬
            let sqlImages = `
                SELECT * FROM BAND_IMG 
                WHERE BANDNO = ? 
                ORDER BY IMGTYPE DESC, BANDIMGNO ASC
            `;
            let [imageRows] = await db.query(sqlImages, [bandNo]);

            res.json({ 
                result: "success", 
                info: infoRows[0], 
                images: imageRows 
            });
        } else {
            res.json({ result: "fail", msg: "존재하지 않는 모집글입니다." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 5. [추가] 모집 상태 변경 API (모집중 <-> 모집완료)
// URL: /band/status
router.put("/status", async (req, res) => {
    const { bandNo, status } = req.body;
    try {
        let sql = "UPDATE BAND_BOARD SET STATUS = ? WHERE BANDNO = ?";
        let [result] = await db.query(sql, [status, bandNo]);

        if (result.affectedRows > 0) {
            res.json({ result: "success", msg: "상태가 변경되었습니다." });
        } else {
            res.json({ result: "fail", msg: "변경할 모집글을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("상태 변경 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 6. [추가] 모집글 삭제 API
// URL: /band/:bandNo
router.delete("/:bandNo", async (req, res) => {
    const { bandNo } = req.params;
    try {
        // 이미지 먼저 삭제 (외래 키 제약 조건 해결)
        await db.query("DELETE FROM BAND_IMG WHERE BANDNO = ?", [bandNo]);
        
        // 게시글 삭제
        let sql = "DELETE FROM BAND_BOARD WHERE BANDNO = ?";
        let [result] = await db.query(sql, [bandNo]);

        if (result.affectedRows > 0) {
            res.json({ result: "success", msg: "삭제되었습니다." });
        } else {
            res.json({ result: "fail", msg: "삭제할 모집글을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("삭제 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

module.exports = router;