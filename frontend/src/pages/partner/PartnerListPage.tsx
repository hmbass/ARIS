import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, CircularProgress, Alert, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPartners } from '../../api/partner';
import type { Partner } from '../../types/partner.types';

const PartnerListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [partners, setPartners] = useState<Partner[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchPartners(); }, [page, rowsPerPage]);

  const fetchPartners = async () => {
    setLoading(true); setError('');
    try {
      const response = await getPartners({ page, size: rowsPerPage });
      setPartners(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch partners:', err);
      setError(err.message || '파트너 목록을 불러오는데 실패했습니다.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>파트너 관리</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/partners/new')} size={isMobile ? 'small' : 'medium'}>파트너 등록</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? <Paper sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></Paper> : partners.length === 0 ? <Paper sx={{ p: 3, textAlign: 'center' }}><Typography>데이터가 없습니다.</Typography></Paper> : partners.map((partner) => (
            <Card key={partner.id} sx={{ cursor: 'pointer', width: '100%' }} onClick={() => navigate(`/partners/${partner.id}`)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>{partner.name}</Typography>
                  <Chip label={partner.isClosed ? '폐업' : '운영중'} color={partner.isClosed ? 'error' : 'success'} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>코드: {partner.code}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>사업자번호: {partner.businessNumber}</Typography>
                <Typography variant="body2" color="text.secondary">대표: {partner.ceoName || '-'}</Typography>
              </CardContent>
            </Card>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="페이지당:" />
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table><TableHead><TableRow><TableCell>코드</TableCell><TableCell>파트너명</TableCell><TableCell>사업자번호</TableCell><TableCell>대표자명</TableCell><TableCell>내부 담당자</TableCell><TableCell>상태</TableCell></TableRow></TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></TableCell></TableRow> : partners.length === 0 ? <TableRow><TableCell colSpan={6} align="center"><Typography>데이터가 없습니다.</Typography></TableCell></TableRow> : partners.map((partner) => (
                <TableRow key={partner.id} hover onClick={() => navigate(`/partners/${partner.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{partner.code}</TableCell><TableCell>{partner.name}</TableCell>
                  <TableCell>{partner.businessNumber}</TableCell><TableCell>{partner.ceoName || '-'}</TableCell>
                  <TableCell>{partner.managerName || '-'}</TableCell>
                  <TableCell><Chip label={partner.isClosed ? '폐업' : '운영중'} color={partner.isClosed ? 'error' : 'success'} size="small" /></TableCell>
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

export default PartnerListPage;







