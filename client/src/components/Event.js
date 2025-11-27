import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, Card, CardContent, Grid, 
    Chip, TextField, InputAdornment, Button, Stack
} from "@mui/material";

// 아이콘
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CampaignIcon from '@mui/icons-material/Campaign'; 
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable'; 
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PersonIcon from '@mui/icons-material/Person'; // [추가] 내 글 보기 아이콘

// [추가] JWT 디코딩 헬퍼
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

function Event() {
    const navigate = useNavigate();
    
    // --- State 관리 ---
    const [eventList, setEventList] = useState([]);
    const [filteredList, setFilteredList] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveOnly, setShowActiveOnly] = useState(false); 
    const [visibleCount, setVisibleCount] = useState(6); 

    // [추가] 내 글 보기 필터링용 State
    const [userId, setUserId] = useState("");
    const [showMyEvents, setShowMyEvents] = useState(false);

    // --- 초기 데이터 로딩 ---
    useEffect(() => {
        // 1. 토큰에서 내 ID 가져오기
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) setUserId(decoded.userId);
        }

        // 2. 서버 API 호출
        fetch("http://localhost:3010/event/list")
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    setEventList(data.list);
                    setFilteredList(data.list);
                }
            })
            .catch(err => console.error("Event list fetch error:", err));
    }, []);

    // --- 이벤트 상태 판별 함수 ---
    const getEventStatus = (edate) => {
        const today = new Date();
        const endDate = new Date(edate);
        today.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);

        if (today > endDate) return "END"; 
        return "ING"; 
    };

    // --- 필터링 로직 ---
    useEffect(() => {
        let result = eventList;

        // 1. 검색어 필터
        if (searchTerm !== "") {
            result = result.filter(item => 
                item.TITLE.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.CONTENT.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. 진행중만 보기 필터
        if (showActiveOnly) {
            result = result.filter(item => getEventStatus(item.EDATE) === "ING");
        }

        // 3. [추가] 내 글 보기 필터
        if (showMyEvents) {
            if (userId) {
                result = result.filter(item => item.USERID === userId);
            } else {
                setShowMyEvents(false);
                alert("로그인이 필요한 기능입니다.");
            }
        }

        setFilteredList(result);
        setVisibleCount(6); 

    }, [searchTerm, showActiveOnly, showMyEvents, eventList, userId]);

    // 더보기 버튼
    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    // [추가] 내 글 보기 토글 핸들러
    const toggleMyEvents = () => {
        if (!userId) {
            alert("로그인 후 이용해주세요.");
            navigate("/login");
            return;
        }
        setShowMyEvents(!showMyEvents);
    };

    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, minHeight: '100vh', pb: 10, backgroundColor: '#fff', mx: 'auto' }}>
            
            {/* 1. 상단 헤더 & 검색 */}
            <Box sx={{ p: 3, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CampaignIcon color="error" /> 이벤트 & 공지
                    </Typography>
                    
                    <Stack direction="row" spacing={1}>
                        {/* [추가] 내 글 보기 버튼 */}
                        <Button
                            variant={showMyEvents ? "contained" : "outlined"}
                            onClick={toggleMyEvents}
                            startIcon={<PersonIcon />}
                            sx={{
                                borderRadius: 20,
                                borderColor: '#d32f2f',
                                color: showMyEvents ? 'white' : '#d32f2f',
                                background: showMyEvents ? 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)' : 'transparent',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                '&:hover': {
                                    borderColor: '#b71c1c',
                                    backgroundColor: showMyEvents ? undefined : '#ffebee'
                                }
                            }}
                        >
                            {showMyEvents ? "전체 보기" : "내 글 보기"}
                        </Button>

                        {/* 진행중만 보기 버튼 */}
                        <Button
                            variant={showActiveOnly ? "contained" : "outlined"}
                            onClick={() => setShowActiveOnly(!showActiveOnly)}
                            sx={{
                                borderRadius: 20,
                                borderColor: '#d32f2f',
                                color: showActiveOnly ? 'white' : '#d32f2f',
                                background: showActiveOnly ? 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)' : 'transparent',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                '&:hover': {
                                    borderColor: '#b71c1c',
                                    backgroundColor: showActiveOnly ? undefined : '#ffebee'
                                }
                            }}
                        >
                            {showActiveOnly ? "진행중만 보기" : "전체 보기"}
                        </Button>
                    </Stack>
                </Box>

                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="관심 있는 이벤트를 검색해보세요" 
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 5, backgroundColor: '#f5f5f5', border: 'none' }
                    }}
                />
            </Box>

            {/* 2. 이벤트 리스트 (그리드) */}
            <Box sx={{ px: 2, mt: 2 }}>
                <Grid container spacing={3}>
                    {filteredList.length > 0 ? (
                        filteredList.slice(0, visibleCount).map((item) => {
                            const status = getEventStatus(item.EDATE);
                            const sdateStr = new Date(item.SDATE).toLocaleDateString();
                            const edateStr = new Date(item.EDATE).toLocaleDateString();

                            return (
                                <Grid item xs={12} sm={6} key={item.EVENTNO}>
                                    <Card 
                                        sx={{ 
                                            borderRadius: 3, 
                                            boxShadow: 'none', 
                                            border: '1px solid #eee',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            transition: '0.3s',
                                            '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' }
                                        }}
                                        onClick={() => navigate(`/event/detail/${item.EVENTNO}`)} 
                                    >
                                        {/* 종료된 이벤트 오버레이 */}
                                        {status === 'END' && (
                                            <Box sx={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10,
                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                borderRadius: 3
                                            }}>
                                                <Typography variant="h5" color="white" fontWeight="bold">종료된 이벤트</Typography>
                                            </Box>
                                        )}

                                        <CardContent sx={{ p: 2.5 }}>
                                            {/* 상태 & 날짜 칩 */}
                                            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                                <Chip 
                                                    label={status === 'ING' ? "진행중" : "종료"} 
                                                    size="small" 
                                                    icon={<EventAvailableIcon style={{fontSize: 16}}/>}
                                                    color={status === 'ING' ? "primary" : "default"}
                                                    sx={{ 
                                                        fontWeight: 'bold', fontSize: '0.75rem',
                                                        backgroundColor: status === 'ING' ? '#e3f2fd' : '#eee',
                                                        color: status === 'ING' ? '#1976d2' : '#666'
                                                    }} 
                                                />
                                                <Chip 
                                                    label={`${sdateStr} ~ ${edateStr}`}
                                                    size="small" 
                                                    icon={<CalendarMonthIcon style={{fontSize: 16}}/>}
                                                    sx={{ 
                                                        backgroundColor: '#fff', border: '1px solid #eee',
                                                        fontWeight: 'medium', fontSize: '0.75rem' 
                                                    }} 
                                                />
                                            </Stack>

                                            {/* 제목 */}
                                            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.3, mb: 1 }}>
                                                {item.TITLE}
                                            </Typography>
                                            
                                            {/* 간단 내용 */}
                                            <Typography variant="body2" color="text.secondary" sx={{ 
                                                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                minHeight: '60px'
                                            }}>
                                                {item.CONTENT}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })
                    ) : (
                        <Box sx={{ width: '100%', textAlign: 'center', mt: 8 }}>
                            <Typography color="text.secondary">
                                {showMyEvents ? "작성한 이벤트가 없습니다." : "등록된 이벤트가 없습니다. 🎉"}
                            </Typography>
                        </Box>
                    )}
                </Grid>

                {/* 더보기 버튼 */}
                {filteredList.length > visibleCount && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button 
                            variant="contained" 
                            onClick={handleLoadMore}
                            sx={{ 
                                minWidth: 56, height: 56, borderRadius: '50%', 
                                background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', 
                                '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' }, 
                                padding: 0, boxShadow: 3
                            }}
                        >
                            <ArrowDownwardIcon />
                        </Button>
                    </Box>
                )}
            </Box>

            {/* 4. 글쓰기 버튼 */}
            <Fab 
                color="primary" 
                aria-label="add" 
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                    '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' },
                    zIndex: 1100,
                }}
                 onClick={() => { navigate("/eventAdd") }} 
            >
                <AddIcon />
            </Fab>

        </Box>
    );
}

export default Event;