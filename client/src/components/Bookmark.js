import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Button, Card, CardContent, CardMedia, CardActions, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, Divider, Stack, ListItemAvatar, Avatar
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; 

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

function Bookmark() {
    const navigate = useNavigate();
    
    // State 관리
    const [feedCount, setFeedCount] = useState(3);
    const [userId, setUserId] = useState("");
    const [feedList, setFeedList] = useState([]);

    // 모달 및 댓글 관련 State
    const [openModal, setOpenModal] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const commentRef = useRef();

    // 이미지 슬라이드 관련 State
    const [feedImages, setFeedImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 북마크 목록 가져오기 함수
    function getBookmarkFeeds(id, count) {
        fetch(`http://localhost:3010/feed/bookmark/list/${id}/${count}`)
            .then(res => res.json())
            .then(data => {
                if (data.list) {
                    setFeedList(data.list);
                }
            })
            .catch(err => console.error("Error loading bookmarks:", err));
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded && decoded.userId) {
                setUserId(decoded.userId);
                getBookmarkFeeds(decoded.userId, 3);
            } else {
                alert("로그인이 필요합니다.");
                navigate("/login");
            }
        } else {
            alert("로그인이 필요합니다.");
            navigate("/login");
        }
    }, [navigate]);

    // 더보기 버튼 핸들러
    const handleLoadMore = () => {
        const nextCount = feedCount + 3;
        setFeedCount(nextCount);
        getBookmarkFeeds(userId, nextCount);
    };

    // --- 좋아요 토글 ---
    const toggleLike = (feedNo, index) => {
        const newFeedList = [...feedList];
        const targetFeed = newFeedList[index];
        if (targetFeed.MY_LIKE > 0) {
            targetFeed.MY_LIKE = 0;
            targetFeed.LIKE_COUNT = (targetFeed.LIKE_COUNT || 0) - 1;
        } else {
            targetFeed.MY_LIKE = 1;
            targetFeed.LIKE_COUNT = (targetFeed.LIKE_COUNT || 0) + 1;
        }
        setFeedList(newFeedList);
        fetch(`http://localhost:3010/feed/like/${feedNo}/${userId}`);
    };

    // --- [수정됨] 북마크 토글 (리스트 갱신 로직) ---
    const toggleBookmark = (feedNo) => {
        // 북마크 페이지에서는 아이콘을 누르면 '해제'를 의미하므로
        // 1. 화면 리스트에서 해당 피드를 즉시 제거합니다. (filter 사용)
        const newFeedList = feedList.filter(item => item.FEEDNO !== feedNo);
        setFeedList(newFeedList);

        // 2. 서버에 해제 요청을 보냅니다.
        fetch(`http://localhost:3010/feed/bookmark/${feedNo}/${userId}`)
            .catch(err => console.error("Bookmark toggle error:", err));
    };

    // --- 댓글/이미지 가져오기 ---
    const getComments = (feedNo) => {
        fetch(`http://localhost:3010/feed/comment/${feedNo}`)
            .then(res => res.json())
            .then(data => {
                if(data.list) setComments(data.list);
                if(data.imgList && data.imgList.length > 0) setFeedImages(data.imgList);
                else setFeedImages([]);
            });
    };

    // --- 모달 핸들러 ---
    const handleOpenModal = (feed) => {
        setSelectedFeed(feed);
        setOpenModal(true);
        setCurrentImageIndex(0);
        getComments(feed.FEEDNO);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedFeed(null);
        setComments([]);
        setFeedImages([]);
    };

    // --- 이미지 슬라이드 핸들러 ---
    const handleNextImage = () => setCurrentImageIndex((prev) => (prev + 1) % feedImages.length);
    const handlePrevImage = () => setCurrentImageIndex((prev) => (prev - 1 + feedImages.length) % feedImages.length);

    // --- 댓글 작성 ---
    const handleAddComment = () => {
        const content = commentRef.current.value;
        if(!content) return;
        fetch('http://localhost:3010/feed/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedNo: selectedFeed.FEEDNO, userId: userId, content: content })
        }).then(res => res.json()).then(() => {
            commentRef.current.value = ""; 
            getComments(selectedFeed.FEEDNO);
        });
    };

    // --- 댓글 삭제 ---
    const handleDeleteComment = (commentNo) => {
        if(!window.confirm("댓글을 삭제하시겠습니까?")) return;
        fetch(`http://localhost:3010/feed/comment/${commentNo}`, { method: 'DELETE' })
            .then(() => getComments(selectedFeed.FEEDNO));
    };

    return (
        <Box sx={{ width:'80%', minHeight: '100vh', backgroundColor: 'white', pb: 10, mx: 'auto' }}>
            {/* 그라데이션 정의 */}
            <svg width={0} height={0}>
                <linearGradient id="linearColors" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="30%" stopColor="#d32f2f" />
                    <stop offset="90%" stopColor="#ff8a65" />
                </linearGradient>
            </svg>

            <Typography component="h1" variant="h5" gutterBottom sx={{ mt: 4, mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                북마크
            </Typography>

            {/* 북마크 리스트 */}
            <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto', px: 2 }}>
                {feedList.length > 0 ? (
                    feedList.map((item, index) => (
                        <Card key={index} sx={{ mb: 4, width: '100%', boxShadow: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    {/* 닉네임 클릭 시 해당 유저 피드로 이동 */}
                                    <Typography 
                                        variant="h6" 
                                        sx={{ cursor: "pointer", fontWeight: 'bold' }}
                                        onClick={() => {
                                            navigate("/personalFeed", { 
                                                state: { 
                                                    targetUserId: item.USERID, 
                                                    targetNickname: item.NICKNAME || item.USERID 
                                                } 
                                            });
                                        }}
                                    >
                                        {item.NICKNAME || item.USERID}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{item.CDATE}</Typography>
                                </Box>
                                {item.IMGPATH && (
                                    <CardMedia 
                                        component="img" 
                                        sx={{ width: "100%", height: "500px", objectFit: "contain", backgroundColor: "#f5f5f5", borderRadius: 1, mb: 2 }} 
                                        image={item.IMGPATH} 
                                    />
                                )}
                                <Typography variant="body1" sx={{ mb: 2 }}>{item.CONTENT}</Typography>
                            </CardContent>
                            <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 0.5, minWidth: '15px', textAlign: 'center' }}>
                                        {item.LIKE_COUNT > 0 ? item.LIKE_COUNT : ""}
                                    </Typography>
                                    <IconButton aria-label="like" onClick={() => toggleLike(item.FEEDNO, index)}>
                                        {item.MY_LIKE > 0 ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                    <IconButton aria-label="comment" onClick={() => handleOpenModal(item)}>
                                        <ChatBubbleOutlineIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    {/* [수정] 북마크 아이콘 클릭 시 리스트에서 제거 */}
                                    <IconButton aria-label="bookmark" onClick={() => toggleBookmark(item.FEEDNO)}>
                                        {/* 북마크 페이지이므로 항상 채워진 아이콘 표시 */}
                                        <BookmarkIcon sx={{ fill: "url(#linearColors)" }} />
                                    </IconButton>
                                </Box>
                            </CardActions>
                        </Card>
                    ))
                ) : (
                    <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
                        북마크한 게시물이 없습니다.
                    </Typography>
                )}
            </Box>

            {/* 상세 모달 (Feed.js와 동일) */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                {selectedFeed && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{selectedFeed.NICKNAME || selectedFeed.USERID}</Typography>
                            <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{selectedFeed.CONTENT}</Typography>
                            
                            {/* 이미지 슬라이드 */}
                            {feedImages.length > 0 ? (
                                <Box sx={{ position: 'relative', width: '100%', height: 'auto', mb: 2, backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {feedImages.length > 1 && (
                                        <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)' }}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
                                    )}
                                    <Box component="img" src={feedImages[currentImageIndex].IMGPATH} sx={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: 1 }} />
                                    {feedImages.length > 1 && (
                                        <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)' }}><ArrowForwardIosIcon fontSize="small" /></IconButton>
                                    )}
                                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, borderRadius: 1 }}>
                                        {currentImageIndex + 1} / {feedImages.length}
                                    </Typography>
                                </Box>
                            ) : (
                                selectedFeed.IMGPATH && <Box component="img" src={selectedFeed.IMGPATH} sx={{ width: '100%', borderRadius: 1, mb: 2 }} />
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* 댓글 리스트 */}
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>댓글</Typography>
                            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                {comments.map((comment) => (
                                    <ListItem key={comment.COMMENTNO} alignItems="flex-start" sx={{ px: 0 }}
                                        secondaryAction={comment.USERID === userId && (
                                            <IconButton edge="end" size="small" onClick={() => handleDeleteComment(comment.COMMENTNO)}><CloseIcon fontSize="small" /></IconButton>
                                        )}>
                                        <ListItemText 
                                            // 댓글 닉네임 클릭 시 이동
                                            primary={
                                                <Typography 
                                                    variant="subtitle2" component="span" sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                    onClick={() => {
                                                        handleCloseModal();
                                                        navigate("/personalFeed", { state: { targetUserId: comment.USERID, targetNickname: comment.NICKNAME || comment.USERID } });
                                                    }}
                                                >
                                                    {comment.NICKNAME || comment.USERID}
                                                </Typography>
                                            } 
                                            secondary={<><Typography component="span" variant="body2" color="text.primary">{comment.CONTENT}</Typography><br /><Typography component="span" variant="caption" color="text.secondary">{new Date(comment.CDATE).toLocaleDateString()}</Typography></>} 
                                            primaryTypographyProps={{ fontWeight: 'bold' }} />
                                    </ListItem>
                                ))}
                            </List>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <TextField fullWidth size="small" placeholder="댓글 달기..." inputRef={commentRef} InputProps={{ endAdornment: (<IconButton onClick={handleAddComment}><SendIcon color="primary" /></IconButton>) }} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }} />
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* 더보기 버튼 */}
            <Button variant="contained" sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', minWidth: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' }, padding: 0, zIndex: 1100 }} onClick={handleLoadMore}>
                <ArrowDownwardIcon />
            </Button>
        </Box>
    );
}

export default Bookmark;