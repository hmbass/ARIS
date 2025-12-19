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
import { getIncident, deleteIncident } from '../../api/incident';
import type { Incident } from '../../types/incident.types';

const IncidentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchIncident(Number(id));
  }, [id]);

  const fetchIncident = async (incidentId: number) => {
    try {
      setLoading(true);
      const data = await getIncident(incidentId);
      setIncident(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '장애를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!incident) return;
    try {
      setDeleting(true);
      await deleteIncident(incident.id);
      navigate('/incidents');
    } catch (err: any) {
      setError(err.response?.data?.message || '장애 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      OPEN: 'error', INVESTIGATING: 'warning', RESOLVED: 'primary', CLOSED: 'success',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { OPEN: '발생', INVESTIGATING: '조사중', RESOLVED: '해결됨', CLOSED: '종료' };
    return labels[status] || status;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      LOW: 'default', MEDIUM: 'primary', HIGH: 'warning', CRITICAL: 'error',
    };
    return colors[severity] || 'default';
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = { LOW: '낮음', MEDIUM: '보통', HIGH: '높음', CRITICAL: '심각' };
    return labels[severity] || severity;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
  }

  if (error || !incident) {
    return (
      <Box>
        <Alert severity="error">{error || '장애를 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/incidents')} sx={{ mt: 2 }}>목록으로</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={isMobile ? null : <ArrowBack />} onClick={() => navigate('/incidents')} size={isMobile ? 'small' : 'medium'}>목록으로</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={isMobile ? null : <Edit />} onClick={() => navigate(`/incidents/${incident.id}/edit`)} size={isMobile ? 'small' : 'medium'}>수정</Button>
          <Button variant="outlined" color="error" startIcon={isMobile ? null : <Delete />} onClick={() => setDeleteDialogOpen(true)} size={isMobile ? 'small' : 'medium'}>삭제</Button>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>{incident.title}</Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={getStatusLabel(incident.status)} color={getStatusColor(incident.status)} />
          <Chip label={getSeverityLabel(incident.severity)} color={getSeverityColor(incident.severity)} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>프로젝트</Typography>
            <Typography variant="body1">{incident.projectName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>보고자</Typography>
            <Typography variant="body1">{incident.reporterName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>담당자</Typography>
            <Typography variant="body1">{incident.assigneeName || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>발생일시</Typography>
            <Typography variant="body1">{new Date(incident.occurredAt).toLocaleString()}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>해결일시</Typography>
            <Typography variant="body1">{incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : '-'}</Typography>
          </Box>
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>설명</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', whiteSpace: 'pre-wrap' }}>
              <Typography variant="body1">{incident.description}</Typography>
            </Paper>
          </Box>
          {incident.rootCause && (
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>원인</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', whiteSpace: 'pre-wrap' }}>
                <Typography variant="body1">{incident.rootCause}</Typography>
              </Paper>
            </Box>
          )}
          {incident.solution && (
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>해결방안</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', whiteSpace: 'pre-wrap' }}>
                <Typography variant="body1">{incident.solution}</Typography>
              </Paper>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>등록일</Typography>
            <Typography variant="body1">{new Date(incident.createdAt).toLocaleString()}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>수정일</Typography>
            <Typography variant="body1">{new Date(incident.updatedAt).toLocaleString()}</Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>장애 삭제</DialogTitle>
        <DialogContent><DialogContentText>정말 이 장애를 삭제하시겠습니까?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>{deleting ? '삭제 중...' : '삭제'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncidentDetailPage;


