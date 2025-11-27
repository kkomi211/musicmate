import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, TextField, Stack, IconButton, Avatar, 
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputAdornment, Button
} from "@mui/material";

// 아이콘
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckIcon from '@mui/icons-material/Check';

// JWT 디코딩 헬퍼 (FeedAdd.js와 동일)
function decodeToken(token) {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

function DealAdd() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // --- State 관리 ---
    const [userId, setUserId] = useState("");
    const [dealInfo, setDealInfo] = useState({
        title: "",
        price: "",
        content: "",
        product: "I" // 기본값: 악기(I)
    });
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // 1. 초기 로그인 확인
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded && decoded.userId) {
                setUserId(decoded.userId);
            } else {
                alert("로그인이 필요합니다.");
                navigate("/login");
            }
        } else {
            alert("로그인이 필요합니다.");
            navigate("/login");
        }
    }, [navigate]);

    // 2. 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDealInfo(prev => ({ ...prev, [name]: value }));
    };

    // 3. 파일 선택 및 미리보기 핸들러
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);

        // 미리보기 URL 생성
        const filePreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(filePreviews);
    };

    // 4. 이미지 업로드 함수 (판매글 등록 후 호출)
    const fnUploadFile = (sellNo) => {
        const formData = new FormData();
        
        for (let i = 0; i < files.length; i++) {
            // 첫 번째 사진은 썸네일(M), 나머지는 일반(C)
            const imgType = (i === 0) ? "M" : "C";
            
            formData.append("file", files[i]);
            formData.append("imgType", imgType); // 서버에서 배열로 받음
        }

        formData.append("sellNo", sellNo); // 판매글 번호 연결
        formData.append("userId", userId);

        // 파일 업로드 API 호출 (예시 경로)
        fetch("http://localhost:3010/deal/upload", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log("이미지 업로드 완료:", data);
            alert("판매글이 등록되었습니다.");
            navigate("/deal"); // 목록으로 이동
        })
        .catch(err => {
            console.error("이미지 업로드 실패:", err);
            alert("글은 등록되었으나 이미지 업로드에 실패했습니다.");
            navigate("/deal");
        });
    };

    // 5. 판매글 등록 핸들러
    const handleSubmit = () => {
        // 유효성 검사
        if (!dealInfo.title) return alert("제목을 입력해주세요.");
        if (!dealInfo.price) return alert("가격을 입력해주세요.");
        if (!dealInfo.content) return alert("내용을 입력해주세요.");

        // 판매글 정보 전송
        fetch("http://localhost:3010/deal/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                title: dealInfo.title,
                content: dealInfo.content,
                price: dealInfo.price,
                product: dealInfo.product,
                status: 'Y' // 기본 판매중
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                const sellNo = data.sellNo; // 서버에서 insertId(PK)를 받아와야 함
                
                // 이미지가 있으면 업로드 진행, 없으면 바로 이동
                if (files.length > 0 && sellNo) {
                    fnUploadFile(sellNo);
                } else {
                    alert("판매글이 등록되었습니다.");
                    navigate("/deal");
                }
            } else {
                alert("등록 실패: " + data.msg);
            }
        })
        .catch(err => {
            console.error("등록 에러:", err);
            alert("서버 오류가 발생했습니다.");
        });
    };

    return (
        <Box sx={{ width: '80%', minHeight: '100vh', backgroundColor: '#fff', pb: 10, mx: 'auto' }}>
            
            {/* 1. 상단 헤더 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIosNewIcon sx={{ color: '#333' }} />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                    내 물건 팔기
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                {/* 상단 완료 버튼 (선택 사항) */}
                <Button 
                    onClick={handleSubmit} 
                    sx={{ fontWeight: 'bold', color: '#d32f2f' }}
                >
                    완료
                </Button>
            </Box>

            <Box sx={{ p: 3, maxWidth: '600px', mx: 'auto' }}>
                
                {/* 2. 이미지 업로드 영역 */}
                <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'auto', py: 1 }}>
                    {/* 업로드 버튼 */}
                    <Box 
                        sx={{ 
                            width: 80, height: 80, 
                            border: '1px solid #ccc', borderRadius: 2,
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            cursor: 'pointer', flexShrink: 0, backgroundColor: '#fafafa'
                        }}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <PhotoCameraIcon sx={{ color: '#666' }} />
                        <Typography variant="caption" color="text.secondary">
                            {files.length}/10
                        </Typography>
                    </Box>
                    
                    {/* 숨겨진 input */}
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange} 
                    />

                    {/* 미리보기 이미지들 */}
                    {previewUrls.map((url, index) => (
                        <Box key={index} sx={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                            <Avatar 
                                variant="rounded" 
                                src={url} 
                                sx={{ width: '100%', height: '100%', border: '1px solid #eee' }} 
                            />
                            {index === 0 && (
                                <Box sx={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
                                    fontSize: '0.6rem', textAlign: 'center', py: 0.5
                                }}>
                                    대표 사진
                                </Box>
                            )}
                        </Box>
                    ))}
                </Stack>

                {/* 3. 입력 폼 영역 */}
                <Stack spacing={3}>
                    {/* 제목 */}
                    <TextField
                        label="글 제목"
                        name="title"
                        variant="standard"
                        value={dealInfo.title}
                        onChange={handleChange}
                        fullWidth
                        placeholder="제목을 입력해주세요."
                    />

                    {/* 카테고리 (Radio Group) */}
                    <FormControl>
                        <FormLabel id="product-group-label" sx={{ fontSize: '0.9rem', mb: 1 }}>카테고리</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="product-group-label"
                            name="product"
                            value={dealInfo.product}
                            onChange={handleChange}
                        >
                            <FormControlLabel value="I" control={<Radio size="small" sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }} />} label="악기" />
                            <FormControlLabel value="S" control={<Radio size="small" sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }} />} label="악보" />
                            <FormControlLabel value="E" control={<Radio size="small" sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }} />} label="기타" />
                        </RadioGroup>
                    </FormControl>

                    {/* 가격 */}
                    <TextField
                        label="가격"
                        name="price"
                        type="number"
                        variant="standard"
                        value={dealInfo.price}
                        onChange={handleChange}
                        fullWidth
                        placeholder="가격을 입력해주세요."
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                        }}
                    />

                    {/* 내용 */}
                    <TextField
                        label="자세한 설명"
                        name="content"
                        variant="outlined"
                        multiline
                        rows={8}
                        value={dealInfo.content}
                        onChange={handleChange}
                        fullWidth
                        placeholder="구매 시기, 브랜드, 사용감 등 물건에 대한 자세한 정보를 작성하면 판매 확률이 올라갑니다."
                    />
                </Stack>
            </Box>

            {/* 4. 하단 등록 버튼 (플로팅 or 고정 버튼) */}
            {/* 여기서는 상단 '완료' 버튼과 중복되지만, 편의성을 위해 하단 FAB도 추가 */}
            <Fab 
                color="primary" 
                aria-label="save" 
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                    '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' },
                    zIndex: 1100,
                }}
                onClick={handleSubmit}
            >
                <CheckIcon />
            </Fab>

        </Box>
    );
}

export default DealAdd;