import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';

// 아이콘 임포트
import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';

function MypageSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    // 메뉴 아이템 설정
    const menuItems = [
        { text: '내 정보', icon: <PersonIcon />, path: '/mypage' },
        { text: '북마크', icon: <BookmarkIcon />, path: '/bookmark' },
    ];

    return (
        // 사이드바 컨테이너 (너비 240px 고정, 오른쪽 여백)
        <Box sx={{ width: 240, marginRight: 3, display: { xs: 'none', md: 'block' } }}> 
            <Paper elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2, overflow: 'hidden' }}>
                <List component="nav" disablePadding>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={currentPath === item.path}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    py: 2, // 버튼 높이 좀 더 넉넉하게
                                    // 선택되었을 때 스타일 (붉은색 테마)
                                    '&.Mui-selected': {
                                        backgroundColor: '#ffebee', // 매우 연한 빨강 배경
                                        color: '#d32f2f', // 진한 빨강 글씨
                                        borderRight: '3px solid #d32f2f', // 오른쪽에 강조 선
                                        '&:hover': {
                                            backgroundColor: '#ffcdd2',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: '#d32f2f', // 아이콘도 빨강으로
                                        },
                                    },
                                    // 선택 안 되었을 때 호버 스타일
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: currentPath === item.path ? '#d32f2f' : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    primaryTypographyProps={{ fontWeight: currentPath === item.path ? 'bold' : 'medium' }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}

export default MypageSidebar;