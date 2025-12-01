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
import PersonalEdit from './components/PersonalEdit';
import Mypage from './components/Mypage';
import Bookmark from './components/Bookmark'; // 컴포넌트 임포트로 수정
import MypageSidebar from './components/MypageSidebar'; // 사이드바 임포트 추가
import Message from './components/Message';
import MessageList from './components/MessageList';
import Deal from './components/Deal';
import DealAdd from './components/DealAdd';
import DealDetail from './components/DealDetail';
import Band from './components/Band';
import BandAdd from './components/BandAdd';
import BandDetail from './components/BandDetail';
import Event from './components/Event';
import EventAdd from './components/EventAdd';
import EventDetail from './components/EventDetail';
import EnsembleRoom from './components/EnsembleRoom';
import EnsembleAdd from './components/EnsembleAdd';
import Search from './components/Search';
import Alert from './components/Alert';

function App() {
  const location = useLocation();

  // 인증 페이지 확인
  const isAuthPage = ['/', '/login', '/join', '/findId'].includes(location.pathname);
  
  // 사이드바가 필요한 페이지 확인
  const isSidebarPage = ['/mypage', '/bookmark'].includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}> 
      <CssBaseline />

      {/* 헤더 */}
      {isAuthPage && <AuthHeader />}
      {!isAuthPage && <FeedHeader />}

      {/* 메인 콘텐츠 영역 */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          p: 3, 
          background: 'linear-gradient(45deg, #f0582aff 20%, #f7b7a3ff 90%)',
          // 사이드바가 있는 페이지면 가로 정렬(row), 아니면 세로 정렬(column)처럼 동작(block)
          display: isSidebarPage ? 'flex' : 'block',
          alignItems: 'flex-start',
          gap: 3 // 사이드바와 본문 사이 간격
        }}
      >
        {/* 사이드바 (조건부 렌더링) */}
        {isSidebarPage && <MypageSidebar />}

        {/* 라우터 렌더링 영역 */}
        <Box sx={{ flexGrow: 1, width: isSidebarPage ? 'calc(100% - 240px)' : '100%' }}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/join" element={<Join />} />
              <Route path="/findId" element={<IdPwdSearch />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/feedAdd" element={<FeedAdd />} />
              <Route path="/personalFeed" element={<PersonalFeed />} />
              <Route path="/personalEdit" element={<PersonalEdit />} />
              <Route path="/mypage" element={<Mypage />} />
              <Route path="/bookmark" element={<Bookmark />} />
              <Route path="/message/:userId" element={<Message />} />
              <Route path="/message" element={<MessageList />} />
              <Route path="/deal" element={<Deal />} />
              <Route path="/deal/add" element={<DealAdd />} />
              <Route path="/deal/detail/:sellNo" element={<DealDetail />} />
              <Route path="/band" element={<Band />} />
              <Route path="/band/add" element={<BandAdd />} />
              <Route path="/band/detail/:bandNo" element={<BandDetail />} />
              <Route path="/event" element={<Event />} />
              <Route path="/eventAdd" element={<EventAdd />} />
              <Route path="/event/detail/:eventNo" element={<EventDetail />} />
              <Route path="/ensembleRoom" element={<EnsembleRoom />} />
              <Route path="/ensemble/add" element={<EnsembleAdd />} />    
              <Route path="/search" element={<Search />} />    
              <Route path="/alert" element={<Alert />} />    
            </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;