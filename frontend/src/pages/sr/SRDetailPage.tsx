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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { getSr, deleteSr } from '../../api/sr';
import type { ServiceRequest } from '../../types/sr.types';

const SRDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [sr, setSr] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSr(Number(id));
    }
  }, [id]);

  const fetchSr = async (srId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await getSr(srId);
      setSr(data);
    } catch (err: any) {
      console.error('Failed to fetch SR:', err);
      setError(err.message || 'SR을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sr || !window.confirm('정말 이 SR을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteSr(sr.id);
      alert('SR이 삭제되었습니다.');
      navigate('/srs');
    } catch (err: any) {
      console.error('Failed to delete SR:', err);
      setError(err.message || 'SR 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      REQUESTED: 'primary',
      APPROVAL_REQUESTED: 'warning',
      APPROVED: 'primary',
      IN_PROGRESS: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'error',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      REQUESTED: '요청됨',
      APPROVAL_REQUESTED: '승인요청',
      APPROVED: '승인됨',
      IN_PROGRESS: '진행중',
      COMPLETED: '완료',
      CANCELLED: '취소됨',
      REJECTED: '반려됨',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      LOW: 'default',
      MEDIUM: 'primary',
      HIGH: 'warning',
      URGENT: 'error',
    };
    return colors[priority] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: '낮음',
      MEDIUM: '보통',
      HIGH: '높음',
      URGENT: '긴급',
    };
    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !sr) {
    return (
      <Box>
        <Alert severity="error">{error || 'SR을 찾을 수 없습니다.'}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/srs')}
          sx={{ mt: 2 }}
        >
          목록으로
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 1,
        width: '100%',
      }}>
        <Button 
          startIcon={isMobile ? null : <ArrowBack />}
          onClick={() => navigate('/srs')}
          size={isMobile ? 'small' : 'medium'}
        >
          목록으로
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={isMobile ? null : <Edit />}
            onClick={() => navigate(`/srs/${sr.id}/edit`)}
            size={isMobile ? 'small' : 'medium'}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={isMobile ? null : <Delete />}
            onClick={handleDelete}
            disabled={deleting}
            size={isMobile ? 'small' : 'medium'}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant={isMobile ? 'h5' : 'h4'}>
            {sr.title}
          </Typography>
          <Chip label={sr.srNumber} variant="outlined" />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={sr.srType === 'DEVELOPMENT' ? '개발' : '운영'}
            color={sr.srType === 'DEVELOPMENT' ? 'primary' : 'secondary'}
          />
          <Chip
            label={getStatusLabel(sr.status)}
            color={getStatusColor(sr.status)}
          />
          <Chip
            label={getPriorityLabel(sr.priority)}
            color={getPriorityColor(sr.priority)}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              프로젝트
            </Typography>
            <Typography variant="body1" gutterBottom>
              {sr.projectName}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              요청자
            </Typography>
            <Typography variant="body1" gutterBottom>
              {sr.requesterName} {sr.requesterDeptName && `(${sr.requesterDeptName})`}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              요청일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {sr.requestDate || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              완료 희망일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {sr.dueDate || '-'}
            </Typography>
          </Box>

          {sr.specNumber && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                연결된 SPEC
              </Typography>
              <Typography variant="body1" gutterBottom>
                {sr.specNumber}
              </Typography>
            </Box>
          )}

          {sr.releaseNumber && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                릴리즈 정보
              </Typography>
              <Typography variant="body1" gutterBottom>
                {sr.releaseNumber} ({sr.releaseDate})
              </Typography>
            </Box>
          )}

          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              비즈니스 요구사항
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', whiteSpace: 'pre-wrap' }}
            >
              <Typography variant="body1">{sr.businessRequirement}</Typography>
            </Paper>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              등록일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(sr.createdAt).toLocaleString()} ({sr.createdBy})
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              수정일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(sr.updatedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SRDetailPage;

