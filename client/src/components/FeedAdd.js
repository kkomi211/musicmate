import { Avatar, Box, Fab, IconButton, Stack, TextField, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { PhotoCamera } from '@mui/icons-material';
import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

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
            const decoded = jwtDecode(token);
            setuserId(decoded.userId);
            console.log(decoded);
            console.log(userId);
            

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
                backgroundColor: 'white', // 배경색은 흰색으로 유지
                mx: 'auto',
                width : '80%'
            }}> {/* 스크롤 테스트를 위해 최소 높이 설정 */}
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
                <Stack direction="row" alignItems="center" spacing={1}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                    />

                    <label htmlFor="file-upload">
                        <IconButton color="primary" component="span">
                            <PhotoCamera />
                        </IconButton>
                    </label>
                    {files.length > 0 && (
                        files.map((file) => {
                            return (
                                <Avatar
                                    alt="첨부된 이미지"
                                    src={URL.createObjectURL(file)}
                                    sx={{ width: 56, height: 56, marginLeft: 2 }}
                                />
                            )
                        })
                    )}
                    <Typography variant="body1">
                        {files.length > 0 ? files.length + ' 장 선택' : '첨부할 파일 선택'}
                    </Typography>
                </Stack>
            </Stack>

            {/* -------------------- 고정 버튼 영역 -------------------- */}

            {/* 1. '+' 버튼 (Bottom Right) - Fab 컴포넌트 */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    // 화면 오른쪽 아래에 고정
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    // 그라데이션 스타일 적용
                    background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)',
                    },
                    zIndex: 1100, // 다른 요소 위에 표시
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