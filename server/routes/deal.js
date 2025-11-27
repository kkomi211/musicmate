const express = require('express');
const router = express.Router();
const db = require("../db"); // DB 연결 설정 경로에 맞게 수정해주세요
const multer = require("multer");
const path = require("path");

// 이미지 업로드 설정 (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), // 업로드 폴더
    filename: (req, file, cb) => {
        // 한글 파일명 깨짐 방지 및 중복 방지를 위한 타임스탬프 추가
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, Date.now() + '-' + basename + ext);
    }
});
const upload = multer({ storage });

// 1. 판매글 등록 (텍스트 정보)
// URL: /deal/add
router.post("/add", async (req, res) => {
    // 클라이언트에서 보낸 데이터 받기
    const { userId, title, content, price, product, status } = req.body;

    try {
        // SELL 테이블에 데이터 삽입
        let sql = `
            INSERT INTO SELL (TITLE, CONTENT, PRICE, STATUS, USERID, PRODUCT, CDATE) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        // DB 쿼리 실행
        let [result] = await db.query(sql, [title, content, price, status || 'Y', userId, product]);

        // 성공 시 생성된 게시글 번호(insertId) 반환
        res.json({
            result: "success",
            msg: "판매글이 등록되었습니다.",
            sellNo: result.insertId 
        });

    } catch (error) {
        console.error("판매글 등록 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 2. 판매글 이미지 업로드
// URL: /deal/upload
router.post('/upload', upload.array('file'), async (req, res) => {
    // 클라이언트 FormData에서 받은 데이터
    const { sellNo, userId } = req.body;
    const files = req.files; // 업로드된 파일 객체 배열
    const imgTypes = req.body.imgType; // 이미지 타입 (M: 썸네일, C: 일반)

    try {
        let results = [];
        let host = `${req.protocol}://${req.get("host")}/`; // 이미지 접근 기본 URL

        // 파일 하나씩 DB에 저장
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let filename = file.filename;
            // 윈도우 경로 역슬래시(\) 문제 방지를 위해 /로 통일하거나 path.join 사용 권장
            // 여기서는 host URL과 결합
            let destination = host + 'uploads/' + filename; 

            // imgType 처리 (파일이 1개일 땐 문자열, 여러 개일 땐 배열로 들어옴)
            let currentImgType;
            if (Array.isArray(imgTypes)) {
                currentImgType = imgTypes[i];
            } else {
                currentImgType = imgTypes;
            }

            let sql = `
                INSERT INTO SELL_IMG (SELLNO, IMGNAME, IMGPATH, IMGTYPE, CDATE) 
                VALUES (?, ?, ?, ?, NOW())
            `;
            
            let [result] = await db.query(sql, [sellNo, filename, destination, currentImgType]);
            results.push(result);
        }

        res.json({
            message: "success",
            result: results
        });

    } catch (err) {
        console.error("이미지 업로드 에러:", err);
        res.status(500).send("Server Error");
    }
});

// 3. (참고용) 판매글 목록 조회
// URL: /deal/list
router.get("/list", async (req, res) => {
    const { type } = req.query; // ALL, I, S, E
    
    try {
        let sql = `
            SELECT S.*, 
            (SELECT IMGPATH FROM SELL_IMG WHERE SELLNO = S.SELLNO AND IMGTYPE = 'M' LIMIT 1) AS IMGPATH
            FROM SELL S
        `;
        
        let params = [];
        
        // 탭 필터링 (전체가 아닐 경우 조건 추가)
        if (type && type !== 'ALL') {
            sql += " WHERE S.PRODUCT = ?";
            params.push(type);
        }
        
        sql += " ORDER BY S.CDATE DESC";

        let [list] = await db.query(sql, params);
        
        res.json({ list: list, result: "success" });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail" });
    }
});

router.get("/detail/:sellNo", async (req, res) => {
    let { sellNo } = req.params;
    try {
        // 1. 판매글 상세 정보 가져오기
        let sqlInfo = `
            SELECT 
                S.*, 
                U.NICKNAME,
                (SELECT IMGPATH 
                 FROM FEED_IMG 
                 WHERE USERID = S.USERID AND IMGTYPE = 'P' 
                 ORDER BY CDATE DESC LIMIT 1) AS USER_PROFILE
            FROM SELL S
            INNER JOIN USER U ON S.USERID = U.USERID
            WHERE S.SELLNO = ?
        `;
        
        let [infoRows] = await db.query(sqlInfo, [sellNo]);
        
        if (infoRows.length > 0) {
            // 2. 해당 판매글의 모든 이미지 가져오기 (M, C 타입 모두)
            // [수정 완료] IMGNO -> SELLIMGNO (SELL_IMG 테이블의 PK)
            let sqlImages = `
                SELECT * FROM SELL_IMG 
                WHERE SELLNO = ? 
                ORDER BY IMGTYPE DESC, SELLIMGNO ASC 
            `;
            let [imageRows] = await db.query(sqlImages, [sellNo]);

            res.json({ 
                result: "success", 
                info: infoRows[0], 
                images: imageRows // 이미지 리스트 추가
            });
        } else {
            res.json({ result: "fail", msg: "존재하지 않는 게시글입니다." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 5. [추가] 판매 상태 변경 API (판매중 <-> 판매완료)
// URL: /deal/status
router.put("/status", async (req, res) => {
    const { sellNo, status } = req.body;
    try {
        let sql = "UPDATE SELL SET STATUS = ? WHERE SELLNO = ?";
        let [result] = await db.query(sql, [status, sellNo]);

        if (result.affectedRows > 0) {
            res.json({ result: "success", msg: "상태가 변경되었습니다." });
        } else {
            res.json({ result: "fail", msg: "변경할 게시글을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("상태 변경 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

// 6. [추가] 판매글 삭제 API
// URL: /deal/:sellNo
router.delete("/:sellNo", async (req, res) => {
    const { sellNo } = req.params;
    try {
        // 1. (선택사항) 연결된 이미지 파일 삭제 로직이 필요하다면 여기서 처리
        // (DB에서 이미지 경로 조회 -> fs.unlink로 파일 삭제)

        // 2. DB 데이터 삭제
        // 외래 키 제약 조건 때문에 자식 테이블(SELL_IMG) 먼저 삭제해야 함
        await db.query("DELETE FROM SELL_IMG WHERE SELLNO = ?", [sellNo]);
        
        // 그 다음 부모 테이블(SELL) 삭제
        let sql = "DELETE FROM SELL WHERE SELLNO = ?";
        let [result] = await db.query(sql, [sellNo]);

        if (result.affectedRows > 0) {
            res.json({ result: "success", msg: "삭제되었습니다." });
        } else {
            res.json({ result: "fail", msg: "삭제할 게시글을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("삭제 에러:", error);
        res.status(500).json({ result: "fail", msg: "Server Error" });
    }
});

module.exports = router;