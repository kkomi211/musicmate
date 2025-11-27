import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, IconButton, Paper, Divider
} from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

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

function MessageList() {
    const navigate = useNavigate();
    const [myUserId, setMyUserId] = useState("");
    const [chatList, setChatList] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                setMyUserId(decoded.userId);
                getInbox(decoded.userId);
            } else {
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const getInbox = (userId) => {
        // 나와 대화한 적 있는 유저 목록 가져오기
        fetch(`http://localhost:3010/message/inbox/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.list) {
                    setChatList(data.list);
                }
            })
            .catch(err => console.error("Inbox load error:", err));
    };

    return (
        <Box sx={{ width: '80%', height: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', mx: 'auto' }}>
            {/* 헤더 */}
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 0 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">메시지함</Typography>
            </Paper>

            {/* 채팅 목록 */}
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {chatList.length > 0 ? (
                    chatList.map((user, index) => (
                        <React.Fragment key={index}>
                            <ListItem 
                                button 
                                onClick={() => navigate(`/message/${user.USERID}`)}
                                sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                            >
                                <ListItemAvatar>
                                    <Avatar src={user.IMGPATH} alt={user.NICKNAME} />
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={user.NICKNAME || user.USERID} 
                                    secondary={`@${user.USERID}`} 
                                    primaryTypographyProps={{ fontWeight: 'bold' }}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </React.Fragment>
                    ))
                ) : (
                    <Box sx={{ textAlign: 'center', mt: 5, color: 'text.secondary' }}>
                        <Typography>대화 내역이 없습니다.</Typography>
                    </Box>
                )}
            </List>
        </Box>
    );
}

export default MessageList;