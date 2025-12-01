import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, IconButton, Paper, List, ListItem, ListItemText, 
    ListItemSecondaryAction, Divider
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close'; 
import MailIcon from '@mui/icons-material/Mail'; 
import CommentIcon from '@mui/icons-material/Comment'; 

// JWT 디코딩 헬퍼
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

function Alert() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [alertList, setAlertList] = useState([]);

    // 1. 초기 데이터 로딩
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                setUserId(decoded.userId);
                fetchAlerts(decoded.userId);
                markAllAsRead(decoded.userId);
            } else {
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    // 2. 알림 목록 가져오기
    const fetchAlerts = (id) => {
        fetch(`http://localhost:3010/alert/list/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    setAlertList(data.list);
                }
            })
            .catch(err => console.error("알림 로딩 실패:", err));
    };

    // 3. 모든 알림 읽음 처리
    const markAllAsRead = (id) => {
        fetch(`http://localhost:3010/alert/readAll/${id}`, { method: 'PUT' })
            .then(res => res.json())
            .catch(err => console.error("읽음 처리 실패:", err));
    };

    // 4. 개별 알림 읽음 처리 (클릭 시 호출됨)
    const handleReadAlert = (alertNo, status) => {
        if (status === 'Y') return; 

        fetch(`http://localhost:3010/alert/read/${alertNo}`, { method: 'PUT' })
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    setAlertList(prev => prev.map(item => 
                        item.ALERTNO === alertNo ? { ...item, STATUS: 'Y' } : item
                    ));
                }
            });
    };

    // 5. 알림 삭제
    const handleDeleteAlert = (alertNo) => {

        fetch(`http://localhost:3010/alert/${alertNo}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    setAlertList(prev => prev.filter(item => item.ALERTNO !== alertNo));
                }
            })
            .catch(err => console.error("삭제 실패:", err));
    };

    // 6. [추가] 알림 클릭 시 이동 핸들러
    const handleAlertClick = (alert) => {
        // (1) 클릭했으므로 읽음 처리
        handleReadAlert(alert.ALERTNO, alert.STATUS);

        // (2) 알림 종류에 따른 이동 로직 분기
        if (alert.KIND === 'M') {
            // --- [TODO] 메시지 알림일 때 이동할 경로 작성 ---
            navigate(`/message/${alert.SENDERID}`);
            console.log("메시지 알림 클릭: ", alert);

        } else if (alert.KIND === 'F') {
            // --- [TODO] 댓글 알림일 때 이동할 경로 작성 ---
            navigate(`/personalFeed`, { state: { targetUserId: userId, highlightFeedNo: alert.FEEDNO } });
            console.log("댓글 알림 클릭: ", alert);
            
        } else {
            // 기타 알림
            console.log("기타 알림 클릭");
        }
    };

    // 알림 메시지 생성 함수
    const getAlertMessage = (alert) => {
        const sender = alert.SENDER_NICKNAME || "알 수 없음";
        
        if (alert.KIND === 'M') {
            return (
                <span>
                    <strong>{sender}</strong>에게서 메시지가 왔습니다.
                </span>
            );
        } else if (alert.KIND === 'F') {
            let feedContent = alert.FEED_CONTENT || "게시글";
            if (feedContent.length > 15) {
                feedContent = feedContent.substring(0, 15) + "...";
            }
            
            return (
                <span>
                    <strong>'{feedContent}'</strong> 게시글에 댓글이 달렸습니다.
                </span>
            );
        }
        return alert.CONTENT || "새로운 알림이 있습니다.";
    };

    // 알림 아이콘 선택 함수
    const getAlertIcon = (alert) => {
        const isUnread = alert.STATUS === 'N';
        
        if (alert.KIND === 'M') {
            return <MailIcon color={isUnread ? "primary" : "disabled"} />;
        } else if (alert.KIND === 'F') {
            return <CommentIcon color={isUnread ? "secondary" : "disabled"} />;
        } else {
            return isUnread ? <NotificationsActiveIcon color="error" /> : <CheckCircleOutlineIcon color="disabled" />;
        }
    };

    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, minHeight: '100vh', backgroundColor: '#fff', pb: 10, mx: 'auto' }}>
            
            {/* 상단 헤더 */}
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 0, position: 'sticky', top: 0, zIndex: 10 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">알림</Typography>
            </Paper>

            {/* 알림 리스트 */}
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {alertList.length > 0 ? (
                    alertList.map((alert) => (
                        <React.Fragment key={alert.ALERTNO}>
                            <ListItem 
                                alignItems="center"
                                button // 클릭 가능하게 설정
                                onClick={() => handleAlertClick(alert)} // [수정] 클릭 핸들러 연결
                                sx={{ 
                                    backgroundColor: alert.STATUS === 'N' ? '#fff5f5' : 'white', 
                                    transition: 'background-color 0.3s',
                                    pr: 1 
                                }}
                            >
                                {/* 알림 종류에 따른 아이콘 표시 */}
                                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                                    {getAlertIcon(alert)}
                                </Box>

                                <ListItemText
                                    primary={
                                        <Typography
                                            sx={{ fontSize: '0.95rem' }}
                                            component="span"
                                            color="text.primary"
                                        >
                                            {getAlertMessage(alert)}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            sx={{ display: 'inline', mt: 0.5 }}
                                            component="span"
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {new Date(alert.CDATE).toLocaleString()}
                                        </Typography>
                                    }
                                />
                                
                                {/* 삭제 버튼 */}
                                <ListItemSecondaryAction>
                                    <IconButton 
                                        edge="end" 
                                        aria-label="delete" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // 리스트 클릭 방지
                                            handleDeleteAlert(alert.ALERTNO);
                                        }}
                                        size="small"
                                    >
                                        <CloseIcon fontSize="small" color="action" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
                        <NotificationsActiveIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                        <Typography color="text.secondary">새로운 알림이 없습니다.</Typography>
                    </Box>
                )}
            </List>
        </Box>
    );
}

export default Alert;