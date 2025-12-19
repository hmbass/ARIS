import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, CircularProgress, Alert,
  Card, CardContent, useMediaQuery, useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getApprovals } from '../../api/approval';
import type { Approval } from '../../types/approval.types';

const ApprovalListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, [page, rowsPerPage]);

  const fetchApprovals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getApprovals({ page, size: rowsPerPage });
      setApprovals(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch approvals:', err);
      setError(err.message || '승인 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      PENDING: 'warning', APPROVED: 'success', REJECTED: 'error', CANCELLED: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '대기중', APPROVED: '승인됨', REJECTED: '반려됨', CANCELLED: '취소됨',
    };
    return labels[status] || status;
  };

  const getApprovalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SR: 'SR', SPEC: 'SPEC', RELEASE: '릴리즈', DATA_EXTRACTION: '데이터추출',
    };
    return labels[type] || type;
  };

  // 현재 승인 단계의 승인자 이름 가져오기
  const getCurrentApproverName = (approval: Approval) => {
    if (!approval.approvalLines || approval.approvalLines.length === 0) {
      return '-';
    }
    const currentLine = approval.approvalLines.find(line => line.stepOrder === approval.currentStep);
    return currentLine?.approverName || '-';
  };

  // 모든 승인자 이름 가져오기
  const getAllApproverNames = (approval: Approval) => {
    if (!approval.approvalLines || approval.approvalLines.length === 0) {
      return '-';
    }
    return approval.approvalLines.map(line => line.approverName).join(' → ');
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>승인 관리</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/approvals/new')} size={isMobile ? 'small' : 'medium'}>
          승인 요청
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></Paper>
          ) : approvals.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}><Typography>데이터가 없습니다.</Typography></Paper>
          ) : (
            approvals.map((approval) => (
              <Card key={approval.id} sx={{ cursor: 'pointer', width: '100%' }} onClick={() => navigate(`/approvals/${approval.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>{approval.approvalNumber}</Typography>
                    <Chip label={getStatusLabel(approval.status)} color={getStatusColor(approval.status)} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>유형: {getApprovalTypeLabel(approval.approvalType)}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>요청자: {approval.requesterName}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>승인자: {getAllApproverNames(approval)}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>진행: {approval.currentStep}/{approval.totalSteps}단계</Typography>
                  <Typography variant="body2" color="text.secondary">요청일: {new Date(approval.createdAt).toLocaleDateString()}</Typography>
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
                <TableCell>승인번호</TableCell>
                <TableCell>유형</TableCell>
                <TableCell>요청자</TableCell>
                <TableCell>승인자</TableCell>
                <TableCell>진행단계</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>요청일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /><Typography sx={{ mt: 1 }}>로딩 중...</Typography></TableCell></TableRow>
              ) : approvals.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center"><Typography>데이터가 없습니다.</Typography></TableCell></TableRow>
              ) : (
                approvals.map((approval) => (
                  <TableRow key={approval.id} hover onClick={() => navigate(`/approvals/${approval.id}`)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{approval.approvalNumber}</TableCell>
                    <TableCell><Chip label={getApprovalTypeLabel(approval.approvalType)} size="small" color="primary" /></TableCell>
                    <TableCell>{approval.requesterName}</TableCell>
                    <TableCell>{getCurrentApproverName(approval)}</TableCell>
                    <TableCell>{approval.currentStep}/{approval.totalSteps}</TableCell>
                    <TableCell><Chip label={getStatusLabel(approval.status)} color={getStatusColor(approval.status)} size="small" /></TableCell>
                    <TableCell>{new Date(approval.createdAt).toLocaleDateString()}</TableCell>
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

export default ApprovalListPage;







