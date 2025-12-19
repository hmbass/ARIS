import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, CircularProgress, Alert, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAssets } from '../../api/asset';
import type { Asset, AssetType } from '../../types/asset.types';

const AssetListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAssets(); }, [page, rowsPerPage]);

  const fetchAssets = async () => {
    setLoading(true); setError('');
    try {
      const response = await getAssets({ page, size: rowsPerPage });
      setAssets(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch assets:', err);
      setError(err.message || '자산 목록을 불러오는데 실패했습니다.');
    } finally { setLoading(false); }
  };

  const getTypeLabel = (type: AssetType) => {
    const labels: Record<AssetType, string> = {
      PC: '데스크톱',
      LAPTOP: '노트북',
      MONITOR: '모니터',
      SERVER: '서버',
      NETWORK: '네트워크',
      PRINTER: '프린터',
      OTHER: '기타',
    };
    return labels[type] || type;
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>자산 관리</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/assets/new')} size={isMobile ? 'small' : 'medium'}>자산 등록</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? <Paper sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></Paper> : assets.length === 0 ? <Paper sx={{ p: 3, textAlign: 'center' }}><Typography>데이터가 없습니다.</Typography></Paper> : assets.map((asset) => (
            <Card key={asset.id} sx={{ cursor: 'pointer', width: '100%' }} onClick={() => navigate(`/assets/${asset.id}`)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>{asset.assetNumber}</Typography>
                  <Chip label={asset.isExpired ? '폐기' : '사용중'} color={asset.isExpired ? 'default' : 'success'} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>유형: {getTypeLabel(asset.assetType)}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>시리얼: {asset.serialNumber || '-'}</Typography>
                <Typography variant="body2" color="text.secondary">담당자: {asset.managerName || '-'}</Typography>
              </CardContent>
            </Card>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination component="div" count={totalElements} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="페이지당:" />
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table><TableHead><TableRow><TableCell>자산번호</TableCell><TableCell>유형</TableCell><TableCell>시리얼번호</TableCell><TableCell>취득일</TableCell><TableCell>담당자</TableCell><TableCell>상태</TableCell></TableRow></TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></TableCell></TableRow> : assets.length === 0 ? <TableRow><TableCell colSpan={6} align="center"><Typography>데이터가 없습니다.</Typography></TableCell></TableRow> : assets.map((asset) => (
                <TableRow key={asset.id} hover onClick={() => navigate(`/assets/${asset.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{asset.assetNumber}</TableCell>
                  <TableCell>{getTypeLabel(asset.assetType)}</TableCell>
                  <TableCell>{asset.serialNumber || '-'}</TableCell>
                  <TableCell>{asset.acquiredAt}</TableCell>
                  <TableCell>{asset.managerName || '-'}</TableCell>
                  <TableCell><Chip label={asset.isExpired ? '폐기' : '사용중'} color={asset.isExpired ? 'default' : 'success'} size="small" /></TableCell>
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

export default AssetListPage;







