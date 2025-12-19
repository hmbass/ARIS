import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Check, Close, Delete } from '@mui/icons-material';
import { getApproval, processApproval, deleteApproval } from '../../api/approval';
import type { Approval } from '../../types/approval.types';

const ApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [approval, setApproval] = useState<Approval | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) fetchApproval(Number(id));
  }, [id]);

  const fetchApproval = async (approvalId: number) => {
    try {
      setLoading(true);
      const data = await getApproval(approvalId);
      setApproval(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '승인 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (status: 'APPROVED' | 'REJECTED') => {
    if (!approval) return;
    try {
      setProcessing(true);
      await processApproval(approval.id, { status, comment: comment || undefined });
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      setComment('');
      // 승인/반려 처리 후 목록으로 이동
      navigate('/approvals');
    } catch (err: any) {
      setError(err.response?.data?.message || '승인 처리에 실패했습니다.');
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!approval) return;
    try {
      setProcessing(true);
      await deleteApproval(approval.id);
      navigate('/approvals');
    } catch (err: any) {
      setError(err.response?.data?.message || '승인 요청 취소에 실패했습니다.');
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      PENDING: 'warning', APPROVED: 'success', REJECTED: 'error', CANCELLED: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { PENDING: '대기중', APPROVED: '승인됨', REJECTED: '반려됨', CANCELLED: '취소됨' };
    return labels[status] || status;
  };

  const getApprovalTypeLabel = (type: string) => {
    const labels: Record<string, string> = { SR: 'SR', SPEC: 'SPEC', RELEASE: '릴리즈', DATA_EXTRACTION: '데이터추출' };
    return labels[type] || type;
  };

  const getLineStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      PENDING: 'warning', APPROVED: 'success', REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
  }

  if (error || !approval) {
    return (
      <Box>
        <Alert severity="error">{error || '승인 정보를 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/approvals')} sx={{ mt: 2 }}>목록으로</Button>
      </Box>
    );
  }

  const isPending = approval.status === 'PENDING';

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={isMobile ? null : <ArrowBack />} onClick={() => navigate('/approvals')} size={isMobile ? 'small' : 'medium'}>목록으로</Button>
        {isPending && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="success" startIcon={isMobile ? null : <Check />} onClick={() => setApproveDialogOpen(true)} size={isMobile ? 'small' : 'medium'}>승인</Button>
            <Button variant="contained" color="error" startIcon={isMobile ? null : <Close />} onClick={() => setRejectDialogOpen(true)} size={isMobile ? 'small' : 'medium'}>반려</Button>
            <Button variant="outlined" color="error" startIcon={isMobile ? null : <Delete />} onClick={() => setDeleteDialogOpen(true)} size={isMobile ? 'small' : 'medium'}>취소</Button>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'}>승인 상세</Typography>
            <Typography variant="body2" color="text.secondary">{approval.approvalNumber}</Typography>
          </Box>
          <Chip label={getStatusLabel(approval.status)} color={getStatusColor(approval.status)} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>승인 유형</Typography>
            <Chip label={getApprovalTypeLabel(approval.approvalType)} color="primary" size="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>대상 ID</Typography>
            <Typography variant="body1">{approval.targetId}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>요청자</Typography>
            <Typography variant="body1">{approval.requesterName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>진행 단계</Typography>
            <Typography variant="body1">{approval.currentStep} / {approval.totalSteps}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>요청일</Typography>
            <Typography variant="body1">{approval.requestedAt ? new Date(approval.requestedAt).toLocaleString() : new Date(approval.createdAt).toLocaleString()}</Typography>
          </Box>
          {approval.completedAt && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>완료일</Typography>
              <Typography variant="body1">{new Date(approval.completedAt).toLocaleString()}</Typography>
            </Box>
          )}
        </Box>

        {/* 승인 라인 (단계별 승인자) */}
        {approval.approvalLines && approval.approvalLines.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>승인 라인</Typography>
            <Stepper activeStep={approval.currentStep - 1} alternativeLabel sx={{ mt: 2 }}>
              {approval.approvalLines.map((line) => (
                <Step key={line.id} completed={line.status === 'APPROVED'}>
                  <StepLabel
                    error={line.status === 'REJECTED'}
                    optional={
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={getStatusLabel(line.status)} 
                          color={getLineStatusColor(line.status)} 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  >
                    {line.approverName}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* 각 승인자별 상세 정보 */}
            <Paper variant="outlined" sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
              {approval.approvalLines.map((line, index) => (
                <Box key={line.id} sx={{ mb: index < approval.approvalLines.length - 1 ? 2 : 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">
                      {line.stepOrder}단계: {line.approverName}
                    </Typography>
                    <Chip label={getStatusLabel(line.status)} color={getLineStatusColor(line.status)} size="small" />
                  </Box>
                  {line.approvedAt && (
                    <Typography variant="body2" color="text.secondary">
                      처리일: {new Date(line.approvedAt).toLocaleString()}
                    </Typography>
                  )}
                  {line.comment && (
                    <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                      의견: {line.comment}
                    </Typography>
                  )}
                  {index < approval.approvalLines.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Paper>
          </Box>
        )}
      </Paper>

      {/* 승인 다이얼로그 */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>승인 확인</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>이 요청을 승인하시겠습니까?</DialogContentText>
          <TextField fullWidth label="의견 (선택사항)" value={comment} onChange={(e) => setComment(e.target.value)} multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>취소</Button>
          <Button onClick={() => handleProcess('APPROVED')} color="success" disabled={processing}>{processing ? '처리 중...' : '승인'}</Button>
        </DialogActions>
      </Dialog>

      {/* 반려 다이얼로그 */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>반려 확인</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>이 요청을 반려하시겠습니까?</DialogContentText>
          <TextField fullWidth label="반려 사유" value={comment} onChange={(e) => setComment(e.target.value)} multiline rows={3} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>취소</Button>
          <Button onClick={() => handleProcess('REJECTED')} color="error" disabled={processing || !comment}>{processing ? '처리 중...' : '반려'}</Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>승인 요청 취소</DialogTitle>
        <DialogContent><DialogContentText>정말 이 승인 요청을 취소하시겠습니까?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>아니오</Button>
          <Button onClick={handleDelete} color="error" disabled={processing}>{processing ? '처리 중...' : '취소'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalDetailPage;


