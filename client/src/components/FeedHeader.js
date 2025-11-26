import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function FeedHeader() {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                width: '100%',
                padding: 2,
                borderBottom: '1px solid #eee',
                backgroundColor: '#fff',
                // position: 'fixed', // 제거: 화면에 고정하지 않음 -> 스크롤 시 올라감
                boxShadow: 1,
            }}
        >
            {/* 1. 상단: 로고(중앙) & 버튼(오른쪽) 배치 */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1
                }}
            >
                <Box sx={{ width: '33%', textAlign: 'left' }}></Box> 
                
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
                
                <Stack 
                    direction={'row'} 
                    spacing={1} 
                    sx={{ 
                        width: '33%', 
                        justifyContent: 'flex-end'
                    }}
                >
                    <Button size="small">마이페이지</Button>
                    <Button size="small">DM</Button>
                </Stack>
            </Box>

            {/* 이미지 영역: 사용자 요청 코드 반영 (이미지 3개) */}
            <div style={{ textAlign: "center", display: 'flex', width: '100%' }}>
                <img 
                    src="https://previews.123rf.com/images/cookelma/cookelma1211/cookelma121100123/16547638-band-performs-on-stage-rock-music.jpg"
                    style={{ width: "33.3%", height: "412px", objectFit: 'cover' }}
                    alt="band1"
                />
                <img 
                    src="https://previews.123rf.com/images/cookelma/cookelma1307/cookelma130700024/20670612-band-performs-on-stage-rock-music.jpg"
                    style={{ width: "33.3%", height: "412px", objectFit: 'cover' }}
                    alt="band2"
                />
                <img 
                    src="https://d3qdz57zgika7q.cloudfront.net/im/n/61311/photoPosting/2020/02/14/m/1581616223861_3.jpg"
                    style={{ width: "33.4%", height: "412px", objectFit: 'cover' }} // 마지막 이미지는 너비 보정을 위해 33.4%
                    alt="band3"
                />
            </div>

            {/* 2. 하단: 5개 버튼 균등 배치 */}
            <Stack 
                direction={'row'} 
                spacing={0.5}
                sx={{ width: '100%' }}
            >
                <Button sx={{ flexGrow: 1, minWidth: 0 }}>피드</Button>
                <Button sx={{ flexGrow: 1, minWidth: 0 }}>합주실 찾기</Button>
                <Button sx={{ flexGrow: 1, minWidth: 0 }}>악기/악보 거래</Button>
                <Button sx={{ flexGrow: 1, minWidth: 0 }}>밴드 모집</Button>
                <Button sx={{ flexGrow: 1, minWidth: 0 }}>이벤트 공지</Button>
            </Stack>
        </Box>
    );
}

export default FeedHeader;