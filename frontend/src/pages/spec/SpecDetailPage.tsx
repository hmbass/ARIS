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
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { getSpec, deleteSpec } from '../../api/spec';
import type { Specification } from '../../types/spec.types';

const SpecDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [spec, setSpec] = useState<Specification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSpec(Number(id));
    }
  }, [id]);

  const fetchSpec = async (specId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await getSpec(specId);
      setSpec(data);
    } catch (err: any) {
      console.error('Failed to fetch SPEC:', err);
      setError(err.response?.data?.message || 'SPEC을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!spec) return;
    try {
      setDeleting(true);
      await deleteSpec(spec.id);
      navigate('/specs');
    } catch (err: any) {
      console.error('Failed to delete SPEC:', err);
      setError(err.response?.data?.message || 'SPEC 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      DRAFT: 'default',
      REVIEW: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: '초안',
      REVIEW: '검토중',
      APPROVED: '승인됨',
      REJECTED: '반려됨',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !spec) {
    return (
      <Box>
        <Alert severity="error">{error || 'SPEC을 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/specs')} sx={{ mt: 2 }}>
          목록으로
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={isMobile ? null : <ArrowBack />} onClick={() => navigate('/specs')} size={isMobile ? 'small' : 'medium'}>
          목록으로
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={isMobile ? null : <Edit />} onClick={() => navigate(`/specs/${spec.id}/edit`)} size={isMobile ? 'small' : 'medium'}>
            수정
          </Button>
          <Button variant="outlined" color="error" startIcon={isMobile ? null : <Delete />} onClick={() => setDeleteDialogOpen(true)} size={isMobile ? 'small' : 'medium'}>
            삭제
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant={isMobile ? 'h5' : 'h4'}>SPEC 상세</Typography>
          <Chip label={spec.specNumber} variant="outlined" />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={spec.specType === 'DEVELOPMENT' ? '개발' : '운영'} color={spec.specType === 'DEVELOPMENT' ? 'primary' : 'secondary'} />
          <Chip label={getStatusLabel(spec.status)} color={getStatusColor(spec.status)} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>연결된 SR</Typography>
            <Typography variant="body1">{spec.srNumber} - {spec.srTitle}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>담당자</Typography>
            <Typography variant="body1">{spec.assigneeName || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>FP (Function Point)</Typography>
            <Typography variant="body1">{spec.functionPoint || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>M/D (공수)</Typography>
            <Typography variant="body1">{spec.manDay || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>검토자</Typography>
            <Typography variant="body1">{spec.reviewerName || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>검토일</Typography>
            <Typography variant="body1">{spec.reviewedAt ? new Date(spec.reviewedAt).toLocaleString() : '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>등록일</Typography>
            <Typography variant="body1">{new Date(spec.createdAt).toLocaleString()} ({spec.createdBy})</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>수정일</Typography>
            <Typography variant="body1">{new Date(spec.updatedAt).toLocaleString()}</Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>SPEC 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>정말 이 SPEC을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpecDetailPage;


