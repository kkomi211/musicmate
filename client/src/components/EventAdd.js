import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, TextField, Button, Stack, IconButton
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CheckIcon from '@mui/icons-material/Check';

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

function EventAdd() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    
    // 이벤트 정보 State
    const [eventInfo, setEventInfo] = useState({
        title: "",
        content: "",
        sdate: "",
        edate: ""
    });

    // 1. 초기 로그인 확인
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded && decoded.userId) {
                setUserId(decoded.userId);
                // (선택 사항) 관리자 권한 체크 로직이 필요할 수 있음
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
        setEventInfo(prev => ({ ...prev, [name]: value }));
    };

    // 3. 이벤트 등록 핸들러
    const handleSubmit = () => {
        if (!eventInfo.title) return alert("이벤트 제목을 입력해주세요.");
        if (!eventInfo.sdate) return alert("시작일을 설정해주세요.");
        if (!eventInfo.edate) return alert("종료일을 설정해주세요.");
        if (!eventInfo.content) return alert("내용을 입력해주세요.");
        
        if (eventInfo.sdate > eventInfo.edate) {
            return alert("종료일은 시작일보다 같거나 늦어야 합니다.");
        }

        // 서버 전송
        fetch("http://localhost:3010/event/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...eventInfo,
                userId: userId
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                alert("이벤트가 등록되었습니다.");
                navigate("/event");
            } else {
                alert("등록 실패: " + (data.msg || "오류가 발생했습니다."));
            }
        })
        .catch(err => {
            console.error("Event add error:", err);
            alert("서버 오류가 발생했습니다.");
        });
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#fff', pb: 10 }}>
            
            {/* 1. 상단 헤더 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIosNewIcon sx={{ color: '#333' }} />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                    이벤트 등록
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button 
                    onClick={handleSubmit} 
                    sx={{ fontWeight: 'bold', color: '#d32f2f' }}
                >
                    완료
                </Button>
            </Box>

            {/* 2. 입력 폼 영역 */}
            <Box sx={{ p: 3, maxWidth: '600px', mx: 'auto' }}>
                <Stack spacing={3}>
                    {/* 제목 */}
                    <TextField
                        label="이벤트 제목"
                        name="title"
                        variant="standard"
                        value={eventInfo.title}
                        onChange={handleChange}
                        fullWidth
                        placeholder="ex) 11월 버스킹 페스티벌"
                    />

                    {/* 기간 설정 (시작일 ~ 종료일) */}
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="시작일"
                            name="sdate"
                            type="date"
                            variant="standard"
                            value={eventInfo.sdate}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="종료일"
                            name="edate"
                            type="date"
                            variant="standard"
                            value={eventInfo.edate}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>

                    {/* 내용 */}
                    <TextField
                        label="상세 내용"
                        name="content"
                        variant="outlined"
                        multiline
                        rows={12}
                        value={eventInfo.content}
                        onChange={handleChange}
                        fullWidth
                        placeholder="이벤트 참여 방법, 경품, 주의사항 등 상세한 내용을 입력해주세요."
                    />
                </Stack>
            </Box>

            {/* 3. 하단 FAB (저장) */}
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

export default EventAdd;