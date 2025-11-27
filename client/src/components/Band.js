import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, Card, CardContent, CardMedia, Grid, 
    Chip, TextField, InputAdornment, Button, Stack, Divider
} from "@mui/material";

// 아이콘
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group'; 
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; 
import MusicNoteIcon from '@mui/icons-material/MusicNote'; 
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; 
import PersonIcon from '@mui/icons-material/Person'; // [추가] 내 글 보기 아이콘

// JWT 디코딩
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

function Band() {
    const navigate = useNavigate();
    
    // --- State 관리 ---
    const [bandList, setBandList] = useState([]);
    const [filteredList, setFilteredList] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveOnly, setShowActiveOnly] = useState(false); 
    
    // [추가] 내 글 보기 필터링용 State
    const [userId, setUserId] = useState("");
    const [showMyBands, setShowMyBands] = useState(false);

    // [추가] 화면에 보여줄 아이템 개수 관리 (초기 6개)
    const [visibleCount, setVisibleCount] = useState(6);

    // --- 초기 데이터 로딩 ---
    useEffect(() => {
        // 1. 토큰에서 내 ID 가져오기
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) setUserId(decoded.userId);
        }

        // 2. 서버 API 연동
        fetch("http://localhost:3010/band/list")
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    setBandList(data.list);
                    setFilteredList(data.list);
                }
            })
            .catch(err => console.error("Band list fetch error:", err));
    }, []);

    // --- 필터링 로직 ---
    useEffect(() => {
        let result = bandList;

        // 1. 검색어 필터 (제목, 악기)
        if (searchTerm !== "") {
            result = result.filter(item => 
                item.TITLE.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.INST.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. 모집중만 보기 필터
        if (showActiveOnly) {
            result = result.filter(item => item.STATUS === 'Y');
        }

        // 3. [추가] 내 글 보기 필터
        if (showMyBands) {
            if (userId) {
                result = result.filter(item => item.USERID === userId);
            } else {
                setShowMyBands(false);
                alert("로그인이 필요한 기능입니다.");
            }
        }

        setFilteredList(result);
        
        // 필터 조건이 바뀌면 보여줄 개수 초기화
        setVisibleCount(6);

    }, [searchTerm, showActiveOnly, showMyBands, bandList, userId]);

    // --- D-Day 계산 함수 ---
    const getDday = (dateString) => {
        const today = new Date();
        const dday = new Date(dateString);
        const timeGap = dday.getTime() - today.getTime();
        const dayGap = Math.ceil(timeGap / (1000 * 60 * 60 * 24));

        if (dayGap < 0) return "마감";
        if (dayGap === 0) return "D-Day";
        return `D-${dayGap}`;
    };

    // [추가] 더보기 버튼 핸들러
    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6); 
    };

    // [추가] 내 글 보기 토글 핸들러
    const toggleMyBands = () => {
        if (!userId) {
            alert("로그인 후 이용해주세요.");
            navigate("/login");
            return;
        }
        setShowMyBands(!showMyBands);
    };

    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, minHeight: '100vh', pb: 10, backgroundColor: '#fff', mx: 'auto' }}>
            
            {/* 1. 상단 헤더 & 검색 */}
            <Box sx={{ p: 3, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="primary" /> 밴드 모집
                    </Typography>
                    
                    <Stack direction="row" spacing={1}>
                        {/* [추가] 내 글 보기 버튼 */}
                        <Button
                            variant={showMyBands ? "contained" : "outlined"}
                            onClick={toggleMyBands}
                            startIcon={<PersonIcon />}
                            sx={{
                                borderRadius: 20,
                                borderColor: '#d32f2f',
                                color: showMyBands ? 'white' : '#d32f2f',
                                background: showMyBands ? 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)' : 'transparent',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                '&:hover': {
                                    borderColor: '#b71c1c',
                                    backgroundColor: showMyBands ? undefined : '#ffebee'
                                }
                            }}
                        >
                            {showMyBands ? "전체 보기" : "내 글 보기"}
                        </Button>

                        {/* 모집중만 보기 버튼 */}
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
                            {showActiveOnly ? "모집중만 보기" : "전체 보기"}
                        </Button>
                    </Stack>
                </Box>

                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="밴드명, 악기, 지역 등으로 검색해보세요" 
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

            {/* 2. 모집글 리스트 (그리드) */}
            <Box sx={{ px: 2, mt: 2 }}>
                <Grid container spacing={2}>
                    {filteredList.length > 0 ? (
                        // visibleCount만큼 잘라서 보여줌
                        filteredList.slice(0, visibleCount).map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.BANDNO}>
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
                                    onClick={() => navigate(`/band/detail/${item.BANDNO}`)} 
                                >
                                    {/* 마감된 글 오버레이 */}
                                    {item.STATUS === 'S' && (
                                        <Box sx={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10,
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            borderRadius: 3
                                        }}>
                                            <Typography variant="h5" color="white" fontWeight="bold">모집 완료</Typography>
                                        </Box>
                                    )}

                                    {/* 밴드 이미지 (서버 컬럼명: IMGPATH) */}
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={item.IMGPATH || "https://via.placeholder.com/300x200?text=Band"}
                                        alt={item.TITLE}
                                        sx={{ objectFit: 'cover', backgroundColor: '#f9f9f9' }}
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x200?text=Band";
                                        }}
                                    />
                                    
                                    <CardContent sx={{ p: 2 }}>
                                        {/* 태그 영역 (모집분야, D-Day) */}
                                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                            <Chip 
                                                label={item.INST} 
                                                size="small" 
                                                icon={<MusicNoteIcon style={{fontSize: 16}}/>}
                                                sx={{ 
                                                    backgroundColor: '#e3f2fd', color: '#1976d2', 
                                                    fontWeight: 'bold', fontSize: '0.75rem' 
                                                }} 
                                            />
                                            <Chip 
                                                label={getDday(item.EDATE)} 
                                                size="small" 
                                                icon={<CalendarMonthIcon style={{fontSize: 16}}/>}
                                                sx={{ 
                                                    backgroundColor: '#ffebee', color: '#d32f2f', 
                                                    fontWeight: 'bold', fontSize: '0.75rem' 
                                                }} 
                                            />
                                        </Stack>

                                        {/* 제목 */}
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.3, mb: 1, height: '2.6em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {item.TITLE}
                                        </Typography>
                                        
                                        <Divider sx={{ my: 1.5 }} />

                                        {/* 작성자 정보 */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.NICKNAME}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                마감: {new Date(item.EDATE).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Box sx={{ width: '100%', textAlign: 'center', mt: 8 }}>
                            <Typography color="text.secondary">
                                {showMyBands ? "작성한 모집글이 없습니다." : "모집 중인 밴드가 없습니다. 🎸"}
                            </Typography>
                        </Box>
                    )}
                </Grid>

                {/* 더보기 버튼 (보여줄 아이템이 남았을 때만 표시) */}
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

            {/* 4. 글쓰기 플로팅 버튼 */}
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
                onClick={() => { navigate("/band/add") }}
            >
                <AddIcon />
            </Fab>

        </Box>
    );
}

export default Band;