import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// 아이콘
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';

function FeedHeader() {
    const navigate = useNavigate();

    // 공통 버튼 스타일 정의
    const gradientButtonStyle = {
        borderRadius: '20px', // 둥글게
        background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', // 그라데이션
        color: 'white',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px 1px rgba(255, 105, 135, .3)', // 그림자 효과
        textTransform: 'none', // 대문자 자동 변환 방지
        border: 'none',
        '&:hover': {
            background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)',
            boxShadow: '0 4px 6px 2px rgba(255, 105, 135, .4)',
        },
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
                    mb: 2 // 이미지와의 간격 조금 더 띄움
                }}
            >
                {/* 왼쪽 여백용 Box */}
                <Box sx={{ width: '30%', textAlign: 'left' }}></Box> 
                
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
                
                {/* 오른쪽 상단 버튼 그룹 */}
                <Stack 
                    direction={'row'} 
                    spacing={1} 
                    sx={{ 
                        width: '30%', 
                        justifyContent: 'flex-end'
                    }}
                >
                    <Button 
                        size="small" 
                        startIcon={<PersonIcon />} 
                        sx={{ 
                            ...gradientButtonStyle, 
                            fontSize: '0.75rem', 
                            px: 2, // 좌우 패딩
                            background: 'white', // 상단 버튼은 배경 흰색 + 글씨 그라데이션 효과로 차별화
                            color: '#d32f2f',
                            border: '1px solid #ff8a65',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#fff5f5',
                                border: '1px solid #d32f2f',
                            }
                        }}
                        onClick={()=>{navigate("/mypage")}}
                    >
                        마이페이지
                    </Button>
                    <Button 
                        size="small" 
                        startIcon={<SendIcon />}
                        sx={{ 
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
                        }}
                        // [수정] 메시지 목록 페이지로 이동
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
                spacing={1} // 버튼 사이 간격
                sx={{ 
                    width: '100%', 
                    overflowX: 'auto', // 화면 작아지면 스크롤
                    pb: 1 // 하단 여백
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