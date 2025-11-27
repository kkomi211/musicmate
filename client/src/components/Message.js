import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Box, Typography, Avatar, IconButton, TextField, Paper, Stack, Button
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SendIcon from '@mui/icons-material/Send';

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

function Message() {
    const navigate = useNavigate();
    const { userId: targetUserId } = useParams(); // URL 파라미터에서 상대방 ID 가져오기
    
    const [myUserId, setMyUserId] = useState("");
    const [targetInfo, setTargetInfo] = useState({ nickname: "", profileImg: "" });
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    
    const messagesEndRef = useRef(null); // 스크롤 자동 이동용 Ref

    // 1. 초기 데이터 로딩 (내 정보 & 상대방 정보 & 메시지 내역)
    useEffect(() => {
        const token = localStorage.getItem("token");
        let currentUserId = "";

        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                currentUserId = decoded.userId;
                setMyUserId(currentUserId);
            } else {
                alert("로그인이 필요합니다.");
                navigate("/login");
                return;
            }
        } else {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        // 상대방 정보 가져오기 (기존 API 재사용)
        fetch(`http://localhost:3010/feed/personal/${targetUserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.list && data.list.length > 0) {
                    setTargetInfo({
                        nickname: data.list[0].NICKNAME,
                        profileImg: data.list[0].IMGPATH
                    });
                }
            });

        // 메시지 내역 가져오기 함수 호출
        getMessages(currentUserId, targetUserId);

    }, [targetUserId, navigate]);

    // 2. 메시지 내역 불러오기 함수
    const getMessages = (myId, targetId) => {
        // API 주소는 서버 구현에 따라 달라질 수 있습니다. (예시: /message/list/:myId/:targetId)
        fetch(`http://localhost:3010/message/list/${myId}/${targetId}`)
            .then(res => res.json())
            .then(data => {
                if (data.list) {
                    setMessages(data.list);
                }
            })
            .catch(err => console.error("Message load error:", err));
    };

    // 3. 스크롤을 항상 아래로 유지
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 4. 메시지 전송 핸들러
    const handleSendMessage = () => {
        if (!inputMsg.trim()) return;

        fetch("http://localhost:3010/message/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                senderId: myUserId,
                receiverId: targetUserId,
                content: inputMsg
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                setInputMsg(""); // 입력창 비우기
                getMessages(myUserId, targetUserId); // 목록 갱신
            }
        })
        .catch(err => console.error("Send error:", err));
    };

    return (
        <Box sx={{ width: '80%', height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', mx: 'auto' }}>
            
            {/* 1. 상단 헤더 (상대방 정보) */}
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 0, zIndex: 10 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Avatar src={targetInfo.profileImg} sx={{ width: 40, height: 40, mr: 1.5 }} />
                <Typography variant="h6" fontWeight="bold">
                    {targetInfo.nickname || targetUserId}
                </Typography>
            </Paper>

            {/* 2. 채팅 영역 */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.length > 0 ? (
                    messages.map((msg, index) => {
                        const isMe = msg.SENDERID === myUserId; // 내가 보낸 메시지인지 확인
                        return (
                            <Box 
                                key={index} 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                                    alignItems: 'flex-end'
                                }}
                            >
                                {/* 상대방 프로필 (상대방 메시지일 때만) */}
                                {!isMe && (
                                    <Avatar src={targetInfo.profileImg} sx={{ width: 32, height: 32, mr: 1, mb: 0.5 }} />
                                )}

                                <Box sx={{ maxWidth: '70%' }}>
                                    {/* 말풍선 */}
                                    <Paper sx={{ 
                                        p: 1.5, 
                                        borderRadius: 3,
                                        borderTopRightRadius: isMe ? 0 : 12, // 내 말풍선 꼬리
                                        borderTopLeftRadius: isMe ? 12 : 0,  // 상대 말풍선 꼬리
                                        backgroundColor: isMe ? 'transparent' : 'white', // 나는 그라데이션, 상대는 흰색
                                        background: isMe ? 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)' : undefined,
                                        color: isMe ? 'white' : 'black'
                                    }}>
                                        <Typography variant="body1">{msg.CONTENT}</Typography>
                                    </Paper>
                                    {/* 시간 표시 */}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: isMe ? 'right' : 'left', mt: 0.5, px: 1 }}>
                                        {new Date(msg.CDATE).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })
                ) : (
                    <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
                        대화를 시작해보세요! 🎵
                    </Typography>
                )}
                {/* 스크롤 하단 고정용 div */}
                <div ref={messagesEndRef} />
            </Box>

            {/* 3. 입력창 영역 (하단 고정) */}
            <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid #eee' }}>
                <TextField 
                    fullWidth 
                    placeholder="메시지를 입력하세요..." 
                    variant="outlined" 
                    size="small"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }}
                    sx={{ 
                        mr: 1,
                        '& .MuiOutlinedInput-root': { borderRadius: 5 } 
                    }}
                />
                <IconButton 
                    onClick={handleSendMessage} 
                    sx={{ 
                        background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', 
                        color: 'white',
                        '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' }
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Paper>
        </Box>
    );
}

export default Message;