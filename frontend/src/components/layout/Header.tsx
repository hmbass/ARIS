import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout,
  Person,
  Lock,
  Notifications,
  Search,
  FolderOpen,
  Description,
  Assignment,
  BugReport,
  Warning,
  Close,
  CheckCircle,
  Info,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';
import apiClient from '../../utils/api';

interface HeaderProps {
  onMenuClick: () => void;
}

// 검색 결과 타입
interface SearchResult {
  id: number;
  type: 'project' | 'sr' | 'spec' | 'issue' | 'incident';
  title: string;
  description?: string;
}

// 알림 타입
interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  isRead: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, clearAuth } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // 검색 상태
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // 알림 상태
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 알림 개수 조회
  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      // 실제 알림 API가 없으므로 승인 대기 개수로 대체
      const response = await apiClient.get('/approvals/count/pending');
      setUnreadCount(response.data || 0);
    } catch (error) {
      // 오류 무시
    }
  };

  const fetchNotifications = async () => {
    setNotificationLoading(true);
    try {
      // 실제 알림 API가 없으므로 승인 대기 목록을 알림으로 표시
      const response = await apiClient.get('/approvals', { params: { page: 0, size: 5, status: 'PENDING' } });
      const approvals = response.data.content || [];
      
      const notifs: Notification[] = approvals.map((approval: any) => ({
        id: approval.id,
        type: 'warning' as const,
        title: '승인 요청',
        message: `${approval.title || '승인 요청'} - ${approval.requesterName || '요청자'}`,
        link: `/approvals/${approval.id}`,
        createdAt: approval.createdAt,
        isRead: false,
      }));
      
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  // 검색 수행
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results: SearchResult[] = [];
      
      // 프로젝트 검색 (name 파라미터 사용)
      try {
        const projectRes = await apiClient.get('/projects', { params: { page: 0, size: 5, name: query } });
        projectRes.data.content?.forEach((p: any) => {
          results.push({ id: p.id, type: 'project', title: p.name, description: p.description });
        });
      } catch (e) { /* ignore */ }
      
      // SR 검색 (title 파라미터 사용)
      try {
        const srRes = await apiClient.get('/srs', { params: { page: 0, size: 5, title: query } });
        srRes.data.content?.forEach((s: any) => {
          results.push({ id: s.id, type: 'sr', title: s.title, description: s.srNumber });
        });
      } catch (e) { /* ignore */ }
      
      // 이슈 검색 (title 파라미터 사용)
      try {
        const issueRes = await apiClient.get('/issues', { params: { page: 0, size: 5, title: query } });
        issueRes.data.content?.forEach((i: any) => {
          results.push({ id: i.id, type: 'issue', title: i.title, description: i.issueNumber });
        });
      } catch (e) { /* ignore */ }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 검색 결과 클릭
  const handleSearchResultClick = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    
    const routes: Record<string, string> = {
      project: '/projects',
      sr: '/srs',
      spec: '/specs',
      issue: '/issues',
      incident: '/incidents',
    };
    navigate(`${routes[result.type]}/${result.id}`);
  };

  // 검색 결과 아이콘
  const getSearchIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      project: <FolderOpen color="primary" />,
      sr: <Description color="info" />,
      spec: <Assignment color="secondary" />,
      issue: <BugReport color="warning" />,
      incident: <Warning color="error" />,
    };
    return icons[type] || <Description />;
  };

  // 검색 결과 타입 라벨
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      project: '프로젝트',
      sr: 'SR',
      spec: 'SPEC',
      issue: '이슈',
      incident: '장애',
    };
    return labels[type] || type;
  };

  // 알림 아이콘
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      info: <Info sx={{ color: '#3b82f6' }} />,
      success: <CheckCircle sx={{ color: '#10b981' }} />,
      warning: <Warning sx={{ color: '#f59e0b' }} />,
      error: <ErrorIcon sx={{ color: '#ef4444' }} />,
    };
    return icons[type] || <Info />;
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationItemClick = (notification: Notification) => {
    handleNotificationClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  // 이름 이니셜 추출
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Toolbar sx={{ px: { xs: 1.5, sm: 3 }, minHeight: { xs: 64, sm: 70 } }}>
          {/* Menu Button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ 
              mr: { xs: 1, sm: 2 },
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                A
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              ARIS
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {/* Search Button */}
            <Tooltip title="검색 (⌘K)">
              <IconButton
                onClick={() => setSearchOpen(true)}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <Search />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="알림">
              <IconButton
                onClick={handleNotificationClick}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <Badge 
                  badgeContent={unreadCount} 
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    },
                  }}
                >
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Divider */}
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                mx: { xs: 0.5, sm: 1.5 }, 
                borderColor: 'rgba(255, 255, 255, 0.08)',
                display: { xs: 'none', sm: 'block' },
              }} 
            />

            {/* User Info (Desktop) */}
            {!isMobile && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {user?.companyName}
                </Typography>
              </Box>
            )}

            {/* Avatar */}
            <IconButton
              onClick={handleMenu}
              sx={{ 
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <Avatar 
                sx={{ 
                  width: { xs: 36, sm: 40 }, 
                  height: { xs: 36, sm: 40 },
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  fontWeight: 600,
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {user?.name ? getInitials(user.name) : 'U'}
              </Avatar>
            </IconButton>

            {/* User Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  backgroundColor: '#1a1a24',
                  backgroundImage: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                  borderRadius: 2,
                },
              }}
            >
              {/* User Info in Menu (Mobile) */}
              {isMobile && (
                <>
                  <Box sx={{ px: 2.5, py: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {user?.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {user?.companyName}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                </>
              )}
              <MenuItem 
                onClick={() => { handleClose(); navigate('/profile'); }}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <Person sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">내 프로필</Typography>
              </MenuItem>
              <MenuItem 
                onClick={() => { handleClose(); navigate('/change-password'); }}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <Lock sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">비밀번호 변경</Typography>
              </MenuItem>
              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  color: '#f87171',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <Logout sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">로그아웃</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 알림 메뉴 */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 360,
            maxHeight: 480,
            backgroundColor: '#1a1a24',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>알림</Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount}개 새 알림`} size="small" color="primary" />
          )}
        </Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
        
        {notificationLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              새로운 알림이 없습니다
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => (
              <ListItem key={notification.id} disablePadding>
                <ListItemButton 
                  onClick={() => handleNotificationItemClick(notification)}
                  sx={{ 
                    py: 1.5, 
                    px: 2.5,
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{ 
              color: '#6366f1', 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => { handleNotificationClose(); navigate('/approvals'); }}
          >
            모든 알림 보기
          </Typography>
        </Box>
      </Menu>

      {/* 검색 다이얼로그 */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a24',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            mt: { xs: 2, sm: 8 },
            mx: { xs: 2, sm: 'auto' },
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="프로젝트, SR, 이슈 검색... (⌘K)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
              },
            }}
          />
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {searchLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
              <Typography sx={{ mt: 1 }} color="text.secondary">검색 중...</Typography>
            </Box>
          ) : searchQuery.length < 2 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                검색어를 2자 이상 입력하세요
              </Typography>
            </Box>
          ) : searchResults.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                "{searchQuery}"에 대한 검색 결과가 없습니다
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {searchResults.map((result) => (
                <ListItem key={`${result.type}-${result.id}`} disablePadding>
                  <ListItemButton
                    onClick={() => handleSearchResultClick(result)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getSearchIcon(result.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.title}
                      secondary={result.description}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    />
                    <Chip
                      label={getTypeLabel(result.type)}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
