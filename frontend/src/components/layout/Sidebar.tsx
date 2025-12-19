import React, { useEffect, useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  FolderOpen,
  Description,
  Assignment,
  CheckCircle,
  BugReport,
  Rocket,
  Warning,
  Business,
  Computer,
  People,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../utils/api';

const DRAWER_WIDTH = 260;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badgeKey?: 'sr' | 'approval';
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { text: '대시보드', icon: <Dashboard />, path: '/dashboard' },
  { text: '프로젝트', icon: <FolderOpen />, path: '/projects' },
  { text: 'SR 관리', icon: <Description />, path: '/srs', badgeKey: 'sr' },
  { text: 'SPEC 관리', icon: <Assignment />, path: '/specs' },
  { text: '승인 관리', icon: <CheckCircle />, path: '/approvals', badgeKey: 'approval' },
  { text: '이슈 관리', icon: <BugReport />, path: '/issues' },
  { text: '릴리즈', icon: <Rocket />, path: '/releases' },
  { text: '장애 관리', icon: <Warning />, path: '/incidents' },
  { text: '파트너', icon: <Business />, path: '/partners' },
  { text: '자산 관리', icon: <Computer />, path: '/assets' },
  { text: '사용자 관리', icon: <People />, path: '/users', adminOnly: true },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [badges, setBadges] = useState<{ sr: number; approval: number }>({ sr: 0, approval: 0 });
  
  // 사용자가 Admin인지 확인
  const isAdmin = user?.roles?.some(role => 
    role === 'ADMIN' || role === 'SYSTEM_ADMIN' || role === 'ROLE_ADMIN' || role === 'ROLE_SYSTEM_ADMIN'
  ) ?? false;
  
  // 권한에 따라 메뉴 필터링
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);
  
  // Badge 개수 API 호출 (로그인한 경우만)
  useEffect(() => {
    // 사용자가 로그인하지 않은 경우 API 호출하지 않음
    if (!user) {
      return;
    }
    
    // 토큰이 있는지 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }
    
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isActive = true; // 컴포넌트가 마운트된 상태인지 확인
    
    const fetchBadgeCounts = async () => {
      // 토큰이 없거나 컴포넌트가 언마운트되면 중단
      const currentToken = localStorage.getItem('accessToken');
      if (!currentToken || !isActive) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return;
      }
      
      try {
        const [srRes, approvalRes] = await Promise.all([
          apiClient.get('/srs/count'),
          apiClient.get('/approvals/count/pending'),
        ]);
        
        if (isActive) {
          setBadges({
            sr: srRes.data || 0,
            approval: approvalRes.data || 0,
          });
        }
      } catch (error: any) {
        // 인증 오류 발생 시 interval 중단 (로그인 페이지로 리다이렉트는 api.ts에서 처리)
        if (error?.code === 'A001' || error?.code === 'A002' || error?.code === 'A003') {
          console.log('Authentication error, stopping badge refresh');
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
        // 다른 오류는 무시 (콘솔에 로그 남기지 않음)
      }
    };
    
    fetchBadgeCounts();
    
    // 30초마다 갱신
    intervalId = setInterval(fetchBadgeCounts, 30000);
    
    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Space */}
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
      
      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <List sx={{ px: 1.5 }}>
          {filteredMenuItems.map((item) => {
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive(item.path)}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                      borderLeft: '3px solid #6366f1',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#818cf8',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#f8fafc',
                        fontWeight: 600,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive(item.path) ? '#818cf8' : 'text.secondary',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      color: isActive(item.path) ? 'text.primary' : 'text.secondary',
                    }}
                  />
                  {badgeCount > 0 && (
                    <Chip
                      label={badgeCount > 99 ? '99+' : badgeCount}
                      size="small"
                      sx={{
                        height: 22,
                        minWidth: 28,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: isActive(item.path) 
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : 'rgba(99, 102, 241, 0.15)',
                        color: isActive(item.path) ? 'white' : '#818cf8',
                        border: 'none',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          p: 2.5, 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            시스템 버전
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#818cf8' }}>
            ARIS v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#0a0a0f',
            backgroundImage: 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Box
      component="nav"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
      }}
    >
      <Drawer
        variant="permanent"
        open
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#0a0a0f',
            backgroundImage: 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
