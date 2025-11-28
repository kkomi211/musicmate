import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

function IdPwdSearch() {
    const navigate = useNavigate();
    // --- 아이디 찾기 상태 ---
    const [findIdName, setFindIdName] = useState("");
    const [findIdPhone, setFindIdPhone] = useState("");
    const [foundId, setFoundId] = useState(""); // 찾은 아이디 저장

    // --- 비밀번호 찾기 상태 ---
    const [findPwdId, setFindPwdId] = useState("");
    const [findPwdName, setFindPwdName] = useState("");
    const [findPwdPhone, setFindPwdPhone] = useState("");
    const [isUserVerified, setIsUserVerified] = useState(false); // 비밀번호 찾기 시 유저 인증 완료 플래그
    const [newPwd, setNewPwd] = useState(""); // 새 비밀번호 입력
    const [newPwdError, setNewPwdError] = useState(""); // [추가] 새 비밀번호 오류 메시지 상태

    // --- 모달 상태 ---
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [isPwdResetMode, setIsPwdResetMode] = useState(false); // 비밀번호 재설정 완료 모드 플래그

    // [추가] 비밀번호 유효성 검사 로직
    const validatePassword = (pwd) => {
        // 6자 이상만 허용
        const minLengthRegex = /^(?=.{6,}).*$/; 
        
        if (!minLengthRegex.test(pwd)) {
            setNewPwdError("비밀번호는 6자 이상이어야 합니다.");
            return false;
        }
        setNewPwdError("");
        return true;
    };

    // 아이디 찾기 핸들러
    const handleFindId = () => {
        if (!findIdName || !findIdPhone) return alert("이름과 전화번호를 입력해주세요.");
        
        // [API 호출]
        fetch("http://localhost:3010/user/findId", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: findIdName, phone: findIdPhone })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success" && data.userId) {
                setFoundId(data.userId);
                setResultMessage(`회원님의 아이디는 [${data.userId}] 입니다.`);
            } else {
                setFoundId("");
                setResultMessage("일치하는 회원 정보가 없습니다.");
            }
            setIsPwdResetMode(false); 
            setResultModalOpen(true);
        })
        .catch(err => alert("서버 오류가 발생했습니다."));
    };

    // 비밀번호 찾기 (1단계: 유저 확인) 핸들러
    const handleFindPwd = () => {
        if (!findPwdId || !findPwdName || !findPwdPhone) return alert("정보를 모두 입력해주세요.");

        // [API 호출]
        fetch("http://localhost:3010/user/verifyUserForPwdReset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: findPwdId, name: findPwdName, phone: findPwdPhone })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                setIsUserVerified(true);
                setNewPwd(""); // 새 비밀번호 입력란 초기화
                setNewPwdError("");
                alert("본인 확인이 완료되었습니다. 새로운 비밀번호를 설정해주세요.");
            } else {
                alert("일치하는 회원 정보가 없습니다.");
            }
        })
        .catch(err => alert("서버 오류가 발생했습니다."));
    };
    
    // 비밀번호 찾기 (2단계: 비밀번호 재설정) 핸들러
    const handleResetPassword = () => {
        if (!validatePassword(newPwd)) return; // 유효성 검사

        // [API 호출]
        fetch("http://localhost:3010/user/resetPassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: findPwdId, newPwd: newPwd })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                setResultMessage(data.msg || "비밀번호 재설정이 완료되었습니다.");
                setIsPwdResetMode(true); // 비밀번호 재설정 완료 모드
                setResultModalOpen(true);
                setIsUserVerified(false); // 상태 초기화

            } else {
                alert("비밀번호 재설정에 실패했습니다: " + (data.msg || "오류"));
            }
        })
        .catch(err => alert("서버 오류가 발생했습니다."));
    };


    return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
            <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={4} 
                justifyContent="center"
                alignItems="stretch"
            >
                {/* 왼쪽: 아이디 찾기 섹션 */}
                <Paper elevation={3} sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 2 }}>
                    <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
                        아이디 찾기
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                        가입 시 등록한 이름과 전화번호를 입력해주세요.
                    </Typography>
                    
                    <TextField 
                        label="이름" 
                        variant="outlined" 
                        fullWidth 
                        value={findIdName}
                        onChange={(e) => setFindIdName(e.target.value)}
                    />
                    <TextField 
                        label="전화번호" 
                        variant="outlined" 
                        fullWidth 
                        placeholder="-자 없이 입력해주세요"
                        value={findIdPhone}
                        onChange={(e) => setFindIdPhone(e.target.value)}
                    />
                    
                    <Box sx={{ mt: 'auto', pt: 3 }}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            onClick={handleFindId}
                            sx={{ 
                                height: 50,
                                background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' }
                            }}
                        >
                            아이디 찾기
                        </Button>
                    </Box>
                </Paper>

                {/* 오른쪽: 비밀번호 찾기 섹션 */}
                <Paper elevation={3} sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 2 }}>
                    <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
                        비밀번호 찾기
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                        {isUserVerified ? "새로운 비밀번호를 입력해주세요." : "가입 시 등록한 정보를 입력해주세요."}
                    </Typography>

                    {!isUserVerified ? (
                        <>
                            <TextField 
                                label="아이디" 
                                variant="outlined" 
                                fullWidth 
                                value={findPwdId}
                                onChange={(e) => setFindPwdId(e.target.value)}
                            />
                            <TextField 
                                label="이름" 
                                variant="outlined" 
                                fullWidth 
                                value={findPwdName}
                                onChange={(e) => setFindPwdName(e.target.value)}
                            />
                            <TextField 
                                label="전화번호" 
                                variant="outlined" 
                                fullWidth 
                                placeholder="-자 없이 입력해주세요"
                                value={findPwdPhone}
                                onChange={(e) => setFindPwdPhone(e.target.value)}
                            />
                        </>
                    ) : (
                        <TextField 
                            label="새 비밀번호" 
                            variant="outlined" 
                            fullWidth 
                            type="password"
                            value={newPwd}
                            onChange={(e) => {
                                setNewPwd(e.target.value);
                                validatePassword(e.target.value); // 실시간 검사
                            }}
                            error={!!newPwdError}
                            helperText={newPwdError}
                        />
                    )}

                    <Box sx={{ mt: 'auto', pt: 3 }}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            // [수정] 유효성 검사 오류가 있으면 버튼 비활성화
                            disabled={isUserVerified && !!newPwdError}
                            onClick={isUserVerified ? handleResetPassword : handleFindPwd}
                            sx={{ 
                                height: 50,
                                background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' }
                            }}
                        >
                            {isUserVerified ? "비밀번호 재설정" : "본인 확인"}
                        </Button>
                    </Box>
                </Paper>
            </Stack>
            
            {/* 결과 모달 */}
            <Dialog open={resultModalOpen} onClose={() => setResultModalOpen(false)}>
                <DialogTitle>
                    {isPwdResetMode ? "재설정 완료" : "아이디 찾기 결과"}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {resultMessage}
                    </Typography>
                    {foundId && (
                        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                            {foundId}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setResultModalOpen(false);
                            // 아이디 찾기 성공했거나 비밀번호 재설정 성공 메시지일 때 로그인 페이지로 이동
                            if (foundId || isPwdResetMode) { 
                                navigate("/login"); 
                            }
                        }}
                        color="primary"
                    >
                        확인
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}

export default IdPwdSearch;