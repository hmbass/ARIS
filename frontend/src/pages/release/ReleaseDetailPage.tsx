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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Edit, Delete, Rocket, Cancel } from '@mui/icons-material';
import { getRelease, deleteRelease, deployRelease, cancelRelease } from '../../api/release';
import type { Release, ReleaseStatus, ReleaseType } from '../../types/release.types';

const ReleaseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) fetchRelease(Number(id));
  }, [id]);

  const fetchRelease = async (releaseId: number) => {
    try {
      setLoading(true);
      const data = await getRelease(releaseId);
      setRelease(data);
    } catch (err: any) {
      console.error('Failed to fetch release:', err);
      setError(err.response?.data?.message || '릴리즈를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!release) return;
    try {
      setProcessing(true);
      await deleteRelease(release.id);
      navigate('/releases');
    } catch (err: any) {
      setError(err.response?.data?.message || '릴리즈 삭제에 실패했습니다.');
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeploy = async () => {
    if (!release) return;
    try {
      setProcessing(true);
      const updated = await deployRelease(release.id);
      setRelease(updated);
      setDeployDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || '릴리즈 배포에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!release) return;
    try {
      setProcessing(true);
      const updated = await cancelRelease(release.id);
      setRelease(updated);
      setCancelDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || '릴리즈 취소에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: ReleaseStatus) => {
    const colors: Record<ReleaseStatus, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
      REQUESTED: 'info',
      APPROVED: 'primary',
      DEPLOYED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: ReleaseStatus) => {
    const labels: Record<ReleaseStatus, string> = {
      REQUESTED: '요청됨',
      APPROVED: '승인됨',
      DEPLOYED: '배포완료',
      CANCELLED: '취소됨',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: ReleaseType) => {
    const labels: Record<ReleaseType, string> = {
      EMERGENCY: '긴급',
      REGULAR: '정기',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: ReleaseType) => {
    return type === 'EMERGENCY' ? 'error' : 'default';
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  // 배포 가능 여부 확인 (승인됨 상태일 때만)
  const canDeploy = release?.status === 'APPROVED';
  // 취소 가능 여부 확인 (배포완료, 취소됨 제외)
  const canCancel = release?.status !== 'DEPLOYED' && release?.status !== 'CANCELLED';
  // 수정 가능 여부 확인 (배포완료, 취소됨 제외)
  const canEdit = release?.status !== 'DEPLOYED' && release?.status !== 'CANCELLED';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !release) {
    return (
      <Box>
        <Alert severity="error">{error || '릴리즈를 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/releases')} sx={{ mt: 2 }}>
          목록으로
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={isMobile ? null : <ArrowBack />} onClick={() => navigate('/releases')} size={isMobile ? 'small' : 'medium'}>
          목록으로
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {canDeploy && (
            <Button
              variant="contained"
              color="success"
              startIcon={isMobile ? null : <Rocket />}
              onClick={() => setDeployDialogOpen(true)}
              size={isMobile ? 'small' : 'medium'}
            >
              배포
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={isMobile ? null : <Cancel />}
              onClick={() => setCancelDialogOpen(true)}
              size={isMobile ? 'small' : 'medium'}
            >
              취소
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={isMobile ? null : <Edit />}
              onClick={() => navigate(`/releases/${release.id}/edit`)}
              size={isMobile ? 'small' : 'medium'}
            >
              수정
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={isMobile ? null : <Delete />}
            onClick={() => setDeleteDialogOpen(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            삭제
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>{release.releaseNumber}</Typography>
            <Typography variant={isMobile ? 'h5' : 'h4'}>{release.title}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={getStatusLabel(release.status)} color={getStatusColor(release.status)} />
          <Chip label={getTypeLabel(release.releaseType)} color={getTypeColor(release.releaseType)} variant="outlined" />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>요청자</Typography>
            <Typography variant="body1">{release.requesterName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>예정 배포일</Typography>
            <Typography variant="body1">{formatDateTime(release.scheduledAt)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>실제 배포일</Typography>
            <Typography variant="body1">{formatDateTime(release.deployedAt)}</Typography>
          </Box>
          {release.approverName && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>승인자</Typography>
              <Typography variant="body1">{release.approverName}</Typography>
            </Box>
          )}
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>내용</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', whiteSpace: 'pre-wrap' }}>
              <Typography variant="body1">{release.content || '-'}</Typography>
            </Paper>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>등록일</Typography>
            <Typography variant="body1">{formatDateTime(release.createdAt)} ({release.createdBy})</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>수정일</Typography>
            <Typography variant="body1">{formatDateTime(release.updatedAt)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>릴리즈 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>정말 이 릴리즈를 삭제하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" disabled={processing}>
            {processing ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 배포 확인 다이얼로그 */}
      <Dialog open={deployDialogOpen} onClose={() => setDeployDialogOpen(false)}>
        <DialogTitle>릴리즈 배포</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 릴리즈를 배포하시겠습니까?<br />
            배포 완료 시 실제 배포일이 현재 시간으로 기록됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeployDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeploy} color="success" variant="contained" disabled={processing}>
            {processing ? '배포 중...' : '배포 완료'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 취소 확인 다이얼로그 */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>릴리즈 취소</DialogTitle>
        <DialogContent>
          <DialogContentText>이 릴리즈를 취소하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>닫기</Button>
          <Button onClick={handleCancel} color="warning" variant="contained" disabled={processing}>
            {processing ? '처리 중...' : '릴리즈 취소'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReleaseDetailPage;


