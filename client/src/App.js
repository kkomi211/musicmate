import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/Login';
import AuthHeader from './components/AuthHeader';
import Join from './components/Join';
import IdPwdSearch from './components/IdPwdSearch';
import Feed from './components/Feed';
import FeedHeader from './components/FeedHeader';
import FeedAdd from './components/FeedAdd';
import PersonalFeed from './components/PersonalFeed';

function App() {
  const location = useLocation();

  // 인증 페이지 확인
  const isAuthPage = location.pathname === '/login' || location.pathname === '/join' || location.pathname === '/findId';
  
  // 피드 페이지 확인
  const isFeedPage = location.pathname === '/feed' || location.pathname === '/feedAdd' || location.pathname === '/personalFeed';

  return (
    // flexDirection: 'column'을 추가하여 헤더와 본문을 수직으로 배치
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}> 
      <CssBaseline />

      {/* 헤더들은 이제 fixed가 아니므로 자연스럽게 상단에 위치합니다 */}
      {isAuthPage && <AuthHeader />}
      {isFeedPage && <FeedHeader />}

      {/* 메인 콘텐츠 영역 */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          p: 3, // 기본 패딩만 유지
          background: 'linear-gradient(45deg, #f0582aff 20%, #f7b7a3ff 90%)'
          // paddingTop 계산 로직 제거됨
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/findId" element={<IdPwdSearch />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/feedAdd" element={<FeedAdd />} />
          <Route path="/personalFeed" element={<PersonalFeed />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;