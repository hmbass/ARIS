import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FolderOpen,
  Description,
  Assignment,
  CheckCircle,
  TrendingUp,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Schedule,
  Person,
  Visibility,
  Add,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: React.ReactElement;
  gradient: string;
  path: string;
  menuItems: { label: string; action: string; icon: React.ReactElement }[];
}

interface ProjectProgress {
  projectId: number;
  projectName: string;
  progress: number;
  color: string;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  user: string;
  time: string;
  path?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [projectProgresses, setProjectProgresses] = useState<ProjectProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: '전체 프로젝트',
      value: 0,
      change: 12,
      icon: <FolderOpen />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      path: '/projects',
      menuItems: [
        { label: '프로젝트 목록', action: 'view', icon: <Visibility fontSize="small" /> },
        { label: '새 프로젝트 등록', action: 'create', icon: <Add fontSize="small" /> },
        { label: '새로고침', action: 'refresh', icon: <Refresh fontSize="small" /> },
      ],
    },
    {
      title: '진행중 SR',
      value: 0,
      change: 8,
      icon: <Description />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      path: '/srs',
      menuItems: [
        { label: 'SR 목록', action: 'view', icon: <Visibility fontSize="small" /> },
        { label: '새 SR 등록', action: 'create', icon: <Add fontSize="small" /> },
        { label: '새로고침', action: 'refresh', icon: <Refresh fontSize="small" /> },
      ],
    },
    {
      title: 'SPEC 문서',
      value: 0,
      change: -3,
      icon: <Assignment />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      path: '/specs',
      menuItems: [
        { label: 'SPEC 목록', action: 'view', icon: <Visibility fontSize="small" /> },
        { label: '새 SPEC 등록', action: 'create', icon: <Add fontSize="small" /> },
        { label: '새로고침', action: 'refresh', icon: <Refresh fontSize="small" /> },
      ],
    },
    {
      title: '승인 대기',
      value: 0,
      change: 5,
      icon: <CheckCircle />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      path: '/approvals',
      menuItems: [
        { label: '승인 목록', action: 'view', icon: <Visibility fontSize="small" /> },
        { label: '새로고침', action: 'refresh', icon: <Refresh fontSize="small" /> },
      ],
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveCardIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveCardIndex(null);
  };

  const handleMenuAction = (action: string, path: string) => {
    handleMenuClose();
    
    switch (action) {
      case 'view':
        navigate(path);
        break;
      case 'create':
        navigate(`${path}/new`);
        break;
      case 'refresh':
        fetchDashboardData();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectsRes, srsRes, dashboardRes] = await Promise.all([
        apiClient.get('/projects', { params: { page: 0, size: 1 } }),
        apiClient.get('/srs', { params: { page: 0, size: 1 } }),
        apiClient.get('/dashboard'),
      ]);

      setStats(prev => prev.map((stat, index) => {
        if (index === 0) {
          return { ...stat, value: projectsRes.data.totalElements || 0 };
        }
        if (index === 1) {
          return { ...stat, value: srsRes.data.totalElements || 0 };
        }
        return stat;
      }));
      
      // 대시보드 데이터 설정
      if (dashboardRes.data) {
        setProjectProgresses(dashboardRes.data.projectProgresses || []);
        setRecentActivities(dashboardRes.data.recentActivities || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SR': return '#10b981';
      case 'SPEC': return '#f59e0b';
      case '승인': return '#ef4444';
      case '이슈': return '#8b5cf6';
      case '프로젝트': return '#6366f1';
      default: return '#818cf8';
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          {getGreeting()}, {user?.name}님 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          오늘도 ARIS와 함께 효율적인 업무를 시작하세요.
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            sx={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              overflow: 'visible',
              position: 'relative',
              animation: `fadeIn 0.4s ease ${index * 0.1}s both`,
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: stat.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 20px ${stat.gradient.includes('#6366f1') ? 'rgba(99, 102, 241, 0.3)' : 
                      stat.gradient.includes('#10b981') ? 'rgba(16, 185, 129, 0.3)' :
                      stat.gradient.includes('#f59e0b') ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    '& svg': { color: 'white', fontSize: 24 },
                  }}
                >
                  {stat.icon}
                </Box>
                <Tooltip title="더보기">
                  <IconButton 
                    size="small" 
                    sx={{ color: 'text.secondary' }}
                    onClick={(e) => handleMenuOpen(e, index)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stat.value.toLocaleString()}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
                <Chip
                  size="small"
                  icon={stat.change > 0 ? <ArrowUpward sx={{ fontSize: '14px !important' }} /> : <ArrowDownward sx={{ fontSize: '14px !important' }} />}
                  label={`${Math.abs(stat.change)}%`}
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: stat.change > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: stat.change > 0 ? '#34d399' : '#f87171',
                    '& .MuiChip-icon': {
                      color: 'inherit',
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Card Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            backgroundColor: '#1a1a24',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            borderRadius: 2,
          },
        }}
      >
        {activeCardIndex !== null && stats[activeCardIndex]?.menuItems.map((item) => (
          <MenuItem
            key={item.action}
            onClick={() => handleMenuAction(item.action, stats[activeCardIndex].path)}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">{item.label}</Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Bottom Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
        }}
      >
        {/* Progress Overview */}
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TrendingUp sx={{ color: '#818cf8' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  프로젝트 진행률
                </Typography>
              </Box>
              <Chip 
                label="내 프로젝트" 
                size="small"
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  fontWeight: 500,
                }}
              />
            </Box>

            {projectProgresses.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  담당 중인 프로젝트가 없습니다.
                </Typography>
              </Box>
            ) : (
              projectProgresses.map((project, index) => (
                <Box 
                  key={project.projectId} 
                  sx={{ 
                    mb: index < projectProgresses.length - 1 ? 3 : 0,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                  onClick={() => navigate(`/projects/${project.projectId}`)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {project.projectName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: project.color, fontWeight: 600 }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: project.color,
                      },
                    }}
                  />
                </Box>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Schedule sx={{ color: '#818cf8' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                최근 활동
              </Typography>
            </Box>

            {recentActivities.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  최근 활동이 없습니다.
                </Typography>
              </Box>
            ) : (
              recentActivities.map((activity, index) => (
                <Box
                  key={`${activity.type}-${activity.id}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    py: 2,
                    borderBottom: index < recentActivities.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                    cursor: activity.path ? 'pointer' : 'default',
                    '&:hover': activity.path ? { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 1 } : {},
                  }}
                  onClick={() => activity.path && navigate(activity.path)}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: `${getTypeColor(activity.type)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Person sx={{ fontSize: 18, color: getTypeColor(activity.type) }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25 }} noWrap>
                      {activity.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={activity.type}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: `${getTypeColor(activity.type)}20`,
                          color: getTypeColor(activity.type),
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {activity.user} · {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;
