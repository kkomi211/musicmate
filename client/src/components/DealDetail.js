import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Box, Typography, Avatar, Button, IconButton, Divider, Chip, Stack, Paper
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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

function DealDetail() {
    const navigate = useNavigate();
    const { sellNo } = useParams(); 

    const [deal, setDeal] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [myUserId, setMyUserId] = useState("");

    // 이미지 슬라이드 관련 State
    const [dealImages, setDealImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 초기 데이터 로딩
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) setMyUserId(decoded.userId);
        }

        // 서버 API 호출
        fetch(`http://localhost:3010/deal/detail/${sellNo}`)
            .then(res => res.json())
            .then(data => {
                if (data.result === "success" && data.info) {
                    setDeal(data.info);
                    
                    // 이미지 리스트 설정
                    if (data.images && data.images.length > 0) {
                        setDealImages(data.images);
                    } else {
                        setDealImages([]); 
                    }
                } else {
                    alert("존재하지 않는 게시글입니다.");
                    navigate(-1);
                }
            })
            .catch(err => {
                console.error("Deal detail fetch error:", err);
            });

    }, [sellNo, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    const handleChat = () => {
        if (!myUserId) return alert("로그인이 필요합니다.");
        // 채팅방 생성 또는 이동 로직
        navigate(`/message/${deal.USERID}`); 
    };

    // 이미지 넘기기 핸들러
    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % dealImages.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + dealImages.length) % dealImages.length);
    };

    // 판매 상태 변경 핸들러
    const handleStatusToggle = () => {
        const newStatus = deal.STATUS === 'Y' ? 'N' : 'Y';
        const confirmMsg = newStatus === 'N' ? "판매 완료 상태로 변경하시겠습니까?" : "판매 중 상태로 변경하시겠습니까?";
        
        if(window.confirm(confirmMsg)) {
            fetch(`http://localhost:3010/deal/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellNo: deal.SELLNO, status: newStatus })
            })
            .then(res => res.json())
            .then(data => {
                if(data.result === "success") {
                    setDeal(prev => ({ ...prev, STATUS: newStatus }));
                } else {
                    alert("상태 변경 실패");
                }
            })
            .catch(err => console.error(err));
        }
    };

    // 게시글 삭제 핸들러
    const handleDelete = () => {
        if(window.confirm("정말로 이 판매글을 삭제하시겠습니까?")) {
            fetch(`http://localhost:3010/deal/${deal.SELLNO}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if(data.result === "success") {
                    alert("삭제되었습니다.");
                    navigate("/deal");
                } else {
                    alert("삭제 실패");
                }
            })
            .catch(err => console.error(err));
        }
    };

    if (!deal) return <Box sx={{ p: 3, textAlign: 'center' }}>로딩중...</Box>;

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

            {/* 2. 상품 이미지 슬라이드 영역 */}
            <Box sx={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                
                {dealImages.length > 0 ? (
                    <>
                        {/* 현재 이미지 표시 */}
                        <img 
                            src={dealImages[currentImageIndex].IMGPATH} 
                            alt={`상품 이미지 ${currentImageIndex + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            // [수정] 이미지 로딩 실패 시 UI 처리
                            onError={(e) => {
                                e.target.style.display = 'none'; 
                            }}
                        />

                        {/* 왼쪽 화살표 (이미지가 2장 이상일 때만 표시) */}
                        {dealImages.length > 1 && (
                            <IconButton 
                                onClick={handlePrevImage}
                                sx={{ 
                                    position: 'absolute', left: 10, zIndex: 5, 
                                    backgroundColor: 'rgba(255,255,255,0.5)', 
                                    '&:hover': { backgroundColor: 'white' } 
                                }}
                            >
                                <ArrowBackIosNewIcon fontSize="small" />
                            </IconButton>
                        )}

                        {/* 오른쪽 화살표 (이미지가 2장 이상일 때만 표시) */}
                        {dealImages.length > 1 && (
                            <IconButton 
                                onClick={handleNextImage}
                                sx={{ 
                                    position: 'absolute', right: 10, zIndex: 5, 
                                    backgroundColor: 'rgba(255,255,255,0.5)', 
                                    '&:hover': { backgroundColor: 'white' } 
                                }}
                            >
                                <ArrowForwardIosIcon fontSize="small" />
                            </IconButton>
                        )}

                        {/* 페이지 표시 (예: 1/3) */}
                        {dealImages.length > 1 && (
                            <Box sx={{ 
                                position: 'absolute', bottom: 15, right: 15, 
                                backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', 
                                px: 1.5, py: 0.5, borderRadius: 10, fontSize: '0.8rem' 
                            }}>
                                {currentImageIndex + 1} / {dealImages.length}
                            </Box>
                        )}
                    </>
                ) : (
                    /* [수정] 이미지가 아예 없을 경우 보여줄 예쁜 박스 UI */
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

                {/* 판매 완료 오버레이 */}
                {deal.STATUS === 'N' && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '400px', bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9 }}>
                        <Typography variant="h4" fontWeight="bold" color="white">판매 완료</Typography>
                    </Box>
                )}
            </Box>

            {/* 3. 판매자 정보 */}
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar src={deal.USER_PROFILE} sx={{ width: 48, height: 48 }} />
                    <Box flexGrow={1}>
                        {/* [수정] 닉네임 클릭 시 해당 유저의 개인 피드로 이동 */}
                        <Typography 
                            variant="subtitle1" 
                            fontWeight="bold"
                            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => {
                                navigate("/personalFeed", { 
                                    state: { 
                                        targetUserId: deal.USERID, 
                                        targetNickname: deal.NICKNAME || deal.USERID 
                                    } 
                                });
                            }}
                        >
                            {deal.NICKNAME || deal.USERID}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            서울시 마포구
                        </Typography>
                    </Box>
                    {/* 내 글이 아닐 때만 옵션 버튼 */}
                    {deal.USERID === myUserId && (
                        <IconButton>
                            <MoreVertIcon />
                        </IconButton>
                    )}
                </Stack>
                
                <Divider />

                {/* 4. 상품 내용 */}
                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                            label={deal.PRODUCT === 'I' ? "악기" : deal.PRODUCT === 'S' ? "악보" : "기타"} 
                            size="small" 
                            sx={{ mr: 1, backgroundColor: '#ffebee', color: '#d32f2f', fontWeight: 'bold' }} 
                        />
                    </Box>
                    
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {deal.TITLE}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                        {/* 조회수 제거 */}
                        {new Date(deal.CDATE).toLocaleDateString()}
                    </Typography>

                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', minHeight: '100px' }}>
                        {deal.CONTENT}
                    </Typography>
                </Box>
            </Box>

            {/* 5. 하단 고정 바 (하트/가격제안불가 텍스트 제거) */}
            <Paper elevation={3} 
                sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, display: 'flex', justifyContent: 'center', zIndex: 100, backgroundColor: 'white' }}
            >
                <Box sx={{ width: { xs: '100%', md: '80%' }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* 하트 아이콘 제거됨 */}
                        <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
                                {formatPrice(deal.PRICE)}
                            </Typography>
                            {/* 가격 제안 불가 텍스트 제거됨 */}
                        </Box>
                    </Box>

                    {/* 내 글이면 '판매완료/판매중', '삭제' 버튼 노출 */}
                    {deal.USERID === myUserId ? (
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant="contained" 
                                onClick={handleStatusToggle}
                                color={deal.STATUS === 'Y' ? "success" : "warning"} 
                                startIcon={<CheckCircleIcon />}
                                sx={{ 
                                    fontWeight: 'bold', borderRadius: 2, px: 2, py: 1, boxShadow: 'none'
                                }}
                            >
                                {deal.STATUS === 'Y' ? '판매완료' : '판매중'}
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="error"
                                onClick={handleDelete}
                                startIcon={<DeleteIcon />}
                                sx={{ 
                                    fontWeight: 'bold', borderRadius: 2, px: 2, py: 1
                                }}
                            >
                                삭제
                            </Button>
                        </Stack>
                    ) : (
                        <Button 
                            variant="contained" 
                            onClick={handleChat}
                            disabled={deal.STATUS === 'N'}
                            startIcon={<SendIcon />}
                            sx={{ 
                                background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', 
                                fontWeight: 'bold',
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' }
                            }}
                        >
                            {deal.STATUS === 'N' ? '거래완료' : '채팅하기'}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default DealDetail;