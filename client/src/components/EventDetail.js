import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Box, Typography, IconButton, Divider, Chip, Paper, Stack, Button
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DeleteIcon from '@mui/icons-material/Delete'; // 삭제 아이콘 추가

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

function EventDetail() {
    const navigate = useNavigate();
    const { eventNo } = useParams(); 

    const [event, setEvent] = useState(null);
    const [myUserId, setMyUserId] = useState("");

    // 초기 데이터 로딩
    useEffect(() => {
        // 1. 토큰에서 내 아이디 가져오기
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) setMyUserId(decoded.userId);
        }

        // 2. 이벤트 상세 정보 가져오기
        fetch(`http://localhost:3010/event/detail/${eventNo}`)
            .then(res => res.json())
            .then(data => {
                if (data.result === "success" && data.info) {
                    setEvent(data.info);
                } else {
                    alert("존재하지 않는 이벤트입니다.");
                    navigate(-1);
                }
            })
            .catch(err => {
                console.error("Event detail fetch error:", err);
            });
    }, [eventNo, navigate]);

    // 삭제 핸들러
    const handleDelete = () => {
        if(window.confirm("정말로 이 이벤트를 삭제하시겠습니까?")) {
            fetch(`http://localhost:3010/event/${eventNo}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    alert("삭제되었습니다.");
                    navigate("/event");
                } else {
                    alert("삭제 실패: " + data.msg);
                }
            })
            .catch(err => console.error(err));
        }
    };

    // 상태 판별 함수
    const getEventStatus = (edate) => {
        const today = new Date();
        const endDate = new Date(edate);
        today.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        if (today > endDate) return "END";
        return "ING";
    };

    if (!event) return <Box sx={{ p: 3, textAlign: 'center' }}>로딩중...</Box>;

    const status = getEventStatus(event.EDATE);
    const sdateStr = new Date(event.SDATE).toLocaleDateString();
    const edateStr = new Date(event.EDATE).toLocaleDateString();

    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, mx: 'auto', minHeight: '100vh', backgroundColor: '#fff', pb: 10, position: 'relative' }}>
            
            {/* 1. 상단 헤더 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIosNewIcon sx={{ color: '#333' }} />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                        이벤트 상세
                    </Typography>
                </Box>
                
                {/* [추가] 작성자 본인일 경우 삭제 버튼 표시 */}
                {myUserId === event.USERID && (
                    <IconButton onClick={handleDelete} color="error">
                        <DeleteIcon />
                    </IconButton>
                )}
            </Box>

            {/* 2. 본문 영역 */}
            <Box sx={{ p: 4 }}>
                {/* 상태 및 날짜 */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip 
                        label={status === 'ING' ? "진행중" : "종료"} 
                        size="small" 
                        icon={<EventAvailableIcon style={{fontSize: 16}}/>}
                        color={status === 'ING' ? "primary" : "default"}
                        sx={{ fontWeight: 'bold', backgroundColor: status === 'ING' ? '#e3f2fd' : '#eee', color: status === 'ING' ? '#1976d2' : '#666' }} 
                    />
                    <Chip 
                        label={`${sdateStr} ~ ${edateStr}`}
                        size="small" 
                        icon={<CalendarMonthIcon style={{fontSize: 16}}/>}
                        sx={{ backgroundColor: '#fff', border: '1px solid #eee', fontWeight: 'medium' }} 
                    />
                </Stack>

                {/* 제목 */}
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    {event.TITLE}
                </Typography>
                
                {/* 작성자 정보 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, color: 'text.secondary' }}>
                    <CampaignIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                        {/* [수정] 닉네임 표시 (없으면 아이디) */}
                        {event.NICKNAME || event.USERID} · {new Date(event.CDATE).toLocaleDateString()} 작성
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* 내용 */}
                <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f9f9f9', borderRadius: 2, minHeight: '300px' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                        {event.CONTENT}
                    </Typography>
                </Paper>
            </Box>

            {/* 3. 하단 목록 버튼 */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                    variant="contained" 
                    onClick={() => navigate("/event")}
                    sx={{ 
                        width: '100%', maxWidth: '200px', borderRadius: 20, 
                        background: '#333', fontWeight: 'bold', py: 1.5 
                    }}
                >
                    목록으로
                </Button>
            </Box>
        </Box>
    );
}

export default EventDetail;