import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, TextField, Button, Stack, IconButton,
    Dialog, DialogTitle, DialogContent 
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CheckIcon from '@mui/icons-material/Check';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';

// 주소 검색 라이브러리 (npm install react-daum-postcode 필요)
import DaumPostcode from 'react-daum-postcode';

function EnsembleAdd() {
    const navigate = useNavigate();
    
    // 합주실 정보 State
    const [roomInfo, setRoomInfo] = useState({
        name: "",
        addr: "",
        phone: ""
    });

    // 주소 검색 모달 상태
    const [openPostcode, setOpenPostcode] = useState(false);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomInfo(prev => ({ ...prev, [name]: value }));
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

        // 주소 필드에 값 채우기
        setRoomInfo(prev => ({ ...prev, addr: fullAddress }));
        setOpenPostcode(false); // 모달 닫기
    };

    // 등록 핸들러
    const handleSubmit = () => {
        if (!roomInfo.name) return alert("합주실 이름을 입력해주세요.");
        if (!roomInfo.addr) return alert("주소를 입력해주세요.");
        if (!roomInfo.phone) return alert("전화번호를 입력해주세요.");

        // 서버 전송
        fetch("http://localhost:3010/ensemble/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(roomInfo)
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                alert("합주실이 등록되었습니다.");
                navigate("/ensembleRoom"); // 목록(지도) 페이지로 이동
            } else {
                alert("등록 실패: " + (data.msg || "오류가 발생했습니다."));
            }
        })
        .catch(err => {
            console.error("Ensemble add error:", err);
            alert("서버 오류가 발생했습니다.");
        });
    };

    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, minHeight: '100vh', backgroundColor: '#fff', pb: 10, mx: 'auto' }}>
            
            {/* 1. 상단 헤더 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIosNewIcon sx={{ color: '#333' }} />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                    합주실 등록
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button 
                    onClick={handleSubmit} 
                    sx={{ fontWeight: 'bold', color: '#d32f2f' }}
                >
                    완료
                </Button>
            </Box>

            {/* 2. 입력 폼 영역 */}
            <Box sx={{ p: 3, maxWidth: '600px', mx: 'auto' }}>
                <Box sx={{ textAlign: 'center', mb: 4, color: '#999' }}>
                    <MapIcon sx={{ fontSize: 60, mb: 1, color: '#d32f2f' }} />
                    <Typography variant="body2">
                        지도에 표시될 합주실 정보를 입력해주세요.
                    </Typography>
                </Box>

                <Stack spacing={3}>
                    {/* 합주실 이름 */}
                    <TextField
                        label="합주실 이름"
                        name="name"
                        variant="standard"
                        value={roomInfo.name}
                        onChange={handleChange}
                        fullWidth
                        placeholder="ex) 홍대 잼 합주실"
                    />

                    {/* 주소 (검색 버튼 추가) */}
                    <Stack direction="row" spacing={1} alignItems="flex-end">
                        <TextField
                            label="주소"
                            name="addr"
                            variant="standard"
                            value={roomInfo.addr}
                            onChange={handleChange}
                            fullWidth
                            placeholder="주소 검색 버튼을 눌러주세요"
                            helperText="정확한 주소를 입력해야 지도에 표시됩니다."
                        />
                        <Button 
                            variant="contained" 
                            onClick={() => setOpenPostcode(true)}
                            startIcon={<SearchIcon />}
                            sx={{ 
                                mb: 2, 
                                whiteSpace: 'nowrap',
                                background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)'
                            }}
                        >
                            주소 검색
                        </Button>
                    </Stack>

                    {/* 전화번호 */}
                    <TextField
                        label="전화번호"
                        name="phone"
                        variant="standard"
                        value={roomInfo.phone}
                        onChange={handleChange}
                        fullWidth
                        placeholder="ex) 02-1234-5678"
                    />
                </Stack>
            </Box>

            {/* 주소 검색 모달 (Dialog) */}
            <Dialog 
                open={openPostcode} 
                onClose={() => setOpenPostcode(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    주소 검색
                    <IconButton onClick={() => setOpenPostcode(false)}>
                        <ArrowBackIosNewIcon sx={{ transform: 'rotate(180deg)' }} /> {/* 닫기 아이콘 대용 */}
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <DaumPostcode 
                        onComplete={handleCompletePostcode}
                        style={{ height: '400px' }}
                    />
                </DialogContent>
            </Dialog>

            {/* 3. 하단 FAB (저장) */}
            <Fab 
                color="primary" 
                aria-label="save" 
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                    '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' },
                    zIndex: 1100,
                }}
                onClick={handleSubmit}
            >
                <CheckIcon />
            </Fab>

        </Box>
    );
}

export default EnsembleAdd;     