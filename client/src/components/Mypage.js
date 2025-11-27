import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableRow, Paper, Stack
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

// JWT 디코딩 헬퍼 함수
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

function Mypage() {
    const navigate = useNavigate();
    
    // 내 정보 State (휴대폰 번호, 프로필 이미지 제거)
    const [myInfo, setMyInfo] = useState({ 
        userId: "", nickname: "", instrument: ""
    });

    // 1. 데이터 로딩
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        const decoded = decodeToken(token);
        if (!decoded || !decoded.userId) {
            alert("유효하지 않은 토큰입니다.");
            navigate("/login");
            return;
        }
        
        const currentUserId = decoded.userId;

        // 내 프로필 정보 가져오기
        fetch(`http://localhost:3010/feed/personal/${currentUserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.result === "success" && data.list.length > 0) {
                    const stats = data.list[0];
                    setMyInfo({
                        userId: stats.USERID,
                        nickname: stats.NICKNAME,
                        instrument: stats.INSTRUMENT || "",
                    });
                }
            })
            .catch(err => console.error("My Info Error:", err));
    }, [navigate]);

    // --- 핸들러 함수들 ---

    // 로그아웃 핸들러
    const handleLogout = () => {
        if(window.confirm("로그아웃 하시겠습니까?")) {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    return (
        <Box sx={{ width:'80%', minHeight: '100vh', backgroundColor: 'white', pb: 10, mx: 'auto' }}>
            {/* 1. 상단 헤더 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>내 정보</Typography>
            </Box>

            {/* 2. 내 정보 섹션 */}
            <Box sx={{ px: 4, mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* 정보 테이블 */}
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2, mb: 3, width: '100%' }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '30%', bgcolor: '#f9f9f9' }}>아이디</TableCell>
                                <TableCell>{myInfo.userId}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', bgcolor: '#f9f9f9' }}>비밀번호</TableCell>
                                <TableCell>********</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', bgcolor: '#f9f9f9' }}>닉네임</TableCell>
                                <TableCell>
                                    {myInfo.nickname}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', bgcolor: '#f9f9f9' }}>사용 악기</TableCell>
                                <TableCell>
                                    {myInfo.instrument || "정보 없음"}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* 버튼 영역: 로그아웃 */}
                <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleLogout}
                        sx={{
                            height: 50,
                            borderRadius: 3,
                            background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                            textTransform: 'none'
                        }}
                    >
                        로그아웃
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default Mypage;