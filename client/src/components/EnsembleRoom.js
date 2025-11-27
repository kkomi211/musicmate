import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, TextField, InputAdornment, Card, CardContent, Grid, Chip
} from "@mui/material";

// 아이콘
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';

function EnsembleRoom() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    // 테스트용 더미 데이터 (추후 서버 연동 시 삭제)
    const mockRooms = [
        { id: 1, name: "홍대 잼 합주실", addr: "서울 마포구 서교동", price: "15,000원", rating: 4.8 },
        { id: 2, name: "강남 비트 스튜디오", addr: "서울 강남구 역삼동", price: "20,000원", rating: 4.5 },
        { id: 3, name: "사당 뮤직 벙커", addr: "서울 동작구 사당동", price: "12,000원", rating: 4.2 },
    ];

    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, minHeight: '100vh', pb: 10, backgroundColor: '#fff', mx: 'auto' }}>
            
            {/* 1. 상단 헤더 & 검색 */}
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon color="primary" /> 합주실 찾기
                </Typography>
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="지역명 또는 합주실 이름으로 검색해보세요" 
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

            {/* 2. 지도 영역 (박스) */}
            <Box 
                sx={{ 
                    width: '100%', 
                    height: '400px', 
                    backgroundColor: '#e0e0e0', // 지도 배경색 (API 연동 전 플레이스홀더)
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 3,
                    position: 'relative'
                }}
            >
                <MapIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 1 }} />
                <Typography color="text.secondary" fontWeight="bold">지도 API 영역</Typography>
                <Typography variant="caption" color="text.secondary">
                    (카카오맵 / 네이버 지도 연동 필요)
                </Typography>

                {/* 지도 위에 띄울 현재 위치 버튼 예시 */}
                <Box sx={{ position: 'absolute', bottom: 20, right: 20, bgcolor: 'white', p: 1, borderRadius: '50%', boxShadow: 2, cursor: 'pointer' }}>
                    <LocationOnIcon color="primary" />
                </Box>
            </Box>

            {/* 3. 추천/검색된 합주실 리스트 */}
            <Box sx={{ px: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    주변 합주실
                </Typography>
                
                <Grid container spacing={2}>
                    {mockRooms.map((room) => (
                        <Grid item xs={12} sm={6} md={4} key={room.id}>
                            <Card 
                                sx={{ 
                                    borderRadius: 3, 
                                    boxShadow: 'none', 
                                    border: '1px solid #eee', 
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 3 }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {room.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <StarIcon sx={{ fontSize: 16, color: '#ffb400', mr: 0.5 }} />
                                            <Typography variant="body2" fontWeight="bold">{room.rating}</Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {room.addr}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Chip 
                                            label={`시간당 ${room.price}`} 
                                            size="small" 
                                            sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }} 
                                        />
                                        <Typography variant="caption" color="text.secondary">상세보기 &gt;</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* 4. 합주실 등록 버튼 (오른쪽 아래 고정) */}
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
                // 합주실 등록 페이지로 이동 (라우터 설정 필요)
                onClick={() => navigate("/ensemble/add")}
            >
                <AddIcon />
            </Fab>

        </Box>
    );
}

export default EnsembleRoom;