import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, TextField, InputAdornment, Card, CardContent, Grid, Chip, IconButton, Button
} from "@mui/material";

// 아이콘
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function EnsembleRoom() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [rooms, setRooms] = useState([]); 
    
    // 지도 관련 State
    const [map, setMap] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [kakaoLoaded, setKakaoLoaded] = useState(false); // [추가] SDK 로딩 상태

    // 화면에 보여줄 아이템 개수 관리 (초기 6개)
    const [visibleCount, setVisibleCount] = useState(6);

    // 0. [추가] 카카오맵 SDK 로딩 대기
    useEffect(() => {
        const interval = setInterval(() => {
            if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                setKakaoLoaded(true);
                clearInterval(interval);
            }
        }, 100); // 0.1초마다 체크

        return () => clearInterval(interval);
    }, []);

    // 1. 합주실 데이터 불러오기 및 좌표 변환 (SDK 로드 후 실행)
    useEffect(() => {
        if (!kakaoLoaded) return; // 로딩 전이면 중단

        const fetchRooms = async () => {
            try {
                const response = await fetch("http://localhost:3010/ensemble/list");
                const data = await response.json();
                
                if (data.result === "success") {
                    const roomList = data.list;
                    const geocoder = new window.kakao.maps.services.Geocoder();
                    
                    // 각 합주실의 주소를 좌표로 변환
                    const updatedRooms = await Promise.all(roomList.map(async (room) => {
                        return new Promise((resolve) => {
                            geocoder.addressSearch(room.ADDR, (result, status) => {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    resolve({ ...room, lat: result[0].y, lng: result[0].x });
                                } else {
                                    resolve({ ...room, lat: null, lng: null });
                                }
                            });
                        });
                    }));
                    setRooms(updatedRooms);
                }
            } catch (error) {
                console.error("Ensemble list fetch error:", error);
            }
        };

        fetchRooms();
    }, [kakaoLoaded]); // kakaoLoaded가 true가 되면 실행

    // 검색 필터링
    const filteredRooms = rooms.filter(room => 
        room.NAME.toLowerCase().includes(searchTerm.toLowerCase()) || 
        room.ADDR.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. 지도 생성 및 마커 표시
    useEffect(() => {
        if (!kakaoLoaded) return;

        const container = document.getElementById('map');
        if (!container) return;

        // 지도 생성
        const options = {
            center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
            level: 7
        };
        const kakaoMap = new window.kakao.maps.Map(container, options);
        setMap(kakaoMap);

        // 마커 생성 (필터링된 목록 기준)
        filteredRooms.forEach((room) => {
            if (room.lat && room.lng) {
                const markerPosition = new window.kakao.maps.LatLng(room.lat, room.lng);
                
                const marker = new window.kakao.maps.Marker({
                    position: markerPosition,
                    map: kakaoMap,
                    clickable: true
                });

                // 마커 클릭 이벤트
                window.kakao.maps.event.addListener(marker, 'click', function() {
                    kakaoMap.panTo(markerPosition);
                    setSelectedRoom(room);
                });
            }
        });
    }, [kakaoLoaded, rooms, searchTerm]); // 데이터나 검색어 변경 시 재실행

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

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
                    placeholder="지역명 또는 합주실 이름으로 검색" 
                    size="small"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedRoom(null);
                        setVisibleCount(6);
                    }}
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

            {/* 2. 지도 영역 */}
            <Box sx={{ width: '100%', height: '400px', mb: 3, position: 'relative', backgroundColor: '#e0e0e0' }}>
                <div id="map" style={{ width: "100%", height: "100%" }}></div>

                {/* 선택된 합주실 정보창 */}
                {selectedRoom && (
                    <Box sx={{ 
                        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                        width: '90%', maxWidth: '400px',
                        backgroundColor: 'white', borderRadius: 2, boxShadow: 3, p: 2, zIndex: 10 
                    }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold">{selectedRoom.NAME}</Typography>
                            <IconButton size="small" onClick={() => setSelectedRoom(null)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>{selectedRoom.ADDR}</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{selectedRoom.PHONE || "전화번호 없음"}</Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* 3. 합주실 리스트 */}
            <Box sx={{ px: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    등록된 합주실 ({filteredRooms.length})
                </Typography>
                
                <Grid container spacing={2}>
                    {filteredRooms.length > 0 ? (
                        filteredRooms.slice(0, visibleCount).map((room) => (
                            <Grid item xs={12} sm={6} md={4} key={room.ENSEMBLENO}>
                                <Card 
                                    sx={{ 
                                        borderRadius: 3, 
                                        boxShadow: 'none', 
                                        border: '1px solid #eee', 
                                        cursor: 'pointer',
                                        transition: '0.2s',
                                        borderColor: selectedRoom?.ENSEMBLENO === room.ENSEMBLENO ? '#1976d2' : '#eee',
                                        borderWidth: selectedRoom?.ENSEMBLENO === room.ENSEMBLENO ? '2px' : '1px',
                                        '&:hover': { boxShadow: 3 }
                                    }}
                                    onClick={() => {
                                        setSelectedRoom(room);
                                        if (map && room.lat && room.lng) {
                                            const moveLatLon = new window.kakao.maps.LatLng(room.lat, room.lng);
                                            map.panTo(moveLatLon);
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {room.NAME}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <StarIcon sx={{ fontSize: 16, color: '#e0e0e0', mr: 0.5 }} />
                                                <Typography variant="body2" fontWeight="bold" color="text.secondary">-</Typography>
                                            </Box>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {room.ADDR}
                                            </Typography>
                                        </Box>
    
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Chip 
                                                label="전화문의" 
                                                size="small" 
                                                sx={{ backgroundColor: '#f5f5f5', color: '#666', fontWeight: 'bold' }} 
                                            />
                                            <Box display="flex" alignItems="center">
                                                 <PhoneIcon fontSize="inherit" sx={{ mr: 0.5, color: '#666', fontSize: '0.8rem' }} />
                                                 <Typography variant="caption" color="text.secondary">{room.PHONE}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
                            <Typography color="text.secondary">검색 결과가 없습니다.</Typography>
                        </Box>
                    )}
                </Grid>

                {filteredRooms.length > visibleCount && (
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
                onClick={() => navigate("/ensemble/add")}
            >
                <AddIcon />
            </Fab>

        </Box>
    );
}

export default EnsembleRoom;