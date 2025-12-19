import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getSr, updateSr } from '../../api/sr';
import type { ServiceRequest, SrUpdateRequest, Priority } from '../../types/sr.types';

const SREditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [sr, setSr] = useState<ServiceRequest | null>(null);
  const [formData, setFormData] = useState<SrUpdateRequest>({
    title: '',
    businessRequirement: '',
    priority: 'MEDIUM',
    dueDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setFormData({
        title: data.title,
        businessRequirement: data.businessRequirement || '',
        priority: data.priority,
        dueDate: data.dueDate || '',
      });
    } catch (err: any) {
      console.error('Failed to fetch SR:', err);
      setError(err.response?.data?.message || 'SR을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // 필수 필드 검증
      if (!formData.title || !formData.businessRequirement) {
        setError('제목과 비즈니스 요구사항은 필수 입력 항목입니다.');
        setSaving(false);
        return;
      }

      const payload: SrUpdateRequest = {
        title: formData.title,
        businessRequirement: formData.businessRequirement,
        priority: formData.priority as Priority,
        dueDate: formData.dueDate || undefined,
      };

      await updateSr(Number(id), payload);
      setSuccess('SR이 성공적으로 수정되었습니다.');
      setTimeout(() => navigate(`/srs/${id}`), 2000);
    } catch (err: any) {
      console.error('Failed to update SR:', err);
      setError(err.response?.data?.message || 'SR 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !sr) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/srs')}
        >
          목록으로
        </Button>
      </Box>
    );
  }

  if (!sr) {
    return (
      <Box>
        <Alert severity="warning">SR을 찾을 수 없습니다.</Alert>
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
    <Box sx={{ width: '100%' }}>
      <Button 
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/srs/${id}`)}
        sx={{ mb: 2 }}
      >
        상세로 돌아가기
      </Button>

      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        SR 수정
      </Typography>

      {/* SR 기본 정보 (읽기 전용) */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          SR 정보 (수정 불가)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Chip label={`SR번호: ${sr.srNumber}`} variant="outlined" />
          <Chip label={sr.srType === 'DEVELOPMENT' ? '개발' : '운영'} color="primary" />
          <Chip label={getStatusLabel(sr.status)} color={getStatusColor(sr.status)} />
          <Chip label={`프로젝트: ${sr.projectName}`} variant="outlined" />
          <Chip label={`요청자: ${sr.requesterName}`} variant="outlined" />
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="제목"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="SR 제목을 입력하세요"
            />

            <TextField
              fullWidth
              label="비즈니스 요구사항"
              name="businessRequirement"
              value={formData.businessRequirement}
              onChange={handleChange}
              required
              multiline
              rows={6}
              placeholder="비즈니스 요구사항을 상세히 입력하세요"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                select
                label="우선순위"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <MenuItem value="LOW">낮음</MenuItem>
                <MenuItem value="MEDIUM">보통</MenuItem>
                <MenuItem value="HIGH">높음</MenuItem>
                <MenuItem value="URGENT">긴급</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="완료 희망일"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            <Button
              variant="outlined"
              startIcon={isMobile ? null : <Cancel />}
              onClick={() => navigate(`/srs/${id}`)}
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

export default SREditPage;


