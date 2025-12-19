import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getRelease, updateRelease } from '../../api/release';
import type { Release, ReleaseUpdateRequest, ReleaseStatus, ReleaseType } from '../../types/release.types';

const ReleaseEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [release, setRelease] = useState<Release | null>(null);
  const [formData, setFormData] = useState<ReleaseUpdateRequest>({
    title: '',
    content: '',
    scheduledAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) fetchRelease(Number(id));
  }, [id]);

  const fetchRelease = async (releaseId: number) => {
    try {
      setLoading(true);
      const data = await getRelease(releaseId);
      setRelease(data);
      setFormData({
        title: data.title,
        content: data.content || '',
        scheduledAt: data.scheduledAt ? data.scheduledAt.slice(0, 16) : '',
      });
    } catch (err: any) {
      console.error('Failed to fetch release:', err);
      setError(err.response?.data?.message || '릴리즈를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.title) {
        setError('제목은 필수입니다.');
        setSaving(false);
        return;
      }

      await updateRelease(Number(id), formData);
      setSuccess('릴리즈가 성공적으로 수정되었습니다.');
      setTimeout(() => navigate(`/releases/${id}`), 2000);
    } catch (err: any) {
      console.error('Failed to update release:', err);
      setError(err.response?.data?.message || '릴리즈 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!release) {
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
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>릴리즈 수정</Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>릴리즈 정보 (수정 불가)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={`번호: ${release.releaseNumber}`} variant="outlined" />
          <Chip label={`유형: ${getTypeLabel(release.releaseType)}`} variant="outlined" />
          <Chip label={`상태: ${getStatusLabel(release.status)}`} variant="outlined" />
          <Chip label={`요청자: ${release.requesterName}`} variant="outlined" />
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="제목"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="내용"
              name="content"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={4}
            />

            <TextField
              fullWidth
              label="예정 배포일시"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="outlined"
              startIcon={isMobile ? null : <Cancel />}
              onClick={() => navigate(`/releases/${id}`)}
              disabled={saving}
              fullWidth={isMobile}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : (isMobile ? null : <Save />)}
              disabled={saving}
              fullWidth={isMobile}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReleaseEditPage;


