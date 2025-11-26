import { TextField, Box, Button, Typography, Container, Stack } from "@mui/material";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    let idRef = useRef();
    let pwdRef = useRef();
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4,
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: 'white', // 배경색은 흰색으로 유지
                }}
            >
                <Typography component="h1" variant="h5" gutterBottom>
                    로그인
                </Typography>

                <Stack spacing={2} sx={{ width: '100%', mt: 3 }}>
                    <TextField
                        required
                        fullWidth
                        id="user-id"
                        label="아이디"
                        variant="outlined"
                        autoComplete="username"
                        color="error"
                        inputRef={idRef}
                    />
                    <TextField
                        required
                        fullWidth
                        id="password"
                        label="비밀번호"
                        type="password"
                        variant="outlined"
                        autoComplete="current-password"
                        color="error"
                        inputRef={pwdRef}
                    />

                    {/* 1. 로그인 버튼과 아이디/비번 찾기 버튼을 수평으로 감싸는 Stack 추가 */}
                    <Stack direction="row" spacing={1} sx={{ mt: 3, mb: 1, width: '100%' }}>

                        {/* 로그인 버튼 (공간을 1/2로 차지) */}
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                flexGrow: 1, // 공간을 남은 공간을 균등하게 차지하도록 설정
                                // 로그인 버튼에만 빨간색 그라데이션 적용
                                background: '#f8d4d4ff',
                                color: 'red',
                                fontWeight: 'bold',
                                boxShadow: '0 3px 5px 2px rgba(245, 6, 54, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e97575ff 30%, #ff7043 90%)',
                                    boxShadow: '0 5px 10px 3px rgba(255, 105, 135, .5)',
                                },
                            }}
                            onClick={() => {
                                fetch("http://localhost:3010/user/login", {
                                    method: "POST",
                                    headers: {
                                        "Content-type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        userId: idRef.current.value,
                                        pwd: pwdRef.current.value
                                    })
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.result == "false") {
                                            alert(data.msg);
                                            return;
                                        }
                                        console.log(data);
                                        
                                        localStorage.setItem("token", data.token);
                                        navigate("/feed");
                                    })
                            }}
                        >
                            로그인
                        </Button>

                        {/* 아이디/비밀번호 찾기 버튼 (공간을 1/2로 차지) */}
                        <Button
                            onClick={() => { navigate("/findId") }}
                            type="button" // submit이 아닌 일반 버튼으로 변경 (선택적)
                            variant="contained"
                            sx={{
                                flexGrow: 1, // 공간을 남은 공간을 균등하게 차지하도록 설정
                                // 로그인 버튼과 동일한 그라데이션 적용
                                background: '#f8d4d4ff',
                                color: 'red',
                                fontWeight: 'bold',
                                boxShadow: '0 3px 5px 2px rgba(245, 6, 54, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #e97575ff 30%, #ff7043 90%)',
                                    boxShadow: '0 5px 10px 3px rgba(255, 105, 135, .5)',
                                },
                            }}
                        >
                            아이디/비밀번호 찾기
                        </Button>
                    </Stack>

                    {/* 회원가입 버튼 (Full Width 유지) */}
                    <Button
                        onClick={() => { navigate("/join") }}
                        type="submit"
                        fullWidth // Stack 내부에서 fullWidth는 flexGrow: 1과 유사하지만, 여기서는 단독으로 배치
                        variant="contained"
                        sx={{
                            // 회원가입 버튼은 다른 색상으로 포인트를 줄 수도 있으나, 여기서는 통일
                            background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                            color: 'white',
                            fontWeight: 'bold',
                            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)',
                                boxShadow: '0 5px 10px 3px rgba(255, 105, 135, .5)',
                            },
                        }}
                    >
                        회원가입
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
}

export default Login;


