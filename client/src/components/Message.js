import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Box, Typography, Avatar, Button, IconButton, Paper, Stack, Divider,
    TextField, Chip
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

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
    const { userId: targetUserId } = useParams(); 
    
    const [myUserId, setMyUserId] = useState("");
    const [targetInfo, setTargetInfo] = useState({ nickname: "", profileImg: "" });
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    
    const messagesEndRef = useRef(null); 

    // 1. 초기 데이터 로딩
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

        // 상대방 정보 가져오기
        fetch(`http://localhost:3010/feed/personal/${targetUserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.list && data.list.length > 0) {
                    setTargetInfo({
                        nickname: data.list[0].NICKNAME,
                        profileImg: data.list[0].IMGPATH // 파일명만 들어옴
                    });
                }
            });

        // 메시지 내역 가져오기
        getMessages(currentUserId, targetUserId);

    }, [targetUserId, navigate]);

    // 2. 메시지 내역 불러오기 함수
    const getMessages = (myId, targetId) => {
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
                setInputMsg(""); 
                getMessages(myUserId, targetUserId); 
            }
        })
        .catch(err => console.error("Send error:", err));
    };

    // 5. 닉네임 클릭 시 개인 피드 이동
    const handleGoToPersonalFeed = () => {
        navigate("/personalFeed", { 
            state: { 
                targetUserId: targetUserId, 
                targetNickname: targetInfo.nickname || targetUserId 
            } 
        });
    };

    // [추가] 날짜 포맷 헬퍼 함수 (YYYY-MM-DD 비교용)
    const getDateString = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(); // "2023. 10. 27." 등의 형태로 반환 (로케일에 따라 다름)
    };

    // [추가] 화면 표시용 날짜 포맷 (예: 2023년 10월 27일)
    const getDisplayDateString = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    };

    return (
        <Box sx={{ width: '80%', height: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', mx: 'auto' }}>
            
            {/* 1. 상단 헤더 */}
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 0, zIndex: 10 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Avatar 
                    // [수정] 프로필 이미지 경로 처리
                    src={targetInfo.profileImg ? `http://localhost:3010/${targetInfo.profileImg}` : undefined} 
                    sx={{ width: 40, height: 40, mr: 1.5 }} 
                />
                
                <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={handleGoToPersonalFeed}
                >
                    {targetInfo.nickname || targetUserId}
                </Typography>
            </Paper>

            {/* 2. 채팅 영역 */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.length > 0 ? (
                    messages.map((msg, index) => {
                        const isMe = msg.SENDERID === myUserId;
                        const messageDate = new Date(msg.CDATE);
                        const timeString = isNaN(messageDate) ? '' : messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        // [추가] 날짜 구분선 로직
                        const currentDate = getDateString(msg.CDATE);
                        const prevDate = index > 0 ? getDateString(messages[index - 1].CDATE) : null;
                        const showDateSeparator = currentDate !== prevDate; // 이전 메시지와 날짜가 다르면 true

                        return (
                            <React.Fragment key={index}>
                                {/* 날짜 구분선 표시 */}
                                {showDateSeparator && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                        <Chip 
                                            label={getDisplayDateString(msg.CDATE)} 
                                            size="small" 
                                            sx={{ backgroundColor: 'rgba(0,0,0,0.1)', color: '#666', fontSize: '0.75rem' }} 
                                        />
                                    </Box>
                                )}

                                {/* 메시지 내용 */}
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                                        alignItems: 'flex-end'
                                    }}
                                >
                                    {!isMe && (
                                        <Avatar 
                                            src={targetInfo.profileImg ? `http://localhost:3010/${targetInfo.profileImg}` : undefined} 
                                            sx={{ width: 32, height: 32, mr: 1, mb: 0.5 }} 
                                        />
                                    )}

                                    <Box sx={{ maxWidth: '70%' }}>
                                        <Paper sx={{ 
                                            p: 1.5, 
                                            borderRadius: 3,
                                            borderTopRightRadius: isMe ? 0 : 12,
                                            borderTopLeftRadius: isMe ? 12 : 0,
                                            background: isMe ? 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)' : 'white',
                                            color: isMe ? 'white' : 'black'
                                        }}>
                                            <Typography variant="body1">{msg.CONTENT}</Typography>
                                        </Paper>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: isMe ? 'right' : 'left', mt: 0.5, px: 1 }}>
                                            {timeString}
                                        </Typography>
                                    </Box>
                                </Box>
                            </React.Fragment>
                        );
                    })
                ) : (
                    <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
                        대화를 시작해보세요! 🎵
                    </Typography>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* 3. 입력창 영역 */}
            <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid #eee' }}>
                <TextField 
                    fullWidth 
                    placeholder="메시지를 입력하세요..." 
                    variant="outlined" 
                    size="small"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }}
                    sx={{ mr: 1, '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
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