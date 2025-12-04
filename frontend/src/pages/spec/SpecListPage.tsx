import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, CircularProgress, Alert,
  Card, CardContent, useMediaQuery, useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSpecs } from '../../api/spec';
import type { Specification } from '../../types/spec.types';

const SpecListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpecs();
  }, [page, rowsPerPage]);

  const fetchSpecs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getSpecs({ page, size: rowsPerPage });
      setSpecs(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch specs:', err);
      setError(err.message || 'SPEC 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      DRAFT: 'default', REVIEW: 'warning', APPROVED: 'success', REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: '초안', REVIEW: '검토중', APPROVED: '승인됨', REJECTED: '반려됨',
    };
    return labels[status] || status;
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>SPEC 관리</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/specs/new')} size={isMobile ? 'small' : 'medium'}>
          SPEC 등록
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></Paper>
          ) : specs.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}><Typography>데이터가 없습니다.</Typography></Paper>
          ) : (
            specs.map((spec) => (
              <Card key={spec.id} sx={{ cursor: 'pointer', width: '100%' }} onClick={() => navigate(`/specs/${spec.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>{spec.specNumber}</Typography>
                    <Chip label={getStatusLabel(spec.status)} color={getStatusColor(spec.status)} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>유형: {spec.specType === 'DEVELOPMENT' ? '개발' : '운영'}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>SR: {spec.srNumber || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>FP: {spec.functionPoint || '-'} / M/D: {spec.manDay || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">작성일: {new Date(spec.createdAt).toLocaleDateString()}</Typography>
                </CardContent>
              </Card>
            ))
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="페이지당:" />
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SPEC 번호</TableCell><TableCell>유형</TableCell><TableCell>분류</TableCell><TableCell>SR</TableCell><TableCell>FP</TableCell><TableCell>M/D</TableCell><TableCell>상태</TableCell><TableCell>작성일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></TableCell></TableRow>
              ) : specs.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center"><Typography>데이터가 없습니다.</Typography></TableCell></TableRow>
              ) : (
                specs.map((spec) => (
                  <TableRow key={spec.id} hover onClick={() => navigate(`/specs/${spec.id}`)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{spec.specNumber}</TableCell>
                    <TableCell>{spec.specType === 'DEVELOPMENT' ? '개발' : '운영'}</TableCell>
                    <TableCell>{spec.specCategory === 'ACCEPTED' ? '접수' : '취소'}</TableCell>
                    <TableCell>{spec.srNumber || '-'}</TableCell>
                    <TableCell>{spec.functionPoint || '-'}</TableCell>
                    <TableCell>{spec.manDay || '-'}</TableCell>
                    <TableCell><Chip label={getStatusLabel(spec.status)} color={getStatusColor(spec.status)} size="small" /></TableCell>
                    <TableCell>{new Date(spec.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="페이지당 행 수:" />
        </TableContainer>
      )}
    </Box>
  );
};

export default SpecListPage;





