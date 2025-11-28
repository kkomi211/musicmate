import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Avatar, Button, IconButton, TextField, Badge
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

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

function PersonalEdit() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // 사용자 입력 정보 State
    const [userInfo, setUserInfo] = useState({
        userId: "",
        nickname: "",
        instrument: "",
        profileImg: ""
    });

    // 이미지 변경 프리뷰를 위한 State
    const [previewImg, setPreviewImg] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    // 1. 초기 데이터 세팅
    useEffect(() => {
        const token = localStorage.getItem("token");
        let currentUserId = "";

        if (token) {
            const decoded = decodeToken(token);
            if (decoded) currentUserId = decoded.userId;
            console.log(decoded);
            
        }

        if (currentUserId) {
            // 서버 API 호출 (프로필 정보 가져오기)
            fetch(`http://localhost:3010/feed/personal/${currentUserId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.result === "success" && data.list.length > 0) {
                        const user = data.list[0];
                        // DB 컬럼명(대문자)을 State(소문자)에 매핑
                        setUserInfo({
                            userId: user.USERID,
                            nickname: user.NICKNAME || "",
                            profileImg: user.IMGPATH || "", // 서버 쿼리에서 가져온 프로필 이미지
                            instrument: user.INSTRUMENT || ""
                        });
                    }
                })
                .catch(err => console.error("정보 로딩 실패:", err));
        }
    }, []);

    // 2. 프로필 사진 클릭 핸들러
    const handleProfileClick = () => {
        fileInputRef.current.click();
    };

    // 3. 파일 선택 시 처리 (미리보기 생성)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewImg(objectUrl); // 미리보기 업데이트
        }
    };

    // 4. 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    // 5. [수정됨] 저장 버튼 핸들러 (실제 서버 전송)
    const handleSave = () => {
        const formData = new FormData();
        formData.append("userId", userInfo.userId);
        formData.append("nickname", userInfo.nickname);
        formData.append("instrument", userInfo.instrument);

        // 파일이 새로 선택되었을 때만 전송
        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        // 수정 요청 전송 (PUT 메서드 사용)
        fetch("http://localhost:3010/feed/user/update", {
            method: "PUT",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    localStorage.setItem("token", data.token);
                    alert("프로필이 수정되었습니다.");
                    navigate(-1); // 이전 페이지로 복귀
                } else {
                    alert("수정 실패: " + (data.msg || "알 수 없는 오류"));
                }
            })
            .catch(err => {
                console.error(err);
                alert("서버 연결 오류가 발생했습니다.");
            });
    };

    return (
        <Box sx={{ width: '80%', minHeight: '100vh', backgroundColor: 'white', mx: 'auto' }}>
            {/* 테두리용 그라데이션 정의 */}
            <svg width={0} height={0}>
                <linearGradient id="linearColors" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="30%" stopColor="#d32f2f" />
                    <stop offset="90%" stopColor="#ff8a65" />
                </linearGradient>
            </svg>

            {/* 상단 헤더 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIosNewIcon sx={{ color: '#333' }} />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                        프로필 수정
                    </Typography>
                </Box>
                {/* 상단 완료 버튼 */}
                <Button onClick={handleSave} sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    완료
                </Button>
            </Box>

            {/* 프로필 사진 변경 섹션 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                <Box
                    sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        p: 0.5,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)'
                    }}
                    onClick={handleProfileClick}
                >
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <Box sx={{
                                bgcolor: 'white',
                                borderRadius: '50%',
                                p: 0.5,
                                boxShadow: 1,
                                border: '1px solid #eee',
                                display: 'flex'
                            }}>
                                <PhotoCameraIcon sx={{ color: '#666', fontSize: 20 }} />
                            </Box>
                        }
                    >
                        <Avatar
                            src={previewImg || userInfo.profileImg}
                            sx={{ width: 100, height: 100, border: '3px solid white' }}
                        />
                    </Badge>
                </Box>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <Typography
                    variant="body2"
                    color="primary"
                    sx={{ mt: 2, cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={handleProfileClick}
                >
                    프로필 사진 변경
                </Typography>
            </Box>

            {/* 입력 폼 섹션 */}
            <Box sx={{ px: 4, mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

                <TextField
                    label="닉네임"
                    name="nickname"
                    variant="standard"
                    value={userInfo.nickname}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    label="아이디"
                    variant="standard"
                    value={userInfo.userId}
                    disabled
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    label="사용악기"
                    name="instrument"
                    variant="standard"
                    value={userInfo.instrument}
                    onChange={handleChange}
                    fullWidth
                    placeholder="주로 연주하는 악기를 입력하세요."
                    InputLabelProps={{ shrink: true }}
                />
            </Box>

            {/* 하단 저장 버튼 */}
            <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'white' }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    sx={{
                        height: 50,
                        borderRadius: 3,
                        background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
                    }}
                >
                    저장하기
                </Button>
            </Box>
        </Box>
    );
}

export default PersonalEdit;