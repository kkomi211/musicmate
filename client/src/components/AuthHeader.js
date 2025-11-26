import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AuthHeader() {
  const navigate = useNavigate();
  return (
    // Box 컴포넌트를 사용하여 헤더 영역을 설정
    <Box
      sx={{
        width: '100%',
        padding: 2,
        textAlign: 'center',
        borderBottom: '1px solid #eee', // 하단에 얇은 구분선
        backgroundColor: '#fff', // 배경색 흰색
        position: 'fixed', // 상단에 고정
        top: 0,
        zIndex: 1000,
      }}
    >
      <a href="javascript:;" style={{textDecoration : 'none'}} onClick={()=>{navigate("/login")}}>
        <Typography
          variant="h4" // 제목 크기
          sx={{
            fontWeight: 900, // 글씨 굵게
            letterSpacing: 1, // 글자 간격
            // 텍스트에 빨간색 그라데이션 적용을 위한 CSS
            // -webkit-background-clip: text;와 -webkit-text-fill-color: transparent;를 사용합니다.
            background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          MUSICMATE
        </Typography>
      </a>
    </Box>
  );
}

export default AuthHeader;