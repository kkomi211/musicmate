import { TextField, Box, Button, Typography, Container, Stack, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useRef, useState, useEffect } from "react";
import * as React from 'react';
import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

function Join() {
    const navigate = useNavigate();

    let [gender, setGender] = useState('M');
    let idRef = useRef(null);
    let [idFlg, setIdFlg] = useState(false);
    let pwdRef = useRef(null);
    let [pwdError, setPwdError] = useState(""); // [추가] 비밀번호 오류 메시지 상태
    let nameRef = useRef(null);
    let nicknameRef = useRef(null);
    let instrumentRef = useRef(null);
    let addrRef = useRef(null);
    
    // 휴대폰 인증 관련 State 및 Ref
    let phoneRef = useRef(null);
    let codeRef = useRef(null);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [phoneVerifiedFlg, setPhoneVerifiedFlg] = useState(false);
    const [sentCode, setSentCode] = useState("");

    // 주소 검색 관련 State 및 Ref
    const [openPostcode, setOpenPostcode] = useState(false);
    const postcodeContainerRef = useRef(null);

    const handleChange = (event) => {
        setGender(event.target.value);
    };

    // [추가] 비밀번호 유효성 검사 로직
    const validatePassword = (pwd) => {
        // 6자 이상만 허용 (한글, 영어, 특수문자, 숫자 모두 허용)
        const minLengthRegex = /^(?=.{6,}).*$/; 
        
        if (!minLengthRegex.test(pwd)) {
            setPwdError("비밀번호는 6자 이상이어야 합니다.");
            return false;
        }
        setPwdError("");
        return true;
    };

    // 주소 선택 완료 핸들러
    const handleCompletePostcode = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        if(addrRef.current) {
            addrRef.current.value = fullAddress;
        }
        setOpenPostcode(false);
    };

    // 다음 주소 스크립트 로드 및 실행
    useEffect(() => {
        if (openPostcode) {
            const scriptUrl = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            const script = document.createElement("script");
            script.src = scriptUrl;
            script.async = true;
            
            script.onload = () => {
                if (window.daum && window.daum.Postcode) {
                    new window.daum.Postcode({
                        oncomplete: handleCompletePostcode,
                        width: '100%',
                        height: '100%',
                    }).embed(postcodeContainerRef.current);
                }
            };
            document.body.appendChild(script);
        }
    }, [openPostcode]);

    // 인증번호 발송 핸들러
    const handleSendCode = () => {
        const phone = phoneRef.current.value;
        if (!phone || phone.length < 10) return alert("유효한 휴대폰 번호를 입력해주세요.");

        const simulatedCode = "1234";
        setSentCode(simulatedCode); 
        setIsCodeSent(true);
        alert(`[시뮬레이션] 인증번호 [${simulatedCode}]가 발송되었습니다.`);
    };

    // 인증번호 확인 핸들러
    const handleVerifyCode = () => {
        const inputCode = codeRef.current.value;
        if (!inputCode) return alert("인증번호를 입력해주세요.");

        if (inputCode === sentCode) {
            setPhoneVerifiedFlg(true);
            alert("휴대폰 인증이 완료되었습니다.");
        } else {
            alert("인증번호가 일치하지 않습니다.");
        }
    };


    return (
        <>
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
                        backgroundColor: 'white', 
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>
                        회원가입
                    </Typography>

                    <Stack spacing={2} sx={{ width: '100%', mt: 3 }}>
                        {/* 아이디 입력 + 중복 체크 */}
                        <Stack direction="row" spacing={1}>
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
                                    fetch("http://localhost:3010/user/" + idRef.current.value) 
                                        .then(res => res.json())
                                        .then(data => {
                                            if (data.result == "false") {
                                                setIdFlg(true);
                                                alert("사용 가능한 아이디입니다.");
                                            } else {
                                                alert("중복된 아이디입니다!");
                                                return;
                                            }
                                        })
                                }}
                            >중복체크</Button>
                        </Stack>
                        
                        {/* 비밀번호 입력 필드 (유효성 검사 적용) */}
                        <TextField 
                            required 
                            fullWidth 
                            label="비밀번호" 
                            type="password" 
                            variant="outlined" 
                            color="error" 
                            inputRef={pwdRef} 
                            // [수정] 입력 시 유효성 검사 실행
                            onChange={(e) => validatePassword(e.target.value)}
                            // [수정] 에러 메시지 표시
                            error={!!pwdError}
                            helperText={pwdError}
                        />
                        
                        {/* 이름, 닉네임 */}
                        <TextField required label="이름" variant="outlined" color="error" inputRef={nameRef} />
                        <TextField required fullWidth label="닉네임" variant="outlined" color="error" inputRef={nicknameRef} />
                        
                        {/* 휴대폰 인증 섹션 */}
                        <Typography variant="subtitle2" sx={{ mt: 1, color: '#d32f2f', fontWeight: 'bold' }}>
                            휴대폰 인증 {phoneVerifiedFlg && <CheckIcon color="success" fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />}
                        </Typography>
                        
                        <Stack direction="row" spacing={1}>
                            <TextField
                                disabled={isCodeSent && !phoneVerifiedFlg}
                                required
                                label="휴대폰 번호"
                                variant="outlined"
                                color="error"
                                type="tel"
                                sx={{ flexGrow: 1 }}
                                inputRef={phoneRef}
                                placeholder="하이픈(-) 없이 입력"
                            />
                            <Button
                                disabled={isCodeSent || phoneVerifiedFlg}
                                sx={{
                                    background: (isCodeSent || phoneVerifiedFlg) ? '#999' : 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}
                                onClick={handleSendCode}
                            >
                                인증번호 받기
                            </Button>
                        </Stack>
                        
                        {/* 인증번호 입력 필드 (코드 발송 후 표시) */}
                        {isCodeSent && !phoneVerifiedFlg && (
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    required
                                    label="인증번호 입력"
                                    variant="outlined"
                                    color="error"
                                    type="number"
                                    sx={{ flexGrow: 1 }}
                                    inputRef={codeRef}
                                />
                                <Button
                                    sx={{
                                        background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onClick={handleVerifyCode}
                                >
                                    인증 확인
                                </Button>
                            </Stack>
                        )}

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
                        
                        {/* 주소 입력란 */}
                        <Stack direction="row" spacing={1}>
                            <TextField
                                required
                                label="주소"
                                variant="outlined"
                                color="error"
                                inputRef={addrRef}
                                sx={{ flexGrow: 1 }}
                                placeholder="주소 검색을 이용해주세요"
                            />
                            <Button
                                sx={{
                                    whiteSpace: 'nowrap',
                                    background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)',
                                    }
                                }}
                                onClick={() => setOpenPostcode(true)}
                            >
                                주소 검색
                            </Button>
                        </Stack>

                        {/* 회원가입 버튼 */}
                        <Button
                            type="submit"
                            fullWidth 
                            variant="contained"
                            // [수정] 아이디 체크, 휴대폰 인증 완료, 비밀번호 오류 없을 때만 회원가입 가능
                            disabled={!idFlg || !phoneVerifiedFlg || !!pwdError}
                            sx={{
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
                                // 최종 유효성 검사
                                if(!validatePassword(pwdRef.current.value)) return;
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
                                        addr : addrRef.current.value,
                                        phone: phoneRef.current.value
                                    })
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        alert(data.msg);
                                        navigate("/login");
                                    })
                                    .catch(err => console.error("Join error:", err));
                            }}
                        >
                            회원가입
                        </Button>
                    </Stack>
                </Box>

                {/* 주소 검색 모달 */}
                <Dialog 
                    open={openPostcode} 
                    onClose={() => setOpenPostcode(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        주소 검색
                        <IconButton onClick={() => setOpenPostcode(false)}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <div ref={postcodeContainerRef} style={{ height: '400px', width: '100%' }}></div>
                    </DialogContent>
                </Dialog>

            </Container>
        </>
    );
}

export default Join;