import React, { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography, Badge } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom'; // [수정] useLocation 추가

// 아이콘
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import HomeIcon from '@mui/icons-material/Home'; 
import NotificationsIcon from '@mui/icons-material/Notifications';

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

function FeedHeader() {
    const navigate = useNavigate();
    const location = useLocation(); // [추가] 현재 경로 감지용 훅

    // 내 정보 State
    const [myUserId, setMyUserId] = useState("");
    const [myNickname, setMyNickname] = useState("");
    
    // 안 읽은 알림 상태
    const [hasUnreadAlert, setHasUnreadAlert] = useState(false);

    // [수정] location이 변경될 때마다(페이지 이동 시) 실행되도록 수정
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                setMyUserId(decoded.userId);
                setMyNickname(decoded.nickname || decoded.userId);
                
                // 로그인 되어있으면 안 읽은 알림 체크
                checkUnreadAlerts(decoded.userId);
            }
        }
    }, [location]); // [중요] location이 바뀔 때마다 이 useEffect가 실행됨

    // 안 읽은 알림 확인 함수
    const checkUnreadAlerts = (userId) => {
        fetch(`http://localhost:3010/alert/unread/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    // 현재 페이지가 알림 페이지(/alert)라면 
                    // 알림을 다 읽은 것으로 간주하여 배지를 숨김 (선택 사항)
                    if (location.pathname === '/alert') {
                        setHasUnreadAlert(false);
                    } else {
                        setHasUnreadAlert(data.hasUnread);
                    }
                }
            })
            .catch(err => console.error("알림 체크 실패:", err));
    };

    // 공통 버튼 스타일 정의
    const gradientButtonStyle = {
        borderRadius: '20px', 
        background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', 
        color: 'white',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px 1px rgba(255, 105, 135, .3)', 
        textTransform: 'none', 
        border: 'none',
        '&:hover': {
            background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)',
            boxShadow: '0 4px 6px 2px rgba(255, 105, 135, .4)',
        },
    };

    // 공통: 흰색 배경에 테두리 있는 버튼 스타일 (상단 우측용)
    const outlinedButtonStyle = {
        ...gradientButtonStyle,
        fontSize: '0.75rem',
        px: 2,
        background: 'white',
        color: '#d32f2f',
        border: '1px solid #ff8a65',
        boxShadow: 'none',
        '&:hover': {
            backgroundColor: '#fff5f5',
            border: '1px solid #d32f2f',
        }
    };

    const handleGoToMyFeed = () => {
        if (!myUserId) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        navigate("/personalFeed", { state: { targetUserId: myUserId, targetNickname: myNickname } });
    };

    return (
        <Box
            sx={{
                width: '100%',
                padding: 2,
                borderBottom: '1px solid #eee',
                backgroundColor: '#fff',
                boxShadow: 1,
            }}
        >
            {/* 1. 상단: 로고(중앙) & 버튼(오른쪽) 배치 */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2
                }}
            >
                {/* 왼쪽: 내 피드 버튼 */}
                <Box sx={{ width: '25%', textAlign: 'left' }}>
                    {myUserId && (
                        <Button
                            size="small"
                            startIcon={<HomeIcon />}
                            onClick={handleGoToMyFeed}
                            sx={{
                                color: '#d32f2f',
                                border: '1px solid #ff8a65',
                                borderRadius: '20px',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: '#fff5f5',
                                    border: '1px solid #d32f2f',
                                }
                            }}
                        >
                            내 피드
                        </Button>
                    )}
                </Box> 
                
                {/* 중앙 로고 */}
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 900,
                        letterSpacing: 1,
                        background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        flexGrow: 1, 
                        textAlign: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={() => { navigate("/feed") }}
                >
                    MUSICMATE
                </Typography>
                
                {/* 오른쪽 상단 버튼 그룹 (알림, 마이페이지, 메시지) */}
                <Stack 
                    direction={'row'} 
                    spacing={1} 
                    sx={{ 
                        width: 'auto', 
                        minWidth: '25%',
                        justifyContent: 'flex-end'
                    }}
                >
                    {/* 알림 버튼 (Badge 적용) */}
                    <Button 
                        size="small" 
                        startIcon={
                            <Badge 
                                color="error" 
                                variant="dot" 
                                invisible={!hasUnreadAlert}
                                sx={{ 
                                    '& .MuiBadge-badge': { 
                                        right: 2, 
                                        top: 2,
                                        border: '1px solid white' 
                                    } 
                                }}
                            >
                                <NotificationsIcon />
                            </Badge>
                        } 
                        sx={outlinedButtonStyle}
                        onClick={()=>{ navigate("/alert") }} // 경로 수정됨 (/notification -> /alert)
                    >
                        알림
                    </Button>

                    <Button 
                        size="small" 
                        startIcon={<PersonIcon />} 
                        sx={outlinedButtonStyle}
                        onClick={()=>{navigate("/mypage")}}
                    >
                        마이페이지
                    </Button>

                    <Button 
                        size="small" 
                        startIcon={<SendIcon />} 
                        sx={outlinedButtonStyle}
                        onClick={()=>{navigate("/message")}}
                    >
                        메시지
                    </Button>
                </Stack>
            </Box>

            {/* 2. 이미지 영역 */}
            <div style={{ textAlign: "center", display: 'flex', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                <img 
                    src="https://previews.123rf.com/images/cookelma/cookelma1211/cookelma121100123/16547638-band-performs-on-stage-rock-music.jpg"
                    style={{ width: "33.3%", height: "300px", objectFit: 'cover' }}
                    alt="band1"
                />
                <img 
                    src="https://previews.123rf.com/images/cookelma/cookelma1307/cookelma130700024/20670612-band-performs-on-stage-rock-music.jpg"
                    style={{ width: "33.3%", height: "300px", objectFit: 'cover' }}
                    alt="band2"
                />
                <img 
                    src="https://d3qdz57zgika7q.cloudfront.net/im/n/61311/photoPosting/2020/02/14/m/1581616223861_3.jpg"
                    style={{ width: "33.4%", height: "300px", objectFit: 'cover' }}
                    alt="band3"
                />
            </div>

            {/* 3. 하단 메뉴 버튼 (5개) */}
            <Stack 
                direction={'row'} 
                spacing={1} 
                sx={{ 
                    width: '100%', 
                    overflowX: 'auto', 
                    pb: 1 
                }}
            >
                <Button sx={{ ...gradientButtonStyle, flexGrow: 1, minWidth: 'fit-content' }} onClick={()=>{navigate("/feed")}}>피드</Button>
                <Button sx={{ ...gradientButtonStyle, flexGrow: 1, minWidth: 'fit-content' }} onClick={()=>{navigate("/ensembleRoom")}}>합주실 찾기</Button>
                <Button sx={{ ...gradientButtonStyle, flexGrow: 1, minWidth: 'fit-content' }} onClick={()=>{navigate("/deal")}}>악기/악보 거래</Button>
                <Button sx={{ ...gradientButtonStyle, flexGrow: 1, minWidth: 'fit-content' }} onClick={()=>{navigate("/band")}}>밴드 모집</Button>
                <Button sx={{ ...gradientButtonStyle, flexGrow: 1, minWidth: 'fit-content' }} onClick={()=>{navigate("/event")}}>이벤트 공지</Button>
            </Stack>
        </Box>
    );
}

export default FeedHeader;