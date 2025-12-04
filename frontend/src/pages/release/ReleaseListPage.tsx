import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, CircularProgress, Alert, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getReleases } from '../../api/release';
import type { Release } from '../../types/release.types';

const ReleaseListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [releases, setReleases] = useState<Release[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchReleases(); }, [page, rowsPerPage]);

  const fetchReleases = async () => {
    setLoading(true); setError('');
    try {
      const response = await getReleases({ page, size: rowsPerPage });
      setReleases(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch releases:', err);
      setError(err.message || '릴리즈 목록을 불러오는데 실패했습니다.');
    } finally { setLoading(false); }
  };

  const getStatusColor = (status: string) => ({ PLANNED: 'default', IN_PROGRESS: 'warning', RELEASED: 'success', CANCELLED: 'error' } as any)[status] || 'default';
  const getStatusLabel = (status: string) => ({ PLANNED: '계획됨', IN_PROGRESS: '진행중', RELEASED: '배포됨', CANCELLED: '취소됨' } as any)[status] || status;

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>릴리즈 관리</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/releases/new')} size={isMobile ? 'small' : 'medium'}>릴리즈 등록</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? <Paper sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></Paper> : releases.length === 0 ? <Paper sx={{ p: 3, textAlign: 'center' }}><Typography>데이터가 없습니다.</Typography></Paper> : releases.map((release) => (
            <Card key={release.id} sx={{ cursor: 'pointer', width: '100%' }} onClick={() => navigate(`/releases/${release.id}`)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>{release.name} (v{release.version})</Typography>
                  <Chip label={getStatusLabel(release.status)} color={getStatusColor(release.status)} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>프로젝트: {release.projectName}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>이슈: {release.issueCount}개</Typography>
                <Typography variant="body2" color="text.secondary">배포일: {release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : '-'}</Typography>
              </CardContent>
            </Card>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="페이지당:" />
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>버전</TableCell><TableCell>이름</TableCell><TableCell>프로젝트</TableCell><TableCell>이슈 수</TableCell><TableCell>상태</TableCell><TableCell>배포일</TableCell></TableRow></TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></TableCell></TableRow> : releases.length === 0 ? <TableRow><TableCell colSpan={7} align="center"><Typography>데이터가 없습니다.</Typography></TableCell></TableRow> : releases.map((release) => (
                <TableRow key={release.id} hover onClick={() => navigate(`/releases/${release.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{release.id}</TableCell><TableCell>v{release.version}</TableCell><TableCell>{release.name}</TableCell>
                  <TableCell>{release.projectName}</TableCell><TableCell>{release.issueCount}</TableCell>
                  <TableCell><Chip label={getStatusLabel(release.status)} color={getStatusColor(release.status)} size="small" /></TableCell>
                  <TableCell>{release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="페이지당 행 수:" />
        </TableContainer>
      )}
    </Box>
  );
};

export default ReleaseListPage;







