import { useEffect, useState, useRef } from "react"; // useRef 추가
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Fab, Button, Card, CardContent, CardMedia, CardActions, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, Divider
} from "@mui/material"; // Dialog 관련 컴포넌트 추가

// 아이콘 임포트
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CloseIcon from '@mui/icons-material/Close'; // 닫기 아이콘 추가
import SendIcon from '@mui/icons-material/Send';   // 전송 아이콘 추가

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

    // --- [추가] 모달 및 댓글 관련 State ---
    const [openModal, setOpenModal] = useState(false); // 모달 열림 여부
    const [selectedFeed, setSelectedFeed] = useState(null); // 선택된 피드 정보
    const [comments, setComments] = useState([]); // 댓글 목록
    const commentRef = useRef(); // 댓글 입력창 참조

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

    // --- [추가] 댓글 목록 가져오기 함수 (재사용) ---
    const getComments = (feedNo) => {
        fetch(`http://localhost:3010/feed/comment/${feedNo}`)
            .then(res => res.json())
            .then(data => {
                if(data.list) {
                    setComments(data.list);
                }
            })
            .catch(err => console.error("댓글 로딩 실패:", err));
    };

    // --- [수정] 모달 열기 (댓글 아이콘 클릭 시) ---
    const handleOpenModal = (feed) => {
        setSelectedFeed(feed); // 선택된 피드 저장
        setOpenModal(true);    // 모달 열기
        getComments(feed.FEEDNO); // 댓글 목록 불러오기
    };

    // --- [추가] 모달 닫기 ---
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedFeed(null);
        setComments([]);
    };

    // --- [수정] 댓글 작성 함수 ---
    const handleAddComment = () => {
        const content = commentRef.current.value;
        if(!content) return;

        fetch('http://localhost:3010/feed/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedNo: selectedFeed.FEEDNO, userId: userId, content: content })
        })
        .then(res => res.json())
        .then(() => {
            // 1. 입력창 초기화
            commentRef.current.value = ""; 
            // 2. 댓글 목록 갱신 (DB에서 다시 불러오기)
            getComments(selectedFeed.FEEDNO);
        })
        .catch(err => console.error("댓글 작성 실패:", err));
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
                            {/* ... (카드 상단/이미지/내용 기존 코드 동일) ... */}
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6">{item.USERID}</Typography>
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
                                    
                                    {/* 댓글 아이콘 클릭 시 모달 열기 */}
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
                ) : ( <Typography>게시물이 없습니다.</Typography> )}
            </Box>

            {/* --- 피드 상세 모달 (Dialog) --- */}
            <Dialog 
                open={openModal} 
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm" // 모달 최대 너비 설정
            >
                {selectedFeed && (
                    <>
                        {/* 모달 헤더: 작성자 정보 + 닫기 버튼 */}
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{selectedFeed.USERID}</Typography>
                            <IconButton onClick={handleCloseModal}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        
                        <DialogContent dividers>
                            {/* 1. 원본 글 내용 */}
                            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                {selectedFeed.CONTENT}
                            </Typography>
                            {selectedFeed.IMGPATH && (
                                <Box 
                                    component="img" 
                                    src={selectedFeed.IMGPATH} 
                                    sx={{ width: '100%', borderRadius: 1, mb: 2 }} 
                                />
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* 2. 댓글 리스트 */}
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>댓글</Typography>
                            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                {comments.map((comment) => (
                                    // DB 컬럼명(COMMENTNO, USERID, CONTENT) 사용
                                    <ListItem key={comment.COMMENTNO} alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={comment.USERID}
                                            secondary={comment.CONTENT}
                                            primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(comment.CDATE).toLocaleDateString()}
                                        </Typography>
                                    </ListItem>
                                ))}
                                {comments.length === 0 && <Typography variant="body2" color="text.secondary">첫 댓글을 남겨보세요!</Typography>}
                            </List>
                        </DialogContent>

                        {/* 3. 댓글 입력창 */}
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
                                    if(e.key === 'Enter') {
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