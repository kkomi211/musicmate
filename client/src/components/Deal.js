import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, Card, CardContent, CardMedia, Grid, 
    Chip, Tabs, Tab, TextField, InputAdornment, Button
} from "@mui/material";

// 아이콘
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PianoIcon from '@mui/icons-material/Piano';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import GridViewIcon from '@mui/icons-material/GridView';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person'; 
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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

function Deal() {
    const navigate = useNavigate();
    
    // --- State 관리 ---
    const [dealList, setDealList] = useState([]);
    const [filteredList, setFilteredList] = useState([]); 
    const [tabValue, setTabValue] = useState('ALL'); 
    const [searchTerm, setSearchTerm] = useState("");
    
    // 필터링용 State
    const [userId, setUserId] = useState("");
    const [showMyDeals, setShowMyDeals] = useState(false);
    const [showActiveOnly, setShowActiveOnly] = useState(false); // [추가] 판매중만 보기 필터

    // 화면에 보여줄 아이템 개수 관리 (초기 8개)
    const [visibleCount, setVisibleCount] = useState(8);

    // --- 초기 데이터 로딩 ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) setUserId(decoded.userId);
        }

        fetch(`http://localhost:3010/deal/list?type=${tabValue}`)
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    setDealList(data.list);
                    // 초기에는 필터링 없이 전체 리스트 세팅 (useEffect 의존성에 의해 자동 필터링됨)
                }
            })
            .catch(err => console.error("Deal list fetch error:", err));
    }, [tabValue]);

    // --- 리스트 필터링 ---
    useEffect(() => {
        let result = dealList;

        // 1. 검색어 필터
        if (searchTerm !== "") {
            result = result.filter(item => 
                item.TITLE.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. 내 글 보기 필터
        if (showMyDeals) {
            if (userId) {
                result = result.filter(item => item.USERID === userId);
            } else {
                setShowMyDeals(false);
                alert("로그인이 필요한 기능입니다.");
            }
        }

        // 3. [추가] 판매중만 보기 필터
        if (showActiveOnly) {
            result = result.filter(item => item.STATUS === 'Y');
        }

        setFilteredList(result);
        
        // 필터 조건이 바뀌면 보여줄 개수 초기화
        setVisibleCount(8);

    }, [searchTerm, showMyDeals, showActiveOnly, dealList, userId, tabValue]);

    // --- 핸들러 ---
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    const handleCardClick = (sellNo) => {
        navigate(`/deal/detail/${sellNo}`);
    };

    const toggleMyDeals = () => {
        if (!userId) {
            alert("로그인 후 이용해주세요.");
            navigate("/login");
            return;
        }
        setShowMyDeals(!showMyDeals);
    };

    // 더보기 버튼 핸들러
    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 8); 
    };

    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, minHeight: '100vh', pb: 10, backgroundColor: '#fff', mx: 'auto' }}>
            
            {/* 1. 상단 헤더 및 검색 */}
            <Box sx={{ p: 3, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                        중고 장터
                    </Typography>
                    
                    <Box>
                        {/* [추가] 판매중만 보기 버튼 */}
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
                                mr: 1, // 버튼 간격
                                '&:hover': {
                                    borderColor: '#b71c1c',
                                    backgroundColor: showActiveOnly ? undefined : '#ffebee'
                                }
                            }}
                        >
                            {!showActiveOnly ? "판매중만 보기" : "전체 보기"}
                        </Button>

                        {/* 내 글 보기 버튼 */}
                        <Button
                            variant={showMyDeals ? "contained" : "outlined"}
                            startIcon={<PersonIcon />}
                            onClick={toggleMyDeals}
                            sx={{
                                borderRadius: 20,
                                borderColor: '#d32f2f',
                                color: showMyDeals ? 'white' : '#d32f2f',
                                background: showMyDeals ? 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)' : 'transparent',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#b71c1c',
                                    backgroundColor: showMyDeals ? undefined : '#ffebee'
                                }
                            }}
                        >
                            {showMyDeals ? "전체 보기" : "내 글 보기"}
                        </Button>
                    </Box>
                </Box>

                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="어떤 악기를 찾으시나요?" 
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

            {/* 2. 카테고리 탭 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    textColor="inherit"
                    IndicatorProps={{ sx: { backgroundColor: '#d32f2f' } }}
                >
                    <Tab icon={<GridViewIcon />} label="전체" value="ALL" />
                    <Tab icon={<PianoIcon />} label="악기" value="I" />
                    <Tab icon={<LibraryMusicIcon />} label="악보" value="S" />
                </Tabs>
            </Box>

            {/* 3. 상품 리스트 (그리드) */}
            <Box sx={{ px: 2 }}>
                <Grid container spacing={2}>
                    {filteredList.length > 0 ? (
                        filteredList.slice(0, visibleCount).map((item) => (
                            <Grid item xs={6} sm={4} md={3} key={item.SELLNO}>
                                <Card 
                                    sx={{ 
                                        borderRadius: 3, 
                                        boxShadow: 'none', 
                                        border: '1px solid #eee',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        '&:hover': { boxShadow: 3 }
                                    }}
                                    onClick={() => handleCardClick(item.SELLNO)}
                                >
                                    {/* 판매 완료 시 오버레이 */}
                                    {item.STATUS === 'N' && (
                                        <Box sx={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '160px', 
                                            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10,
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            borderTopLeftRadius: 12, borderTopRightRadius: 12
                                        }}>
                                            <Typography variant="h6" color="white" fontWeight="bold">판매완료</Typography>
                                        </Box>
                                    )}

                                    {/* 이미지 처리 로직 */}
                                    {item.IMGPATH ? (
                                        <CardMedia
                                            component="img"
                                            height="160"
                                            image={item.IMGPATH}
                                            alt={item.TITLE}
                                            sx={{ objectFit: 'cover', backgroundColor: '#f9f9f9' }}
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                                            }}
                                        />
                                    ) : (
                                        <Box sx={{ 
                                            height: 160, 
                                            backgroundColor: '#f5f5f5', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: '#9e9e9e'
                                        }}>
                                            <MusicNoteIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                                            <Typography variant="caption" fontWeight="bold">이미지 없음</Typography>
                                        </Box>
                                    )}
                                    
                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                            {item.TITLE}
                                        </Typography>
                                        
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            {new Date(item.CDATE).toLocaleDateString()}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#d32f2f' }}>
                                                {formatPrice(item.PRICE)}
                                            </Typography>
                                            <Chip 
                                                label={item.PRODUCT === 'I' ? "악기" : item.PRODUCT === 'S' ? "악보" : "기타"} 
                                                size="small" 
                                                sx={{ fontSize: '0.7rem', height: 20, backgroundColor: '#ffebee', color: '#d32f2f' }} 
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
                            <Typography color="text.secondary">
                                {showMyDeals 
                                    ? "작성한 판매글이 없습니다." 
                                    : showActiveOnly 
                                        ? "판매 중인 상품이 없습니다."
                                        : "등록된 상품이 없습니다."
                                }
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
                onClick={() => { navigate("/deal/add") }}
            >
                <AddIcon />
            </Fab>

        </Box>
    );
}

export default Deal;    