import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, TextField, InputAdornment, IconButton, Paper, Stack, Grid, Avatar, Card, CardContent, 
    FormControl, InputLabel, Select, MenuItem, Button, CardActions,
    // 모달 관련 컴포넌트
    Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider
} from "@mui/material";

// 아이콘
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'; // 이미지 슬라이드
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CloseIcon from '@mui/icons-material/Close'; // 모달 닫기
import SendIcon from '@mui/icons-material/Send'; // 댓글 전송

// JWT 디코딩 헬퍼 (로그인 유저 ID 추출)
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

function Search() {
    const navigate = useNavigate();
    const [currentSearchTerm, setCurrentSearchTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState({ users: [], feeds: [] });
    const [myUserId, setMyUserId] = useState("");
    const [searchType, setSearchType] = useState('feed'); 
    
    // --- [통합] 모달 관련 State ---
    const [openModal, setOpenModal] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const commentRef = useRef();
    const [feedImages, setFeedImages] = useState([]); 
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) setMyUserId(decoded.userId);
        }
    }, []);

    // 1. 검색 API 호출
    useEffect(() => {
        if (searchTerm.trim().length === 0) {
            setResults({ users: [], feeds: [] });
            return;
        }
        
        console.log(`[검색 요청] 타입: ${searchType}, 검색어: ${searchTerm}`);

        fetch("http://localhost:3010/feed/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ 
                q: searchTerm,
                type: searchType,
                userId: myUserId 
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                console.log("[검색 결과 성공]:", data); 
                setResults({ 
                    users: data.users || [], 
                    feeds: data.feeds || [] 
                });
            } else {
                console.warn("[검색 실패]:", data);
                   setResults({ users: [], feeds: [] });
            }
        })
        .catch(err => {
            console.error("[통신 오류]:", err);
            setResults({ users: [], feeds: [] });
        });
    }, [searchTerm, searchType, myUserId]); 
    
    const handleSearch = () => {
        setSearchTerm(currentSearchTerm);
    };


    // --- 2. 좋아요, 북마크, 댓글 로직 (Feed.js 로직 통합) ---

    // 좋아요 토글
    const toggleLike = (feedNo) => {
        const newFeeds = results.feeds.map(feed => {
            if (feed.FEEDNO === feedNo) {
                const isCurrentlyLiked = feed.MY_LIKE === 1;
                return {
                    ...feed,
                    MY_LIKE: isCurrentlyLiked ? 0 : 1,
                    LIKE_COUNT: (feed.LIKE_COUNT || 0) + (isCurrentlyLiked ? -1 : 1)
                };
            }
            return feed;
        });

        setResults(prev => ({ ...prev, feeds: newFeeds }));
        fetch(`http://localhost:3010/feed/like/${feedNo}/${myUserId}`);
    };
    
    // 북마크 토글
    const toggleBookmark = (feedNo) => {
        const newFeeds = results.feeds.map(feed => {
            if (feed.FEEDNO === feedNo) {
                const isCurrentlyBookmarked = feed.MY_BOOKMARK === 1;
                return {
                    ...feed,
                    MY_BOOKMARK: isCurrentlyBookmarked ? 0 : 1
                };
            }
            return feed;
        });

        setResults(prev => ({ ...prev, feeds: newFeeds }));
        fetch(`http://localhost:3010/feed/bookmark/${feedNo}/${myUserId}`);
    };
    
    // 댓글 및 이미지 목록 가져오기
    const getComments = (feedNo) => {
        fetch(`http://localhost:3010/feed/comment/${feedNo}`)
            .then(res => res.json())
            .then(data => {
                if(data.list) setComments(data.list);
                if(data.imgList && data.imgList.length > 0) setFeedImages(data.imgList);
                else setFeedImages([]);
            })
            .catch(err => console.error("댓글 로딩 실패:", err));
    };

    // 모달 열기 핸들러
    const handleOpenModal = (feed) => {
        setSelectedFeed(feed);
        setOpenModal(true);
        setCurrentImageIndex(0); // 이미지 슬라이더 초기화
        getComments(feed.FEEDNO);
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedFeed(null);
        setComments([]);
        setFeedImages([]);
    };
    
    // 댓글 작성
    const handleAddComment = () => {
        const content = commentRef.current.value;
        if(!content) return;

        fetch('http://localhost:3010/feed/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedNo: selectedFeed.FEEDNO, userId: myUserId, content: content })
        })
        .then(res => res.json())
        .then(data => {
            commentRef.current.value = ""; 
            getComments(selectedFeed.FEEDNO); // 목록 갱신
        })
        .catch(err => console.error("댓글 작성 실패:", err));
    };
    
    // 댓글 삭제
    const handleDeleteComment = (commentNo) => {
        if(!window.confirm("댓글을 삭제하시겠습니까?")) return;
        
        fetch(`http://localhost:3010/feed/comment/${commentNo}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(() => {
            getComments(selectedFeed.FEEDNO); // 목록 갱신
        })
        .catch(err => console.error("댓글 삭제 실패:", err));
    };
    
    const handleNextImage = () => setCurrentImageIndex((prev) => (prev + 1) % feedImages.length);
    const handlePrevImage = () => setCurrentImageIndex((prev) => (prev - 1 + feedImages.length) % feedImages.length);
    
    const handleUserClick = (user) => {
        navigate("/personalFeed", { state: { targetUserId: user.USERID, targetNickname: user.NICKNAME } });
    };

    // 5. 피드 카드 렌더링 함수
    const renderFeedCard = (item) => {
        const isLiked = item.MY_LIKE === 1;
        const isBookmarked = item.MY_BOOKMARK === 1;

        const handleUserClickInternal = (e) => {
            e.stopPropagation(); 
            handleUserClick(item);
        };
        
        const handleFeedClickInternal = (e) => {
             e.stopPropagation(); 
             handleOpenModal(item);
        };

        const handleLikeClick = (e) => {
            e.stopPropagation();
            toggleLike(item.FEEDNO);
        };
        
        const handleBookmarkClick = (e) => {
            e.stopPropagation();
            toggleBookmark(item.FEEDNO);
        };

        return (
            <Grid item xs={12} key={item.FEEDNO} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card 
                    sx={{ 
                        width: '100%', 
                        maxWidth: '600px', 
                        borderRadius: 3, 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                        mb: 3, // 세로 간격 추가
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 15px rgba(0,0,0,0.1)' }
                    }}
                >
                    {/* 상단: 사용자 정보 */}
                    <CardContent sx={{ pb: 1.5, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleUserClickInternal}>
                        <Avatar 
                            alt={item.NICKNAME} 
                            src={item.USER_IMGPATH || 'https://placehold.co/100x100/CCCCCC/333333?text=Profile'}
                            sx={{ width: 36, height: 36, mr: 1.5 }}
                        />
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2, color: '#333' }}>
                                {item.NICKNAME}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(item.CDATE).toLocaleDateString('ko-KR')}
                            </Typography>
                        </Box>
                    </CardContent>

                    {/* 메인 콘텐츠: 이미지 */}
                    {item.IMGPATH && (
                        <Box 
                            sx={{ 
                                height: '500px', 
                                overflow: 'hidden',
                                cursor: 'pointer',
                                backgroundColor: '#f5f5f5' 
                            }}
                            onClick={handleFeedClickInternal}
                        >
                            <img 
                                src={item.IMGPATH} 
                                alt="Feed Image" 
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/CCCCCC/333333?text=No+Image'; }}
                            />
                        </Box>
                    )}

                    {/* 액션 버튼 */}
                    <CardActions sx={{ py: 0.5, px: 1, justifyContent: 'space-between' }}>
                        <Box>
                            <IconButton onClick={handleLikeClick} sx={{ color: isLiked ? '#d32f2f' : 'text.secondary' }}>
                                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                            <IconButton onClick={handleFeedClickInternal} sx={{ color: 'text.secondary' }}>
                                <ChatBubbleOutlineIcon />
                            </IconButton>
                        </Box>
                        {/* 북마크 버튼 */}
                        <Box>
                            <IconButton onClick={handleBookmarkClick} sx={{ color: isBookmarked ? '#333' : 'text.secondary' }}>
                                {isBookmarked ? <BookmarkIcon sx={{ fill: "url(#linearColors)" }} /> : <BookmarkBorderIcon />}
                            </IconButton>
                        </Box>
                    </CardActions>

                    {/* 요약 정보 */}
                    <CardContent sx={{ pt: 0, pb: 2, px: 2 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                            좋아요 {item.LIKE_COUNT || 0}개
                        </Typography>
                        {/* 피드 내용 미리보기 */}
                        <Typography 
                            variant="body2" 
                            color="text.primary" 
                            sx={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                display: '-webkit-box', 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical',
                                cursor: 'pointer'
                            }}
                            onClick={handleFeedClickInternal}
                        >
                            {item.CONTENT}
                        </Typography>
                        
                        {/* 댓글 더보기 */}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', cursor: 'pointer' }} onClick={handleFeedClickInternal}>
                            댓글 보기...
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    };


    return (
        <Box sx={{ width: { xs: '100%', md: '80%' }, minHeight: '100vh', backgroundColor: '#fff', pb: 10, mx: 'auto' }}>
            {/* SVG 그라데이션 정의 */}
            <svg width={0} height={0}>
                <linearGradient id="linearColors" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="30%" stopColor="#d32f2f" />
                    <stop offset="90%" stopColor="#ff8a65" />
                </linearGradient>
            </svg>
            
            {/* 1. 상단 검색 바 */}
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 0 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Stack direction="row" spacing={1} flexGrow={1}>
                    {/* 검색 타입 선택 Select Box */}
                    <FormControl variant="outlined" size="small" sx={{ width: 120 }}>
                        <InputLabel id="search-type-label">검색 대상</InputLabel>
                        <Select
                            labelId="search-type-label"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            label="검색 대상"
                        >
                            <MenuItem value={'feed'}>피드</MenuItem>
                            <MenuItem value={'user'}>사용자</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField 
                        fullWidth 
                        variant="outlined" 
                        placeholder="검색어를 입력하세요" 
                        size="small"
                        value={currentSearchTerm} 
                        onChange={(e) => setCurrentSearchTerm(e.target.value)} 
                        onKeyDown={(e) => { if(e.key === 'Enter') handleSearch(); }} 
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 5, backgroundColor: '#f5f5f5', border: 'none' }
                        }}
                    />
                    
                    {/* 검색 실행 버튼 */}
                    <Button 
                        variant="contained" 
                        onClick={handleSearch}
                        disabled={currentSearchTerm.trim().length === 0}
                        sx={{ 
                            background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                            color: 'white',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            height: 40
                        }}
                    >
                        검색
                    </Button>

                </Stack>
            </Paper>

            {/* 2. 검색 결과 영역 */}
            <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
                
                {searchTerm.trim().length > 0 && results.users.length === 0 && results.feeds.length === 0 && (
                    <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
                        '{searchTerm}'에 대한 결과가 없습니다.
                    </Typography>
                )}
                
                {/* 2-A. 유저 결과 섹션 */}
                {results.users.length > 0 && searchType !== 'feed' && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                            <PersonIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} /> 사용자 ({results.users.length})
                        </Typography>
                        
                        <Stack spacing={1}>
                            {results.users.map((user) => (
                                <Paper 
                                    key={user.USERID} 
                                    onClick={() => handleUserClick(user)}
                                    sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                                >
                                    <Avatar src={user.IMGPATH} sx={{ width: 40, height: 40, mr: 2 }} />
                                    <Box>
                                        <Typography fontWeight="bold">{user.NICKNAME}</Typography>
                                        <Typography variant="caption" color="text.secondary">@{user.USERID}</Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* 2-B. 피드 결과 섹션 (FeedItemCard 로직 통합) */}
                {results.feeds.length > 0 && searchType !== 'user' && (
                    <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>
                            <ChatBubbleOutlineIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} /> 피드 ({results.feeds.length})
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                            {results.feeds.map((item) => renderFeedCard(item))}
                        </Grid>
                    </Box>
                )}

            </Box>
            
            {/* --- 피드 상세 모달 (Feed.js 로직 통합) --- */}
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
                                    <Box component="img" src={feedImages[currentImageIndex]?.IMGPATH} sx={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: 1 }} />
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
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <TextField fullWidth size="small" placeholder="댓글 달기..." ref={commentRef} InputProps={{ endAdornment: (<IconButton onClick={handleAddComment}><SendIcon color="primary" /></IconButton>) }} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }} />
                        </DialogActions>
                    </>
                )}
            </Dialog>

        </Box>
    );
}

export default Search;  