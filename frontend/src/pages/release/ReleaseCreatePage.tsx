import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createRelease } from '../../api/release';
import type { ReleaseCreateRequest } from '../../types/release.types';

const ReleaseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<ReleaseCreateRequest>({
    defaultValues: {
      title: '',
      releaseType: 'REGULAR',
      content: '',
      scheduledAt: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: ReleaseCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 빈 문자열을 undefined로 변환
      const requestData: ReleaseCreateRequest = {
        ...data,
        content: data.content || undefined,
        scheduledAt: data.scheduledAt || undefined,
      };
      await createRelease(requestData);
      setSuccess('릴리즈가 등록되었습니다!');
      setTimeout(() => navigate('/releases'), 2000);
    } catch (err: any) {
      console.error('Failed to create release:', err);
      setError(err.message || '릴리즈 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/releases')}>
          목록으로
        </Button>
        <Typography variant={isMobile ? 'h5' : 'h4'}>릴리즈 등록</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="title"
            control={control}
            rules={{ required: '릴리즈 제목은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="릴리즈 제목"
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title?.message}
                required
              />
            )}
          />

          <Controller
            name="releaseType"
            control={control}
            rules={{ required: '릴리즈 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="릴리즈 유형"
                fullWidth
                margin="normal"
                error={!!errors.releaseType}
                helperText={errors.releaseType?.message}
                required
              >
                <MenuItem value="REGULAR">정기</MenuItem>
                <MenuItem value="EMERGENCY">긴급</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="릴리즈 내용"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                helperText="선택사항"
              />
            )}
          />

          <Controller
            name="scheduledAt"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="예정 배포일시"
                type="datetime-local"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                helperText="선택사항"
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/releases')}
              fullWidth={isMobile}
              startIcon={!isMobile && <ArrowBack />}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth={isMobile}
              startIcon={!isMobile && <Save />}
            >
              {loading ? '등록 중...' : '등록'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReleaseCreatePage;
