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
import { getIssue, deleteIssue } from '../../api/issue';
import type { Issue } from '../../types/issue.types';

const IssueDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchIssue(Number(id));
  }, [id]);

  const fetchIssue = async (issueId: number) => {
    try {
      setLoading(true);
      const data = await getIssue(issueId);
      setIssue(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '이슈를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!issue) return;
    try {
      setDeleting(true);
      await deleteIssue(issue.id);
      navigate('/issues');
    } catch (err: any) {
      setError(err.response?.data?.message || '이슈 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      OPEN: 'error', IN_PROGRESS: 'warning', RESOLVED: 'primary', CLOSED: 'success',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { OPEN: '열림', IN_PROGRESS: '진행중', RESOLVED: '해결됨', CLOSED: '종료' };
    return labels[status] || status;
  };

  const getPriorityColor = (priority?: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      LOW: 'default', MEDIUM: 'primary', HIGH: 'warning', CRITICAL: 'error',
    };
    return colors[priority || ''] || 'default';
  };

  const getPriorityLabel = (priority?: string) => {
    const labels: Record<string, string> = { LOW: '낮음', MEDIUM: '보통', HIGH: '높음', CRITICAL: '심각' };
    return labels[priority || ''] || priority || '-';
  };

  const getIssueTypeLabel = (type?: string) => {
    const labels: Record<string, string> = { BUG: '버그', IMPROVEMENT: '개선', NEW_FEATURE: '신규기능', TASK: '작업' };
    return labels[type || ''] || type || '-';
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
  }

  if (error || !issue) {
    return (
      <Box>
        <Alert severity="error">{error || '이슈를 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/issues')} sx={{ mt: 2 }}>목록으로</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={isMobile ? null : <ArrowBack />} onClick={() => navigate('/issues')} size={isMobile ? 'small' : 'medium'}>목록으로</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={isMobile ? null : <Edit />} onClick={() => navigate(`/issues/${issue.id}/edit`)} size={isMobile ? 'small' : 'medium'}>수정</Button>
          <Button variant="outlined" color="error" startIcon={isMobile ? null : <Delete />} onClick={() => setDeleteDialogOpen(true)} size={isMobile ? 'small' : 'medium'}>삭제</Button>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>{issue.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>이슈번호: {issue.issueNumber}</Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip label={getIssueTypeLabel(issue.issueType)} color="primary" />
          <Chip label={getStatusLabel(issue.status)} color={getStatusColor(issue.status)} />
          <Chip label={getPriorityLabel(issue.priority)} color={getPriorityColor(issue.priority)} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>프로젝트</Typography>
            <Typography variant="body1">{issue.projectName || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>보고자</Typography>
            <Typography variant="body1">{issue.reporterName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>담당자</Typography>
            <Typography variant="body1">{issue.assigneeName || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>연결된 SR</Typography>
            <Typography variant="body1">{issue.srNumber || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>연결된 SPEC</Typography>
            <Typography variant="body1">{issue.specNumber || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>상위 이슈</Typography>
            <Typography variant="body1">{issue.parentIssueNumber || '-'}</Typography>
          </Box>
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>내용</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', whiteSpace: 'pre-wrap' }}>
              <Typography variant="body1">{issue.content}</Typography>
            </Paper>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>등록일</Typography>
            <Typography variant="body1">{new Date(issue.createdAt).toLocaleString()}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>수정일</Typography>
            <Typography variant="body1">{new Date(issue.updatedAt).toLocaleString()}</Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>이슈 삭제</DialogTitle>
        <DialogContent><DialogContentText>정말 이 이슈를 삭제하시겠습니까?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>{deleting ? '삭제 중...' : '삭제'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueDetailPage;


