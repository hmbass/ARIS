import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, CircularProgress, Alert, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getIssues } from '../../api/issue';
import type { Issue } from '../../types/issue.types';

const IssueListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [issues, setIssues] = useState<Issue[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchIssues(); }, [page, rowsPerPage]);

  const fetchIssues = async () => {
    setLoading(true); setError('');
    try {
      const response = await getIssues({ page, size: rowsPerPage });
      setIssues(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch issues:', err);
      setError(err.message || '이슈 목록을 불러오는데 실패했습니다.');
    } finally { setLoading(false); }
  };

  const getStatusColor = (status: string) => ({ OPEN: 'error', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'default' } as any)[status] || 'default';
  const getStatusLabel = (status: string) => ({ OPEN: '열림', IN_PROGRESS: '진행중', RESOLVED: '해결됨', CLOSED: '닫힘' } as any)[status] || status;
  const getPriorityColor = (priority?: string) => ({ LOW: 'default', MEDIUM: 'primary', HIGH: 'warning', CRITICAL: 'error' } as any)[priority || ''] || 'default';
  const getPriorityLabel = (priority?: string) => ({ LOW: '낮음', MEDIUM: '보통', HIGH: '높음', CRITICAL: '긴급' } as any)[priority || ''] || priority || '-';
  const getIssueTypeLabel = (issueType?: string) => ({ BUG: '버그', IMPROVEMENT: '개선', NEW_FEATURE: '신규기능', TASK: '작업' } as any)[issueType || ''] || issueType || '-';

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>이슈 관리</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/issues/new')} size={isMobile ? 'small' : 'medium'}>이슈 등록</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? <Paper sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></Paper> : issues.length === 0 ? <Paper sx={{ p: 3, textAlign: 'center' }}><Typography>데이터가 없습니다.</Typography></Paper> : issues.map((issue) => (
            <Card key={issue.id} sx={{ cursor: 'pointer', width: '100%' }} onClick={() => navigate(`/issues/${issue.id}`)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>{issue.title}</Typography>
                  <Chip label={getStatusLabel(issue.status)} color={getStatusColor(issue.status)} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>유형: {getIssueTypeLabel(issue.issueType)}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>프로젝트: {issue.projectName || '-'}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>담당자: {issue.assigneeName || '-'}</Typography>
                <Typography variant="body2" color="text.secondary">우선순위: {getPriorityLabel(issue.priority)}</Typography>
              </CardContent>
            </Card>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="페이지당:" />
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table><TableHead><TableRow><TableCell>이슈번호</TableCell><TableCell>제목</TableCell><TableCell>유형</TableCell><TableCell>우선순위</TableCell><TableCell>상태</TableCell><TableCell>프로젝트</TableCell><TableCell>담당자</TableCell></TableRow></TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></TableCell></TableRow> : issues.length === 0 ? <TableRow><TableCell colSpan={7} align="center"><Typography>데이터가 없습니다.</Typography></TableCell></TableRow> : issues.map((issue) => (
                <TableRow key={issue.id} hover onClick={() => navigate(`/issues/${issue.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{issue.issueNumber}</TableCell>
                  <TableCell>{issue.title}</TableCell>
                  <TableCell>{getIssueTypeLabel(issue.issueType)}</TableCell>
                  <TableCell><Chip label={getPriorityLabel(issue.priority)} color={getPriorityColor(issue.priority)} size="small" /></TableCell>
                  <TableCell><Chip label={getStatusLabel(issue.status)} color={getStatusColor(issue.status)} size="small" /></TableCell>
                  <TableCell>{issue.projectName || '-'}</TableCell>
                  <TableCell>{issue.assigneeName || '-'}</TableCell>
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

export default IssueListPage;
