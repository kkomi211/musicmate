import { Avatar, Box, Fab, IconButton, Stack, TextField, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { PhotoCamera, Movie } from '@mui/icons-material'; // [추가] 동영상 아이콘 추가
import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
// import { jwtDecode } from "jwt-decode"; // 제거
import { useState } from "react";

// JWT 디코딩 헬퍼 함수 추가
function decodeToken(token) {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Token decoding error:", error);
        return null;
    }
}

function FeedAdd() {
    const navigate = useNavigate();
    let contentRef = useRef();
    let [userId, setuserId] = useState();
    const [files, setFile] = React.useState([]);

    const handleFileChange = (event) => {
        setFile(Array.from(event.target.files));
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // jwtDecode 대신 커스텀 함수 사용
            const decoded = decodeToken(token);
            if (decoded) {
                setuserId(decoded.userId);
            } else {
                alert("로그인 정보가 유효하지 않습니다.");
                navigate("/login");
            }
        } else {
            alert("로그인 후 이용해주세요")
            navigate("/login");
        }
    }, [])

    const fnUploadFile = (feedNo) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            const imgType = (i === 0) ? "M" : "C";
            console.log(files[i]);
            
            formData.append("file", files[i]);
            formData.append("imgType", imgType);
        }
        formData.append("feedNo", feedNo);
        formData.append("userId", userId);
        
        fetch("http://localhost:3010/feed/upload", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                navigate("/feed"); // 원하는 경로
            })
            .catch(err => {
                console.error(err);
            });
    }

    return <>
        <Box
            sx={{
                p: 4,
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 4,
                border: '1px solid #ccc',
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: 'white', 
                mx: 'auto',
                width : '80%'
            }}>
            <Typography component="h1" variant="h5" gutterBottom>
                피드 작성
            </Typography>
            <Stack spacing={2} sx={{ width: '100%', mt: 3 }}>
                <TextField
                    required
                    fullWidth
                    label="내용"
                    variant="outlined"
                    color="error"
                    multiline
                    rows={8}
                    inputRef={contentRef}
                />
                <Stack direction="row" alignItems="center" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                    <input
                        // [수정] 이미지와 비디오 모두 허용
                        accept="image/*, video/*"
                        style={{ display: 'none' }}
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                    />

                    <label htmlFor="file-upload">
                        <IconButton color="primary" component="span">
                            <PhotoCamera /> {/* 아이콘은 취향에 따라 Movie 등으로 변경 가능 */}
                        </IconButton>
                    </label>

                    {/* [수정] 파일 타입에 따라 이미지/비디오 미리보기 분기 */}
                    {files.length > 0 && (
                        files.map((file, index) => {
                            const fileUrl = URL.createObjectURL(file);
                            const isVideo = file.type.startsWith('video/');

                            return isVideo ? (
                                // 비디오일 경우
                                <Box 
                                    key={index}
                                    sx={{ 
                                        width: 56, 
                                        height: 56, 
                                        marginLeft: 2, 
                                        borderRadius: '50%', 
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        border: '1px solid #ccc',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: '#000'
                                    }}
                                >
                                    <video 
                                        src={fileUrl} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </Box>
                            ) : (
                                // 이미지일 경우
                                <Avatar
                                    key={index}
                                    alt="첨부된 이미지"
                                    src={fileUrl}
                                    sx={{ width: 56, height: 56, marginLeft: 2 }}
                                />
                            );
                        })
                    )}
                </Stack>
                
                <Typography variant="body2" color="text.secondary">
                    {files.length > 0 ? `${files.length} 개의 파일 선택됨` : '사진 또는 동영상을 선택하세요'}
                </Typography>
            </Stack>

            {/* -------------------- 고정 버튼 영역 -------------------- */}

            {/* 1. '+' 버튼 (Bottom Right) - Fab 컴포넌트 */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)',
                    },
                    zIndex: 1100, 
                }}
                onClick={() => {
                    fetch("http://localhost:3010/feed", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json"
                        },
                        body: JSON.stringify({
                            userId: userId,
                            content: contentRef.current.value
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log(data);
                            fnUploadFile(data.result[0].insertId);
                        })
                }}
            >
                <AddIcon />
            </Fab>
        </Box>

    </>
}

export default FeedAdd;