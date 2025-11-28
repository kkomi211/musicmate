import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableRow, Paper, Stack,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    Divider
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import LockOpenIcon from '@mui/icons-material/LockOpen';

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
    
    // 내 정보 State
    const [myInfo, setMyInfo] = useState({ 
        userId: "", nickname: "", instrument: ""
    });
    
    // 비밀번호 변경 모달 State
    const [changePwdModalOpen, setChangePwdModalOpen] = useState(false);
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [newPwdConfirm, setNewPwdConfirm] = useState("");
    const [pwdError, setPwdError] = useState(""); // [수정] 정의된 상태 사용

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

    // 비밀번호 유효성 검사 (새 비밀번호 필드에서만 6자 검사)
    const validatePassword = (pwd, confirmPwd) => {
        // 새 비밀번호 길이 검사
        if (pwd && pwd.length < 6) {
            setPwdError("새 비밀번호는 6자 이상이어야 합니다.");
            return false;
        }
        // 새 비밀번호와 확인 비밀번호 일치 검사는 버튼에서 진행
        setPwdError("");
        return true;
    };
    
    // 비밀번호 변경 저장 핸들러
    const handleChangePassword = () => {
        // 최종 유효성 검사
        if (newPwd.length < 6) {
             setPwdError("새 비밀번호는 6자 이상이어야 합니다.");
             return;
        }
        if (newPwd !== newPwdConfirm) {
            setPwdError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }
        if (!currentPwd) {
            setPwdError("현재 비밀번호를 입력해주세요.");
            return;
        }
        setPwdError(""); // 에러 메시지 초기화 (유효성 통과)


        fetch("http://localhost:3010/user/changePassword", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: myInfo.userId,
                currentPwd: currentPwd,
                newPwd: newPwd
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                alert("비밀번호가 성공적으로 변경되었습니다.");
                setChangePwdModalOpen(false); 
                // 필드 초기화
                setCurrentPwd("");
                setNewPwd("");
                setNewPwdConfirm("");
            } else {
                alert("비밀번호 변경 실패: " + (data.msg || "현재 비밀번호 불일치"));
            }
        })
        .catch(err => console.error("Password change error:", err));
    };
    
    // 모달 닫기 시 필드 초기화
    const handleCloseModal = () => {
        setChangePwdModalOpen(false);
        setCurrentPwd("");
        setNewPwd("");
        setNewPwdConfirm("");
        setPwdError("");
    };

    return (
        <Box sx={{ width:'80%', minHeight: '100vh', backgroundColor: 'white', pb: 10, mx: 'auto' }}>
            {/* 1. 상단 헤더 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIosNewIcon sx={{ color: '#333' }} />
                </IconButton>
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
                                <TableCell sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    ********
                                    <Button 
                                        size="small" 
                                        onClick={() => {
                                            setChangePwdModalOpen(true);
                                            setPwdError("");
                                        }}
                                        startIcon={<LockOpenIcon />}
                                        sx={{ 
                                            color: '#d32f2f', 
                                            textTransform: 'none', 
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap',
                                            '&:hover': { backgroundColor: '#ffebee' }
                                        }}
                                    >
                                        변경
                                    </Button>
                                </TableCell>
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

            {/* --- 비밀번호 변경 모달 --- */}
            <Dialog open={changePwdModalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                    비밀번호 변경
                    <IconButton onClick={handleCloseModal}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        <TextField
                            label="현재 비밀번호"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={currentPwd}
                            onChange={(e) => setCurrentPwd(e.target.value)}
                        />
                        <Divider />
                        <TextField
                            label="새 비밀번호 (6자 이상)"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={newPwd}
                            onChange={(e) => {
                                setNewPwd(e.target.value);
                                // 새 비밀번호 입력 시 에러 메시지 초기화 (일치 여부는 확인에서)
                                validatePassword(e.target.value, newPwdConfirm);
                            }}
                            error={newPwd.length > 0 && newPwd.length < 6}
                            helperText={newPwd.length > 0 && newPwd.length < 6 ? "새 비밀번호는 6자 이상이어야 합니다." : ""}
                        />
                         <TextField
                            label="새 비밀번호 확인"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={newPwdConfirm}
                            onChange={(e) => {
                                setNewPwdConfirm(e.target.value);
                                // 확인 입력 시 일치 여부 검사
                                validatePassword(newPwd, e.target.value);
                            }}
                            error={newPwd && newPwd !== newPwdConfirm}
                            helperText={newPwd && newPwd !== newPwdConfirm ? "비밀번호가 일치하지 않습니다." : ""}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>취소</Button>
                    <Button 
                        onClick={handleChangePassword} 
                        color="primary" 
                        variant="contained"
                        // [수정] 최종 비활성화 조건
                        disabled={!currentPwd || !newPwd || newPwd !== newPwdConfirm || newPwd.length < 6}
                        sx={{ fontWeight: 'bold' }}
                    >
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Mypage;