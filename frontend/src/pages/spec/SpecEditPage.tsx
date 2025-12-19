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
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getSpec, updateSpec } from '../../api/spec';
import type { Specification, SpecUpdateRequest } from '../../types/spec.types';

const SpecEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [spec, setSpec] = useState<Specification | null>(null);
  const [formData, setFormData] = useState<SpecUpdateRequest>({
    functionPoint: undefined,
    manDay: undefined,
    status: 'DRAFT',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setFormData({
        functionPoint: data.functionPoint,
        manDay: data.manDay,
        status: data.status,
      });
    } catch (err: any) {
      console.error('Failed to fetch SPEC:', err);
      setError(err.response?.data?.message || 'SPEC을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'functionPoint' || name === 'manDay' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateSpec(Number(id), formData);
      setSuccess('SPEC이 성공적으로 수정되었습니다.');
      setTimeout(() => navigate(`/specs/${id}`), 2000);
    } catch (err: any) {
      console.error('Failed to update SPEC:', err);
      setError(err.response?.data?.message || 'SPEC 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!spec) {
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
      <Button startIcon={<ArrowBack />} onClick={() => navigate(`/specs/${id}`)} sx={{ mb: 2 }}>
        상세로 돌아가기
      </Button>

      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>SPEC 수정</Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>SPEC 정보 (수정 불가)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Chip label={`SPEC번호: ${spec.specNumber}`} variant="outlined" />
          <Chip label={spec.specType === 'DEVELOPMENT' ? '개발' : '운영'} color="primary" />
          <Chip label={`SR: ${spec.srNumber}`} variant="outlined" />
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="FP (Function Point)"
                name="functionPoint"
                type="number"
                value={formData.functionPoint || ''}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.1 }}
              />
              <TextField
                fullWidth
                label="M/D (공수)"
                name="manDay"
                type="number"
                value={formData.manDay || ''}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Box>

            <TextField
              fullWidth
              select
              label="상태"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value="DRAFT">초안</MenuItem>
              <MenuItem value="REVIEW">검토중</MenuItem>
              <MenuItem value="APPROVED">승인됨</MenuItem>
              <MenuItem value="REJECTED">반려됨</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button variant="outlined" startIcon={isMobile ? null : <Cancel />} onClick={() => navigate(`/specs/${id}`)} disabled={saving} fullWidth={isMobile}>
              취소
            </Button>
            <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={20} /> : (isMobile ? null : <Save />)} disabled={saving} fullWidth={isMobile}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SpecEditPage;


