import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  FolderOpen,
  Description,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';
import apiClient from '../../utils/api';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactElement;
  color: string;
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: '진행중인 프로젝트',
      value: 0,
      icon: <FolderOpen sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: '내 SR',
      value: 0,
      icon: <Description sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: '내 SPEC',
      value: 0,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: '승인 대기',
      value: 0,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // 병렬로 API 호출
      const [projectsRes, srsRes] = await Promise.all([
        apiClient.get('/projects', { params: { page: 0, size: 1 } }),
        apiClient.get('/srs', { params: { page: 0, size: 1 } }),
      ]);

      // 통계 업데이트
      setStats([
        {
          title: '전체 프로젝트',
          value: projectsRes.data.totalElements || 0,
          icon: <FolderOpen sx={{ fontSize: 40 }} />,
          color: '#1976d2',
        },
        {
          title: '전체 SR',
          value: srsRes.data.totalElements || 0,
          icon: <Description sx={{ fontSize: 40 }} />,
          color: '#2e7d32',
        },
        {
          title: 'SPEC',
          value: 0, // SPEC API 구현 후 연동
          icon: <Assignment sx={{ fontSize: 40 }} />,
          color: '#ed6c02',
        },
        {
          title: '승인 대기',
          value: 0, // 승인 API 구현 후 연동
          icon: <CheckCircle sx={{ fontSize: 40 }} />,
          color: '#d32f2f',
        },
      ]);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h4" gutterBottom>
        대시보드
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mt: 2,
          width: '100%',
        }}
      >
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </Box>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mt: 3,
          width: '100%',
        }}
      >
        <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            최근 활동
          </Typography>
          <Typography color="text.secondary">
            최근 활동 내역이 여기에 표시됩니다.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            긴급 알림
          </Typography>
          <Typography color="text.secondary">
            긴급 알림이 여기에 표시됩니다.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage;



