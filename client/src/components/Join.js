import { TextField, Box, Button, Typography, Container, Stack } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useRef } from "react";
import * as React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Join() {
    const navigate = useNavigate();

    let [gender, setGender] = useState('M');
    let idRef = useRef("");
    let [idFlg, setIdFlg] = useState(false);
    let pwdRef = useRef("");
    let nameRef = useRef("");
    let nicknameRef = useRef("");
    let [nicknameFlg, setNicknameFlg] = useState(false);
    let phoneRef = useRef("");
    let instrumentRef = useRef("");
    let addrRef = useRef("");


    const handleChange = (event) => {
        setGender(event.target.value);
    };
    return <>
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
                    회원가입
                </Typography>

                <Stack spacing={2} sx={{ width: '100%', mt: 3 }}>
                    <Stack direction="row">
                        <TextField
                            disabled={idFlg}
                            required
                            label="아이디"
                            variant="outlined"
                            color="error"
                            sx={{ flexGrow: 1 }}
                            inputRef={idRef}
                        />
                        <Button
                            disabled={idFlg}
                            sx={{
                                flexGrow: 1 / 5,
                                background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                                color: 'white',
                                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)',
                                    boxShadow: '0 5px 10px 3px rgba(255, 105, 135, .5)',
                                }
                            }}
                            onClick={() => {
                                if (idRef.current.value == "") {
                                    alert("아이디를 입력해주세요!");
                                    return;
                                }
                                fetch("http://localhost:3010/user/" + idRef)
                                    .then(res => res.json())
                                    .then(data => {
                                        console.log(data);
                                        if (data.result == "false") {
                                            setIdFlg(true);
                                        } else {
                                            alert("중복된 아이디입니다!");
                                            return;
                                        }
                                    })
                            }}


                        >중복체크</Button>
                    </Stack>
                    <TextField
                        required
                        fullWidth
                        label="비밀번호"
                        type="password"
                        variant="outlined"
                        color="error"
                        inputRef={pwdRef}
                    />
                    <TextField
                        required
                        label="이름"
                        variant="outlined"
                        color="error"
                        inputRef={nameRef}
                    />
                    <Stack direction="row">
                        <TextField
                            required
                            label="닉네임"
                            variant="outlined"
                            color="error"
                            sx={{ flexGrow: 1 }}
                            inputRef={nicknameRef}
                            disabled={nicknameFlg}
                        />
                        <Button
                            disabled={nicknameFlg}
                            sx={{
                                flexGrow: 1 / 5,
                                background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                                color: 'white',
                                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)',
                                    boxShadow: '0 5px 10px 3px rgba(255, 105, 135, .5)',
                                }
                            }}
                            onClick={() => {
                                if (nicknameRef.current.value == "") {
                                    alert("닉네임을 입력해주세요!");
                                    return;
                                }
                                fetch("http://localhost:3010/user/nickname/" + nicknameRef)
                                    .then(res => res.json())
                                    .then(data => {
                                        console.log(data);
                                        if (data.result == "false") {
                                            setNicknameFlg(true);
                                        } else {
                                            alert("중복된 아이디입니다!");
                                            return;
                                        }
                                    })
                            }}
                        >중복체크</Button>
                    </Stack>

                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label" color="error">성별</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={gender}
                            label="성별"
                            color="error"
                            onChange={handleChange}
                        >
                            <MenuItem value={'M'}>남자</MenuItem>
                            <MenuItem value={'F'}>여자</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        required
                        fullWidth
                        label="좋아하는악기"
                        variant="outlined"
                        color="error"
                        inputRef={instrumentRef}
                    />
                    <TextField
                        required
                        fullWidth
                        label="주소"
                        variant="outlined"
                        color="error"
                        inputRef={addrRef}
                    />


                    {/* 회원가입 버튼 (Full Width 유지) */}
                    <Button
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
                        onClick={() => {
                            if(idFlg == false || nicknameFlg == false){
                                alert("중복체크를 해주세요!");
                                return;
                            }
                            if(pwdRef.current.value == "" || nameRef.current.value == "" || instrumentRef.current.value == "" || addrRef.current.value == ""){
                                alert("빈칸을 모두 채워주세요!");
                                return;
                            }
                            fetch("http://localhost:3010/user/join", {
                                method: "POST",
                                headers: {
                                    "Content-type": "application/json"
                                },
                                body: JSON.stringify({
                                    userId: idRef.current.value,
                                    pwd: pwdRef.current.value,
                                    name : nameRef.current.value,
                                    nickname : nicknameRef.current.value,
                                    gender : gender,
                                    instrument : instrumentRef.current.value,
                                    addr : addrRef.current.value
                                })
                            })
                                .then(res => res.json())
                                .then(data => {
                                    alert(data.msg);
                                    navigate("/login");
                                })
                        }}
                    >
                        회원가입
                    </Button>
                </Stack>
            </Box>
        </Container>
    </>
}

export default Join;