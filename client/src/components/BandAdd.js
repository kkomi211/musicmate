import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, TextField, Stack, IconButton, Avatar, 
    Button
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckIcon from '@mui/icons-material/Check';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// JWT 디코딩 헬퍼
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

function BandAdd() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // --- State 관리 ---
    const [userId, setUserId] = useState("");
    const [bandInfo, setBandInfo] = useState({
        title: "",
        content: "",
        inst: "", // 모집 악기
        edate: "", // 마감일
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
        setBandInfo(prev => ({ ...prev, [name]: value }));
    };

    // 3. 파일 선택 및 미리보기 핸들러
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);

        // 미리보기 URL 생성
        const filePreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(filePreviews);
    };

    // 4. 이미지 업로드 함수 (글 등록 후 호출)
    const fnUploadFile = (bandNo) => {
        const formData = new FormData();
        
        for (let i = 0; i < files.length; i++) {
            // 첫 번째 사진은 썸네일(M), 나머지는 일반(C)
            const imgType = (i === 0) ? "M" : "C";
            
            formData.append("file", files[i]);
            formData.append("imgType", imgType); 
        }

        formData.append("bandNo", bandNo);
        formData.append("userId", userId);

        // 파일 업로드 API 호출 (예시 경로)
        fetch("http://localhost:3010/band/upload", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log("이미지 업로드 완료:", data);
            alert("모집글이 등록되었습니다.");
            navigate("/band"); // 목록으로 이동
        })
        .catch(err => {
            console.error("이미지 업로드 실패:", err);
            alert("글은 등록되었으나 이미지 업로드에 실패했습니다.");
            navigate("/band");
        });
    };

    // 5. 모집글 등록 핸들러
    const handleSubmit = () => {
        // 유효성 검사
        if (!bandInfo.title) return alert("제목을 입력해주세요.");
        if (!bandInfo.inst) return alert("모집할 악기(세션)를 입력해주세요.");
        if (!bandInfo.edate) return alert("마감일을 설정해주세요.");
        if (!bandInfo.content) return alert("내용을 입력해주세요.");

        // 모집글 정보 전송
        fetch("http://localhost:3010/band/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                title: bandInfo.title,
                content: bandInfo.content,
                inst: bandInfo.inst,
                edate: bandInfo.edate,
                status: 'Y' // 기본 모집중
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                const bandNo = data.bandNo; // 서버에서 insertId(PK) 반환 가정
                
                // 이미지가 있으면 업로드 진행, 없으면 바로 이동
                if (files.length > 0 && bandNo) {
                    fnUploadFile(bandNo);
                } else {
                    alert("모집글이 등록되었습니다.");
                    navigate("/band");
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
                    밴드 멤버 모집
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
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
                    
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange} 
                    />

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
                                    대표
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
                        value={bandInfo.title}
                        onChange={handleChange}
                        fullWidth
                        placeholder="ex) 홍대 직장인 밴드 베이스 구합니다!"
                    />

                    {/* 모집 악기 */}
                    <TextField
                        label="모집 악기 (파트)"
                        name="inst"
                        variant="standard"
                        value={bandInfo.inst}
                        onChange={handleChange}
                        fullWidth
                        placeholder="ex) 드럼, 베이스, 키보드"
                    />

                    {/* 마감일 (Date Picker) */}
                    <TextField
                        label="모집 마감일"
                        name="edate"
                        type="date"
                        variant="standard"
                        value={bandInfo.edate}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* 내용 */}
                    <TextField
                        label="상세 내용"
                        name="content"
                        variant="outlined"
                        multiline
                        rows={8}
                        value={bandInfo.content}
                        onChange={handleChange}
                        fullWidth
                        placeholder="합주 시간, 장소, 밴드 성향 등 자세한 내용을 적어주세요."
                    />
                </Stack>
            </Box>

            {/* 4. 하단 FAB (저장) */}
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

export default BandAdd;