import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, CircularProgress, Alert, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getIncidents } from '../../api/incident';
import type { Incident } from '../../types/incident.types';

const IncidentListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchIncidents(); }, [page, rowsPerPage]);

  const fetchIncidents = async () => {
    setLoading(true); setError('');
    try {
      const response = await getIncidents({ page, size: rowsPerPage });
      setIncidents(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch incidents:', err);
      setError(err.message || '장애 목록을 불러오는데 실패했습니다.');
    } finally { setLoading(false); }
  };

  const getStatusColor = (status: string) => ({ OPEN: 'error', INVESTIGATING: 'warning', RESOLVED: 'success', CLOSED: 'default' } as any)[status] || 'default';
  const getStatusLabel = (status: string) => ({ OPEN: '발생', INVESTIGATING: '조사중', RESOLVED: '해결됨', CLOSED: '종료' } as any)[status] || status;
  const getSeverityColor = (severity: string) => ({ LOW: 'default', MEDIUM: 'primary', HIGH: 'warning', CRITICAL: 'error' } as any)[severity] || 'default';

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>장애 관리</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/incidents/new')} size={isMobile ? 'small' : 'medium'}>장애 등록</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? <Paper sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></Paper> : incidents.length === 0 ? <Paper sx={{ p: 3, textAlign: 'center' }}><Typography>데이터가 없습니다.</Typography></Paper> : incidents.map((incident) => (
            <Card key={incident.id} sx={{ cursor: 'pointer', width: '100%' }} onClick={() => navigate(`/incidents/${incident.id}`)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>{incident.title}</Typography>
                  <Chip label={getStatusLabel(incident.status)} color={getStatusColor(incident.status)} size="small" />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip label={incident.severity} color={getSeverityColor(incident.severity)} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>프로젝트: {incident.projectName}</Typography>
                <Typography variant="body2" color="text.secondary">발생일: {new Date(incident.occurredAt).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="페이지당:" />
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>제목</TableCell><TableCell>심각도</TableCell><TableCell>상태</TableCell><TableCell>프로젝트</TableCell><TableCell>담당자</TableCell><TableCell>발생일</TableCell></TableRow></TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></TableCell></TableRow> : incidents.length === 0 ? <TableRow><TableCell colSpan={7} align="center"><Typography>데이터가 없습니다.</Typography></TableCell></TableRow> : incidents.map((incident) => (
                <TableRow key={incident.id} hover onClick={() => navigate(`/incidents/${incident.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{incident.id}</TableCell><TableCell>{incident.title}</TableCell>
                  <TableCell><Chip label={incident.severity} color={getSeverityColor(incident.severity)} size="small" /></TableCell>
                  <TableCell><Chip label={getStatusLabel(incident.status)} color={getStatusColor(incident.status)} size="small" /></TableCell>
                  <TableCell>{incident.projectName}</TableCell><TableCell>{incident.assigneeName || '-'}</TableCell>
                  <TableCell>{new Date(incident.occurredAt).toLocaleString()}</TableCell>
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

export default IncidentListPage;







