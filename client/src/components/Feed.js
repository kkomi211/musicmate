import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Fab, Button, Card, CardContent, CardMedia, CardActions, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, Divider
} from "@mui/material";

// 아이콘 임포트
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
// [추가] 이미지 슬라이드용 화살표 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

function Feed() {
    const navigate = useNavigate();
    const [feedCount, setFeedCount] = useState(3);
    const [userId, setUserId] = useState("");
    const [feedList, setFeedList] = useState([]);

    // --- 모달, 댓글, 이미지 관련 State ---
    const [openModal, setOpenModal] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const commentRef = useRef();

    // [추가] 이미지 슬라이드 관련 State
    const [feedImages, setFeedImages] = useState([]); // 해당 피드의 모든 이미지
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 보고 있는 이미지 순서

    // 피드 목록 가져오기
    function getFeeds(id, count) {
        fetch(`http://localhost:3010/feed/${id}/${count}`)
            .then(res => res.json())
            .then(data => {
                if (data.list) setFeedList(data.list);
            })
            .catch(err => console.error(err));
    }

    // 좋아요 토글
    const toggleLike = (feedNo, index) => {
        const newFeedList = [...feedList];
        newFeedList[index].MY_LIKE = !newFeedList[index].MY_LIKE;
        newFeedList[index].LIKE_COUNT += newFeedList[index].MY_LIKE ? 1 : -1;
        setFeedList(newFeedList);
        fetch(`http://localhost:3010/feed/like/${feedNo}/${userId}`);
    };

    // 북마크 토글
    const toggleBookmark = (feedNo, index) => {
        const newFeedList = [...feedList];
        newFeedList[index].MY_BOOKMARK = !newFeedList[index].MY_BOOKMARK;
        setFeedList(newFeedList);
        fetch(`http://localhost:3010/feed/bookmark/${feedNo}/${userId}`);
    };

    // [수정] 댓글 및 이미지 목록 가져오기 (서버 변경 반영)
    const getComments = (feedNo) => {
        fetch(`http://localhost:3010/feed/comment/${feedNo}`)
            .then(res => res.json())
            .then(data => {
                // 댓글 리스트 설정
                if (data.list) {
                    setComments(data.list);
                }
                // 이미지 리스트 설정 (서버에서 imgList로 반환)
                if (data.imgList && data.imgList.length > 0) {
                    setFeedImages(data.imgList);
                } else {
                    setFeedImages([]);
                }
            })
            .catch(err => console.error("데이터 로딩 실패:", err));
    };

    // --- 모달 열기 ---
    const handleOpenModal = (feed) => {
        setSelectedFeed(feed);
        setOpenModal(true);
        setCurrentImageIndex(0); // 인덱스 초기화

        // 댓글 및 이미지 로딩 (이제 getComments가 둘 다 처리함)
        getComments(feed.FEEDNO);
    };

    // --- 모달 닫기 ---
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedFeed(null);
        setComments([]);
        setFeedImages([]); // 이미지 목록 초기화
    };

    // --- 이미지 슬라이드 핸들러 ---
    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % feedImages.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + feedImages.length) % feedImages.length);
    };

    // --- 댓글 작성 ---
    const handleAddComment = () => {
        const content = commentRef.current.value;
        if (!content) return;

        fetch('http://localhost:3010/feed/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedNo: selectedFeed.FEEDNO, userId: userId, content: content })
        })
            .then(res => res.json())
            .then(() => {
                commentRef.current.value = "";
                getComments(selectedFeed.FEEDNO);
            })
            .catch(err => console.error("댓글 작성 실패:", err));
    };

    // --- 댓글 삭제 ---
    const handleDeleteComment = (commentNo) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

        fetch(`http://localhost:3010/feed/comment/${commentNo}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(() => {
                getComments(selectedFeed.FEEDNO);
            })
            .catch(err => console.error("댓글 삭제 실패:", err));
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded && decoded.userId) {
                setUserId(decoded.userId);
                getFeeds(decoded.userId, 3);
            } else navigate("/login");
        } else navigate("/login");
    }, [navigate]);

    const handleLoadMore = () => {
        const nextCount = feedCount + 3;
        setFeedCount(nextCount);
        getFeeds(userId, nextCount);
    };

    return (
        <Box sx={{
            p: 4, marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: 4, border: '1px solid #ccc', borderRadius: 2, boxShadow: 3,
            backgroundColor: 'white', minHeight: '100vh', pb: 10
        }}>
            {/* SVG 그라데이션 정의 */}
            <svg width={0} height={0}>
                <linearGradient id="linearColors" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="30%" stopColor="#d32f2f" />
                    <stop offset="90%" stopColor="#ff8a65" />
                </linearGradient>
            </svg>

            <Typography component="h1" variant="h5" gutterBottom>
                피드
            </Typography>

            <Box sx={{ width: '100%', mb: 4 }}>
                {feedList.length > 0 ? (
                    feedList.map((item, index) => (
                        <Card key={index} sx={{ mb: 4, width: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    {/* [수정] USERID -> NICKNAME */}
                                    <Typography
                                        variant="h6"
                                        sx={{ cursor: "pointer", fontWeight: 'bold' }}
                                        onClick={() => {
                                            // 클릭 시 해당 유저의 정보를 state로 담아서 이동
                                            navigate("/personalFeed", {
                                                state: {
                                                    targetUserId: item.USERID,
                                                    targetNickname: item.NICKNAME
                                                }
                                            });
                                        }}
                                    >{item.NICKNAME}</Typography>
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

                            {/* 하단 아이콘 영역 */}
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
                ) : (<Typography>게시물이 없습니다.</Typography>)}
            </Box>

            {/* --- 피드 상세 모달 (Dialog) --- */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm"
            >
                {selectedFeed && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* [수정] USERID -> NICKNAME */}
                            <Typography variant="h6">{selectedFeed.NICKNAME}</Typography>
                            <IconButton onClick={handleCloseModal}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent dividers>
                            {/* 1. 원본 글 내용 */}
                            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                {selectedFeed.CONTENT}
                            </Typography>

                            {/* 2. 이미지 슬라이드 영역 */}
                            {feedImages.length > 0 ? (
                                <Box sx={{ position: 'relative', width: '100%', height: 'auto', mb: 2, backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                                    {/* 왼쪽 화살표 (이미지가 2장 이상일 때만 표시) */}
                                    {feedImages.length > 1 && (
                                        <IconButton
                                            onClick={handlePrevImage}
                                            sx={{ position: 'absolute', left: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'white' } }}
                                        >
                                            <ArrowBackIosNewIcon fontSize="small" />
                                        </IconButton>
                                    )}

                                    {/* 현재 이미지 */}
                                    <Box
                                        component="img"
                                        src={feedImages[currentImageIndex].IMGPATH}
                                        sx={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: 1 }}
                                    />

                                    {/* 오른쪽 화살표 (이미지가 2장 이상일 때만 표시) */}
                                    {feedImages.length > 1 && (
                                        <IconButton
                                            onClick={handleNextImage}
                                            sx={{ position: 'absolute', right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'white' } }}
                                        >
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </IconButton>
                                    )}

                                    {/* 페이지 표시 (1/3) */}
                                    {feedImages.length > 1 && (
                                        <Typography
                                            variant="caption"
                                            sx={{ position: 'absolute', bottom: 10, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}
                                        >
                                            {currentImageIndex + 1} / {feedImages.length}
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                /* 이미지가 없는 경우나 로딩 중일 때 (백업용) */
                                selectedFeed.IMGPATH && (
                                    <Box
                                        component="img"
                                        src={selectedFeed.IMGPATH}
                                        sx={{ width: '100%', borderRadius: 1, mb: 2 }}
                                    />
                                )
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* 3. 댓글 리스트 */}
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>댓글</Typography>
                            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                {comments.map((comment) => (
                                    <ListItem
                                        key={comment.COMMENTNO}
                                        alignItems="flex-start"
                                        sx={{ px: 0 }}
                                        secondaryAction={
                                            comment.USERID === userId && (
                                                <IconButton edge="end" aria-label="delete" size="small" onClick={() => handleDeleteComment(comment.COMMENTNO)}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            )
                                        }
                                    >
                                        <ListItemText
                                            // [수정] USERID -> NICKNAME (서버에서 NICKNAME을 반환해준다고 가정)
                                            // NICKNAME이 없을 경우 USERID를 표시하도록 폴백 추가
                                            primary={comment.NICKNAME}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {comment.CONTENT}
                                                    </Typography>
                                                    <br />
                                                    <Typography component="span" variant="caption" color="text.secondary">
                                                        {new Date(comment.CDATE).toLocaleDateString()}
                                                    </Typography>
                                                </>
                                            }
                                            primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                                        />
                                    </ListItem>
                                ))}
                                {comments.length === 0 && <Typography variant="body2" color="text.secondary">첫 댓글을 남겨보세요!</Typography>}
                            </List>
                        </DialogContent>

                        <DialogActions sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="댓글 달기..."
                                inputRef={commentRef}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={handleAddComment} edge="end">
                                            <SendIcon color="primary" />
                                        </IconButton>
                                    ),
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* 고정 버튼들 */}
            <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24, background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', zIndex: 1100 }} onClick={() => navigate("/feedAdd")}>
                <AddIcon />
            </Fab>
            <Button variant="contained" sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', minWidth: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', padding: 0, zIndex: 1100 }} onClick={handleLoadMore}>
                <ArrowDownwardIcon />
            </Button>
        </Box>
    );
}

export default Feed;