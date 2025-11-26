import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
    Box, Typography, Avatar, Grid, Button, Card, CardContent, CardMedia, CardActions, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, Divider
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

function PersonalFeed() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Feed.js에서 넘겨준 유저 정보 받기
    const { targetUserId, targetNickname } = location.state || { targetUserId: "unknown", targetNickname: "알 수 없음" };

    // --- State 관리 (Feed.js와 동일한 구조) ---
    const [userFeeds, setUserFeeds] = useState([]);
    const [userStats, setUserStats] = useState({ posts: 0, followers: 120, following: 45 });
    
    // 모달 및 댓글 관련 State
    const [openModal, setOpenModal] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const commentRef = useRef();

    // 이미지 슬라이드 관련 State
    const [feedImages, setFeedImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 로그인한 내 아이디 (좋아요/댓글 삭제 권한 확인용) - 실제로는 토큰에서 가져와야 함
    // 여기서는 편의상 targetUserId와 다른 값으로 가정하거나, 토큰 로직 추가 필요
    const [myUserId, setMyUserId] = useState(""); 

    useEffect(() => {
        const token = localStorage.getItem("token");
        // 간단한 토큰 디코딩 (실제로는 jwt-decode 함수 사용 권장)
        if(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                setMyUserId(JSON.parse(jsonPayload).userId);
            } catch(e) {}
        }

        // 해당 유저의 피드 목록 가져오기 (API 주소는 서버 상황에 맞게 조정 필요)
        // 예: /feed/user/:userId/limit
        fetch(`http://localhost:3010/feed/${targetUserId}/100`) 
            .then(res => res.json())
            .then(data => {
                if (data.list) {
                    setUserFeeds(data.list);
                    setUserStats(prev => ({ ...prev, posts: data.list.length }));
                }
            })
            .catch(err => console.error(err));
    }, [targetUserId]);

    // --- [Feed.js 로직 복사] 좋아요 토글 ---
    const toggleLike = (feedNo, index) => {
        const newFeedList = [...userFeeds];
        const targetFeed = newFeedList[index];

        if (targetFeed.MY_LIKE > 0) {
            targetFeed.MY_LIKE = 0;
            targetFeed.LIKE_COUNT = (targetFeed.LIKE_COUNT || 0) - 1;
        } else {
            targetFeed.MY_LIKE = 1;
            targetFeed.LIKE_COUNT = (targetFeed.LIKE_COUNT || 0) + 1;
        }
        setUserFeeds(newFeedList);

        fetch(`http://localhost:3010/feed/like/${feedNo}/${myUserId}`);
    };

    // --- [Feed.js 로직 복사] 북마크 토글 ---
    const toggleBookmark = (feedNo, index) => {
        const newFeedList = [...userFeeds];
        const targetFeed = newFeedList[index]; // userFeeds 사용
        if (targetFeed.MY_BOOKMARK > 0) {
            targetFeed.MY_BOOKMARK = 0;
        } else {
            targetFeed.MY_BOOKMARK = 1;
        }
        setUserFeeds(newFeedList);
        fetch(`http://localhost:3010/feed/bookmark/${feedNo}/${myUserId}`);
    };

    // --- [Feed.js 로직 복사] 댓글/이미지 가져오기 ---
    const getComments = (feedNo) => {
        fetch(`http://localhost:3010/feed/comment/${feedNo}`)
            .then(res => res.json())
            .then(data => {
                if(data.list) setComments(data.list);
                if(data.imgList && data.imgList.length > 0) setFeedImages(data.imgList);
                else setFeedImages([]);
            })
            .catch(err => console.error("데이터 로딩 실패:", err));
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
            body: JSON.stringify({ feedNo: selectedFeed.FEEDNO, userId: myUserId, content: content })
        })
        .then(res => res.json())
        .then(() => {
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
            {/* SVG 그라데이션 정의 */}
            <svg width={0} height={0}>
                <linearGradient id="linearColors" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="30%" stopColor="#d32f2f" />
                    <stop offset="90%" stopColor="#ff8a65" />
                </linearGradient>
            </svg>

            {/* 1. 상단 네비게이션 */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIosNewIcon sx={{ color: '#333' }} />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>{targetNickname}</Typography>
            </Box>

            {/* 2. 프로필 섹션 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, px: 4 }}>
                <Box sx={{ p: 0.5, borderRadius: '50%', background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)' }}>
                    <Avatar src="" sx={{ width: 100, height: 100, border: '3px solid white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>{targetNickname}</Typography>
                <Typography variant="body2" color="text.secondary">@{targetUserId}</Typography>
                <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
                    음악을 사랑하는 {targetNickname}입니다. 🎸
                </Typography>
                <Button variant="contained" fullWidth sx={{ mt: 3, borderRadius: 20, background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', fontWeight: 'bold' }}>
                    팔로우
                </Button>
            </Box>

            {/* 3. 스탯 */}
            <Grid container sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
                <Grid item xs={4}>
                    <Typography variant="h6" fontWeight="bold">{userStats.posts}</Typography>
                    <Typography variant="caption" color="text.secondary">게시물</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="h6" fontWeight="bold">{userStats.followers}</Typography>
                    <Typography variant="caption" color="text.secondary">팔로워</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="h6" fontWeight="bold">{userStats.following}</Typography>
                    <Typography variant="caption" color="text.secondary">팔로잉</Typography>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* 4. 피드 리스트 (Feed.js 스타일) */}
            <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto', px: 2 }}>
                {userFeeds.length > 0 ? (
                    userFeeds.map((item, index) => (
                        <Card key={index} sx={{ mb: 4, width: '100%', boxShadow: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6">{item.NICKNAME}</Typography>
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
                                    <IconButton aria-label="bookmark" onClick={() => toggleBookmark(item.FEEDNO, index)}>
                                        {item.MY_BOOKMARK > 0 ? <BookmarkIcon sx={{ fill: "url(#linearColors)" }} /> : <BookmarkBorderIcon />}
                                    </IconButton>
                                </Box>
                            </CardActions>
                        </Card>
                    ))
                ) : (
                    <Typography textAlign="center" color="text.secondary">게시물이 없습니다.</Typography>
                )}
            </Box>

            {/* 5. 상세 모달 (Feed.js와 동일) */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                {selectedFeed && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{selectedFeed.NICKNAME}</Typography>
                            <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                        </DialogTitle>
                        
                        <DialogContent dividers>
                            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{selectedFeed.CONTENT}</Typography>
                            
                            {/* 이미지 슬라이드 */}
                            {feedImages.length > 0 ? (
                                <Box sx={{ position: 'relative', width: '100%', height: 'auto', mb: 2, backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {feedImages.length > 1 && (
                                        <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                                            <ArrowBackIosNewIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    <Box component="img" src={feedImages[currentImageIndex].IMGPATH} sx={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: 1 }} />
                                    {feedImages.length > 1 && (
                                        <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    {feedImages.length > 1 && (
                                        <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, borderRadius: 1 }}>
                                            {currentImageIndex + 1} / {feedImages.length}
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                selectedFeed.IMGPATH && <Box component="img" src={selectedFeed.IMGPATH} sx={{ width: '100%', borderRadius: 1, mb: 2 }} />
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>댓글</Typography>
                            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                {comments.map((comment) => (
                                    <ListItem key={comment.COMMENTNO} alignItems="flex-start" sx={{ px: 0 }}
                                        secondaryAction={comment.USERID === myUserId && (
                                            <IconButton edge="end" size="small" onClick={() => handleDeleteComment(comment.COMMENTNO)}><CloseIcon fontSize="small" /></IconButton>
                                        )}>
                                        <ListItemText 
                                            primary={comment.NICKNAME || comment.USERID} 
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">{comment.CONTENT}</Typography>
                                                    <br />
                                                    <Typography component="span" variant="caption" color="text.secondary">{new Date(comment.CDATE).toLocaleDateString()}</Typography>
                                                </>
                                            } 
                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </DialogContent>

                        <DialogActions sx={{ p: 2 }}>
                            <TextField
                                fullWidth size="small" placeholder="댓글 달기..." inputRef={commentRef}
                                InputProps={{ endAdornment: (<IconButton onClick={handleAddComment}><SendIcon color="primary" /></IconButton>) }}
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }}
                            />
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}

export default PersonalFeed;