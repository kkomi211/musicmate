import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Box, Typography, Avatar, Button, IconButton, Divider, Chip, Stack, Paper
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SendIcon from '@mui/icons-material/Send';

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

function BandDetail() {
    const navigate = useNavigate();
    const { bandNo } = useParams(); 

    const [band, setBand] = useState(null);
    const [myUserId, setMyUserId] = useState("");

    // 이미지 슬라이드 관련 State
    const [bandImages, setBandImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 초기 데이터 로딩
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) setMyUserId(decoded.userId);
        }

        fetch(`http://localhost:3010/band/detail/${bandNo}`)
            .then(res => res.json())
            .then(data => {
                if (data.result === "success" && data.info) {
                    setBand(data.info);
                    
                    if (data.images && data.images.length > 0) {
                        setBandImages(data.images);
                    } else {
                        setBandImages([]);
                    }
                } else {
                    alert("존재하지 않는 게시글입니다.");
                    navigate(-1);
                }
            })
            .catch(err => {
                console.error("Band detail fetch error:", err);
            });

    }, [bandNo, navigate]);

    // D-Day 계산 함수
    const getDday = (dateString) => {
        const today = new Date();
        const dday = new Date(dateString);
        const timeGap = dday.getTime() - today.getTime();
        const dayGap = Math.ceil(timeGap / (1000 * 60 * 60 * 24));

        if (dayGap < 0) return "마감";
        if (dayGap === 0) return "D-Day";
        return `D-${dayGap}`;
    };

    const handleChat = () => {
        if (!myUserId) return alert("로그인이 필요합니다.");
        navigate(`/message/${band.USERID}`); 
    };

    // 이미지 넘기기 핸들러
    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % bandImages.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + bandImages.length) % bandImages.length);
    };

    // 모집 상태 변경
    const handleStatusToggle = () => {
        const newStatus = band.STATUS === 'Y' ? 'S' : 'Y';
        
        fetch(`http://localhost:3010/band/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bandNo: band.BANDNO, status: newStatus })
        })
        .then(res => res.json())
        .then(data => {
            if(data.result === "success") {
                setBand(prev => ({ ...prev, STATUS: newStatus }));
            } else {
                alert("상태 변경 실패");
            }
        })
        .catch(err => console.error(err));
    };

    // 글 삭제
    const handleDelete = () => {
        if(window.confirm("정말로 이 모집글을 삭제하시겠습니까?")) {
            fetch(`http://localhost:3010/band/${band.BANDNO}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if(data.result === "success") {
                    alert("삭제되었습니다.");
                    navigate("/band");
                } else {
                    alert("삭제 실패");
                }
            })
            .catch(err => console.error(err));
        }
    };

    if (!band) return <Box sx={{ p: 3, textAlign: 'center' }}>로딩중...</Box>;

    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, mx: 'auto', minHeight: '100vh', backgroundColor: '#fff', pb: 10, position: 'relative' }}>
            
            {/* 1. 상단 헤더 (공유 버튼 제거됨) */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, p: 2, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                <IconButton 
                    onClick={() => navigate(-1)} 
                    sx={{ backgroundColor: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'white' } }}
                >
                    <ArrowBackIosNewIcon sx={{ color: '#333' }} />
                </IconButton>
                {/* 공유 버튼 제거됨 */}
            </Box>

            {/* 2. 이미지 슬라이드 영역 (이미지 없음 예외처리 추가) */}
            <Box sx={{ position: 'relative', width: '100%', height: '350px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {bandImages.length > 0 ? (
                    <>
                        <img 
                            src={bandImages[currentImageIndex].IMGPATH} 
                            alt="밴드 이미지"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none'; // 이미지 숨기기
                                // 부모 요소에 fallback UI를 표시하도록 할 수도 있지만,
                                // 여기서는 간단히 숨기고 아래 fallback 로직이 보이게 하려면 구조 변경이 필요함.
                                // 대신 기본 이미지로 교체
                                e.target.src = "https://via.placeholder.com/600x400?text=No+Image";
                                e.target.style.display = 'block';
                            }}
                        />
                        {bandImages.length > 1 && (
                            <>
                                <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 10, backgroundColor: 'rgba(255,255,255,0.5)', '&:hover': { backgroundColor: 'white' } }}>
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </IconButton>
                                <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 10, backgroundColor: 'rgba(255,255,255,0.5)', '&:hover': { backgroundColor: 'white' } }}>
                                    <ArrowForwardIosIcon fontSize="small" />
                                </IconButton>
                                <Box sx={{ position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', px: 1.5, py: 0.5, borderRadius: 10, fontSize: '0.8rem' }}>
                                    {currentImageIndex + 1} / {bandImages.length}
                                </Box>
                            </>
                        )}
                    </>
                ) : (
                    // 이미지가 없을 때 보여줄 UI
                    <Box sx={{ 
                        height: '100%', width: '100%',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#9e9e9e'
                    }}>
                        <MusicNoteIcon sx={{ fontSize: 60, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body1" fontWeight="bold">이미지 없음</Typography>
                    </Box>
                )}
                
                {/* 모집 완료 오버레이 */}
                {band.STATUS === 'S' && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="white">모집 완료</Typography>
                    </Box>
                )}
            </Box>

            {/* 3. 작성자 정보 (리더 텍스트, 점세개 아이콘 제거됨) */}
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar src={band.USER_PROFILE} sx={{ width: 48, height: 48 }} />
                    <Box flexGrow={1}>
                        <Typography variant="subtitle1" fontWeight="bold" 
                            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => navigate("/personalFeed", { state: { targetUserId: band.USERID, targetNickname: band.NICKNAME } })}
                        >
                            {band.NICKNAME}
                        </Typography>
                        {/* 리더 텍스트 제거됨 */}
                    </Box>
                    {/* 점 세개 아이콘 제거됨 */}
                </Stack>
                
                <Divider />

                {/* 4. 모집 상세 내용 */}
                <Box sx={{ mt: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip 
                            icon={<MusicNoteIcon />} 
                            label={band.INST} 
                            sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }} 
                        />
                        <Chip 
                            icon={<CalendarMonthIcon />} 
                            label={`${getDday(band.EDATE)} (${band.EDATE})`} 
                            sx={{ backgroundColor: '#ffebee', color: '#d32f2f', fontWeight: 'bold' }} 
                        />
                    </Stack>

                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {band.TITLE}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 4 }}>
                        {new Date(band.CDATE).toLocaleDateString()} 작성
                    </Typography>

                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', minHeight: '150px', lineHeight: 1.7 }}>
                        {band.CONTENT}
                    </Typography>
                </Box>
            </Box>

            {/* 5. 하단 고정 바 */}
            <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, display: 'flex', justifyContent: 'center', zIndex: 100, backgroundColor: 'white' }} >
                <Box sx={{ width: { xs: '100%', md: '80%' }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">모집 분야</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">{band.INST}</Typography>
                    </Box>

                    {/* 버튼 영역 */}
                    {band.USERID === myUserId ? (
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant="contained" onClick={handleStatusToggle}
                                color={band.STATUS === 'Y' ? "success" : "warning"}
                                startIcon={<CheckCircleIcon />}
                                sx={{ fontWeight: 'bold', borderRadius: 2 }}
                            >
                                {band.STATUS === 'Y' ? '마감하기' : '모집재개'}
                            </Button>
                            <Button 
                                variant="outlined" color="error" onClick={handleDelete}
                                startIcon={<DeleteIcon />}
                                sx={{ fontWeight: 'bold', borderRadius: 2 }}
                            >
                                삭제
                            </Button>
                        </Stack>
                    ) : (
                        <Button 
                            variant="contained" 
                            onClick={handleChat}
                            disabled={band.STATUS === 'S'}
                            startIcon={<SendIcon />}
                            sx={{ 
                                background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', 
                                fontWeight: 'bold', borderRadius: 2, px: 4, py: 1,
                                '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' }
                            }}
                        >
                            {band.STATUS === 'S' ? '모집 마감' : '지원하기'}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default BandDetail;