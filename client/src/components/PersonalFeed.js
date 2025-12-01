import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box, Typography, Avatar, Grid, Button, Card, CardContent, CardMedia, CardActions, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, Divider, Stack, ListItemAvatar
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
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';

function PersonalFeed() {
    const navigate = useNavigate();
    const location = useLocation();

    // Feed.js에서 넘겨준 유저 정보 받기
    const { targetUserId, targetNickname } = location.state || { targetUserId: "unknown", targetNickname: "알 수 없음" };
    // let {realNickname, setNickname} = useState(""); // 사용되지 않는 코드 주석 처리 또는 제거

    // --- State 관리 ---
    const [userFeeds, setUserFeeds] = useState([]);
    const [userStats, setUserStats] = useState({ posts: 0, followers: 0, following: 0, instrument: "", profileImg: "", nickname: "" });

    // 피드 개수 관리 (초기 3개)
    const [feedCount, setFeedCount] = useState(3);

    // 모달 및 댓글 관련 State
    const [openModal, setOpenModal] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const commentRef = useRef();

    // 이미지 슬라이드 관련 State
    const [feedImages, setFeedImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 팔로우 모달 State
    const [followModalOpen, setFollowModalOpen] = useState(false);
    const [followType, setFollowType] = useState("");
    const [followList, setFollowList] = useState([]);

    const [myUserId, setMyUserId] = useState("");
    // [추가] 팔로우 상태 관리 (true: 팔로잉 중, false: 미팔로우)
    const [isFollowing, setIsFollowing] = useState(false);

    // [추가] 유저가 변경될 때 상태 초기화
    useEffect(() => {
        setFeedCount(3);
        setUserFeeds([]);
        setUserStats({ posts: 0, followers: 0, following: 0, instrument: "", profileImg: "", nickname: "" });
        setIsFollowing(false); // 팔로우 상태 초기화
        setOpenModal(false);
        setFollowModalOpen(false);
    }, [targetUserId]);

    // 데이터 로딩
    useEffect(() => {
        const token = localStorage.getItem("token");
        let currentId = "";
        if (token) {
            try {


                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                currentId = JSON.parse(jsonPayload).userId;
                const decoded = JSON.parse(jsonPayload);
                console.log(decoded);

                setMyUserId(currentId);
            } catch (e) {
                console.error("Token decoding error:", e);
            }
        }

        // 1. 유저 통계 및 프로필 정보 가져오기
        fetch(`http://localhost:3010/feed/personal/${targetUserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.result === "success" && data.list.length > 0) {
                    const stats = data.list[0];
                    console.log(stats);
                    setUserStats({
                        posts: stats.POST_COUNT,
                        followers: stats.FOLLOWER_COUNT,
                        following: stats.FOLLOWING_COUNT,
                        instrument: stats.INSTRUMENT || "",
                        profileImg: stats.IMGPATH ? stats.IMGPATH : "", // [수정] 프로필 이미지 경로 수정
                        nickname: stats.NICKNAME
                    });
                }
            })
            .catch(err => console.error("Stats fetch error:", err));

        // 2. 유저의 피드 목록 가져오기
        fetch(`http://localhost:3010/feed/personal/${targetUserId}/${feedCount}`)
            .then(res => res.json())
            .then(data => {
                if (data.list) {
                    setUserFeeds(data.list);
                }
            })
            .catch(err => console.error("Feed fetch error:", err));

        // 3. 팔로우 여부 확인 (내 아이디와 타겟 아이디가 있을 때만)
        if (currentId && targetUserId && currentId !== targetUserId) {
            fetch(`http://localhost:3010/feed/checkFollow/${currentId}/${targetUserId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.result === "success") {
                        setIsFollowing(data.isFollowing);
                    }
                })
                .catch(err => console.error("Follow check error:", err));
        }

    }, [targetUserId, feedCount]);

    // 더보기 버튼 핸들러
    const handleLoadMore = () => {
        setFeedCount(prev => prev + 3);
    };

    // 팔로우/언팔로우 토글 핸들러
    const handleFollowToggle = () => {
        // 내 아이디가 없거나, 내 프로필일 때는 동작하지 않음
        if (!myUserId || myUserId === targetUserId) return;

        // 1. 낙관적 업데이트
        const nextState = !isFollowing;
        setIsFollowing(nextState);

        setUserStats(prev => ({
            ...prev,
            followers: nextState ? prev.followers + 1 : prev.followers - 1
        }));

        // 2. 서버 요청
        fetch(`http://localhost:3010/feed/follow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ myId: myUserId, targetId: targetUserId })
        })
            .then(res => res.json())
            .then(data => {
                // console.log("Follow toggled:", data);
            })
            .catch(err => {
                console.error("Follow toggle error:", err);
                // 실패 시 롤백
                setIsFollowing(!nextState);
                setUserStats(prev => ({
                    ...prev,
                    followers: nextState ? prev.followers - 1 : prev.followers + 1
                }));
            });
    };

    // --- 좋아요 토글 ---
    const toggleLike = (feedNo, index) => {
        if (!myUserId) return; // 로그인 안 되어 있으면 좋아요 X

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

    // --- 북마크 토글 ---
    const toggleBookmark = (feedNo, index) => {
        if (!myUserId) return; // 로그인 안 되어 있으면 북마크 X

        const newFeedList = [...userFeeds];
        const targetFeed = newFeedList[index];
        if (targetFeed.MY_BOOKMARK > 0) {
            targetFeed.MY_BOOKMARK = 0;
        } else {
            targetFeed.MY_BOOKMARK = 1;
        }
        setUserFeeds(newFeedList);
        fetch(`http://localhost:3010/feed/bookmark/${feedNo}/${myUserId}`);
    };

    // --- 댓글/이미지 가져오기 ---
    const getComments = (feedNo) => {
        fetch(`http://localhost:3010/feed/comment/${feedNo}`)
            .then(res => res.json())
            .then(data => {
                if (data.list) setComments(data.list);
                if (data.imgList && data.imgList.length > 0) setFeedImages(data.imgList);
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

    const isVideoFile = (path) => {
        if (!path) return false;
        return path.toLowerCase().endsWith('.mp4');
    };

    // --- 이미지 슬라이드 핸들러 ---
    const handleNextImage = () => setCurrentImageIndex((prev) => (prev + 1) % feedImages.length);
    const handlePrevImage = () => setCurrentImageIndex((prev) => (prev - 1 + feedImages.length) % feedImages.length);

    // --- 댓글 작성 ---
    const handleAddComment = () => {
        if (!myUserId) {
            alert("로그인이 필요합니다.");
            return;
        }
        const content = commentRef.current.value;
        if (!content) return;

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
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        fetch(`http://localhost:3010/feed/comment/${commentNo}`, { method: 'DELETE' })
            .then(() => getComments(selectedFeed.FEEDNO));
    };

    // --- 게시물 삭제 (추가된 기능) ---
    const handleDeleteFeed = (feedNo) => {
        if (targetUserId !== myUserId) {
            alert("본인의 게시물만 삭제할 수 있습니다.");
            return;
        }
        if (!window.confirm("게시물을 삭제하시겠습니까?")) return;

        fetch(`http://localhost:3010/feed/${feedNo}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.result === 'success') {
                    // 성공 시 피드 목록 및 통계 업데이트
                    setUserFeeds(prevFeeds => prevFeeds.filter(feed => feed.FEEDNO !== feedNo));
                    setUserStats(prevStats => ({
                        ...prevStats,
                        posts: prevStats.posts - 1 // 게시물 수 감소
                    }));
                    // 삭제 후 피드 리스트 다시 불러올 필요 없음 (filter로 충분)
                } else {
                    alert("게시물 삭제에 실패했습니다.");
                }
            })
            .catch(err => console.error("Feed delete error:", err));
    };

    // --- 팔로우 모달 ---
    const handleOpenFollowModal = (type) => {
        setFollowType(type);
        setFollowModalOpen(true);
        fetch(`http://localhost:3010/feed/${type}/${targetUserId}`)
            .then(res => res.json())
            .then(data => {
                if (data.list) setFollowList(data.list);
                else setFollowList([]);
            });
    };

    const handleCloseFollowModal = () => {
        setFollowModalOpen(false);
        setFollowList([]);
    };

    return (
        <Box sx={{ width: '80%', minHeight: '100vh', backgroundColor: 'white', pb: 10, mx: 'auto' }}>
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
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>{userStats.nickname}</Typography>
            </Box>

            {/* 2. 프로필 섹션 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, px: 4 }}>
                <Box sx={{ p: 0.5, borderRadius: '50%', background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)' }}>
                    <Avatar src={userStats.profileImg} sx={{ width: 100, height: 100, border: '3px solid white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>{userStats.nickname}</Typography>
                <Typography variant="body2" color="text.secondary">@{targetUserId}</Typography>
                <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
                    {userStats.instrument ? `주 사용 악기 : ${userStats.instrument}` : `음악을 사랑하는 ${userStats.nickname}입니다. 🎸`}
                </Typography>

                {/* 버튼 영역 */}
                {myUserId === targetUserId ? (
                    // 내 프로필일 때: 수정 버튼
                    <Button
                        variant="outlined" fullWidth startIcon={<SettingsIcon />}
                        sx={{
                            mt: 3, borderRadius: 20, borderColor: '#ccc', color: '#333',
                            textTransform: 'none', fontWeight: 'bold',
                            '&:hover': { borderColor: '#999', backgroundColor: '#f5f5f5' }
                        }}
                        onClick={() => navigate("/PersonalEdit")}
                    >
                        프로필 수정
                    </Button>
                ) : (
                    // 타인 프로필일 때: 팔로우/팔로잉 & 메시지
                    <Stack direction="row" spacing={1} sx={{ mt: 3, width: '100%' }}>
                        <Button
                            variant={isFollowing ? "outlined" : "contained"}
                            fullWidth
                            onClick={handleFollowToggle}
                            sx={{
                                borderRadius: 20,
                                background: isFollowing ? 'transparent' : 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)',
                                borderColor: isFollowing ? '#ccc' : 'transparent',
                                color: isFollowing ? '#333' : 'white',
                                textTransform: 'none', fontWeight: 'bold',
                                '&:hover': {
                                    borderColor: isFollowing ? '#999' : 'transparent',
                                    backgroundColor: isFollowing ? '#f5f5f5' : undefined
                                }
                            }}
                        >
                            {isFollowing ? "팔로잉" : "팔로우"}
                        </Button>
                        <Button
                            variant="outlined" fullWidth startIcon={<EmailIcon />}
                            sx={{
                                borderRadius: 20, borderColor: '#ccc', color: '#333',
                                textTransform: 'none', fontWeight: 'bold',
                                '&:hover': { borderColor: '#999', backgroundColor: '#f5f5f5' }
                            }}
                            // [수정] 메시지 버튼 클릭 시 1:1 채팅방으로 이동
                            onClick={() => navigate(`/message/${targetUserId}`)}
                        >
                            메시지
                        </Button>
                    </Stack>
                )}
            </Box>

            {/* 3. 스탯 (클릭 가능) */}
            <Grid container sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
                <Grid item xs={4}>
                    <Typography variant="h6" fontWeight="bold">{userStats.posts}</Typography>
                    <Typography variant="caption" color="text.secondary">게시물</Typography>
                </Grid>
                <Grid item xs={4} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }} onClick={() => handleOpenFollowModal('follower')}>
                    <Typography variant="h6" fontWeight="bold">{userStats.followers}</Typography>
                    <Typography variant="caption" color="text.secondary">팔로워</Typography>
                </Grid>
                <Grid item xs={4} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }} onClick={() => handleOpenFollowModal('following')}>
                    <Typography variant="h6" fontWeight="bold">{userStats.following}</Typography>
                    <Typography variant="caption" color="text.secondary">팔로잉</Typography>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* 4. 피드 리스트 */}
            <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto', px: 2 }}>
                {userFeeds.length > 0 ? (
                    userFeeds.map((item, index) => (
                        <Card key={item.FEEDNO} sx={{ mb: 4, width: '100%', boxShadow: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>

                                    {/* [수정] 피드 헤더: 프로필사진 + 닉네임 */}
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar
                                            // [주의] PersonalFeed에서는 item.USER_IMGPATH 대신 userStats.profileImg를 사용하거나, 
                                            // 서버 API에서 USER_IMGPATH를 주는지 확인 필요. 
                                            // 보통 '개인 피드' 페이지이므로 상단 프로필 이미지(userStats.profileImg)와 동일할 것입니다.
                                            src={userStats.profileImg}
                                            sx={{ mr: 1.5, width: 40, height: 40 }}
                                        />
                                        <Typography variant="h6" fontWeight="bold">{item.NICKNAME}</Typography>
                                    </Box>

                                    {/* 날짜 및 삭제 버튼 영역 */}
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="caption" color="text.secondary">{item.CDATE}</Typography>
                                        {targetUserId === myUserId && ( // 내 게시물일 때만 삭제 버튼 표시
                                            <IconButton size="small" onClick={() => handleDeleteFeed(item.FEEDNO)} aria-label="delete feed">
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Stack>
                                </Box>
                                {item.IMGPATH && (
                                    isVideoFile(item.IMGPATH) ? (
                                        <CardMedia
                                            component="video"
                                            controls // 재생 컨트롤 표시
                                            src={item.IMGPATH}
                                            sx={{ width: "100%", height: "500px", objectFit: "contain", backgroundColor: "#000", borderRadius: 1, mb: 2 }}
                                        />
                                    ) : (
                                        <CardMedia
                                            component="img"
                                            sx={{ width: "100%", height: "500px", objectFit: "contain", backgroundColor: "#f5f5f5", borderRadius: 1, mb: 2 }}
                                            image={item.IMGPATH}
                                        />
                                    )
                                )}
                                <Typography variant="body1" sx={{ mb: 2 }}>{item.CONTENT}</Typography>
                            </CardContent>
                            <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 0.5, minWidth: '15px', textAlign: 'center' }}>{item.LIKE_COUNT > 0 ? item.LIKE_COUNT : ""}</Typography>
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

            {/* 5. 상세 모달 */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                {selectedFeed && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* 모달 헤더에도 프로필 사진 추가 */}
                                <Avatar
                                    src={userStats.profileImg}
                                    sx={{ mr: 1.5, width: 32, height: 32 }}
                                />
                                <Typography variant="h6">{selectedFeed.NICKNAME}</Typography>
                            </Box>
                            <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{selectedFeed.CONTENT}</Typography>
                            {feedImages.length > 0 ? (
                                <Box sx={{ position: 'relative', width: '100%', height: 'auto', mb: 2, backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {feedImages.length > 1 && (
                                        <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                                            <ArrowBackIosNewIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    {isVideoFile(feedImages[currentImageIndex].IMGPATH) ? (
                                        <Box
                                            component="video"
                                            src={feedImages[currentImageIndex].IMGPATH}
                                            controls
                                            sx={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: 1, backgroundColor: '#000' }}
                                        />
                                    ) : (
                                        <Box component="img" src={feedImages[currentImageIndex].IMGPATH} sx={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: 1 }} />
                                    )}
                                    {feedImages.length > 1 && (
                                        <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, borderRadius: 1 }}>
                                        {currentImageIndex + 1} / {feedImages.length}
                                    </Typography>
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
                                            // 댓글 닉네임 클릭 시 해당 유저 피드로 이동
                                            primary={
                                                <Typography
                                                    variant="subtitle2"
                                                    component="span"
                                                    sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                    onClick={() => {
                                                        handleCloseModal();
                                                        navigate("/personalFeed", {
                                                            state: {
                                                                targetUserId: comment.USERID,
                                                                targetNickname: comment.NICKNAME || comment.USERID
                                                            }
                                                        });
                                                    }}
                                                >
                                                    {comment.NICKNAME || comment.USERID}
                                                </Typography>
                                            }
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
                            <TextField fullWidth size="small" placeholder="댓글 달기..." inputRef={commentRef} InputProps={{ endAdornment: (<IconButton onClick={handleAddComment}><SendIcon color="primary" /></IconButton>) }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }} />
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* 팔로우/팔로잉 목록 모달 */}
            <Dialog open={followModalOpen} onClose={handleCloseFollowModal} fullWidth maxWidth="xs">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{followType === 'follower' ? '팔로워' : '팔로잉'}</Typography>
                    <IconButton onClick={handleCloseFollowModal}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {followList.length > 0 ? (
                            followList.map((user) => (
                                <ListItem key={user.USERID} alignItems="center">
                                    <ListItemAvatar><Avatar src={user.IMGPATH ? user.IMGPATH : undefined} alt={user.NICKNAME} /></ListItemAvatar>
                                    <ListItemText
                                        // 팔로우 리스트 닉네임 클릭 시 해당 유저 피드로 이동
                                        primary={
                                            <Typography
                                                variant="subtitle2"
                                                component="span"
                                                sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                onClick={() => {
                                                    handleCloseFollowModal();
                                                    navigate("/personalFeed", {
                                                        state: {
                                                            targetUserId: user.USERID,
                                                            targetNickname: user.NICKNAME
                                                        }
                                                    });
                                                }}
                                            >
                                                {user.NICKNAME}
                                            </Typography>
                                        }
                                        secondary={`@${user.USERID}`}
                                    />
                                </ListItem>
                            ))
                        ) : (<Typography textAlign="center" color="text.secondary" sx={{ py: 3 }}>목록이 없습니다.</Typography>)}
                    </List>
                </DialogContent>
            </Dialog>

            <Button variant="contained" sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', minWidth: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(45deg, #d32f2f 30%, #ff8a65 90%)', '&:hover': { background: 'linear-gradient(45deg, #b71c1c 30%, #ff7043 90%)' }, padding: 0, zIndex: 1100 }} onClick={handleLoadMore}>
                <ArrowDownwardIcon />
            </Button>
        </Box>
    );
}

export default PersonalFeed;