import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import apiClient from '../../utils/api';

interface ProjectFormData {
  code: string;
  name: string;
  description: string;
  projectType: string;
  startDate: string;
  endDate: string;
}

const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      projectType: 'DEVELOPMENT',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await apiClient.post('/projects', data);
      setSuccess('프로젝트가 성공적으로 등록되었습니다.');
      
      // 2초 후 목록으로 이동
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(err.message || '프로젝트 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        프로젝트 등록
      </Typography>

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

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="code"
            control={control}
            rules={{ required: '프로젝트 코드는 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="프로젝트 코드"
                fullWidth
                margin="normal"
                error={!!errors.code}
                helperText={errors.code?.message}
                required
              />
            )}
          />

          <Controller
            name="name"
            control={control}
            rules={{ required: '프로젝트명은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="프로젝트명"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
            )}
          />

          <Controller
            name="projectType"
            control={control}
            rules={{ required: '프로젝트 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="프로젝트 유형"
                fullWidth
                margin="normal"
                error={!!errors.projectType}
                helperText={errors.projectType?.message}
                required
              >
                <MenuItem value="SI">SI (시스템 통합)</MenuItem>
                <MenuItem value="SM">SM (시스템 유지보수)</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="프로젝트 설명"
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
            )}
          />

          <Controller
            name="startDate"
            control={control}
            rules={{ required: '시작일은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="시작일"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
                required
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="종료일(예정)"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 3, 
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            <Button
              variant="outlined"
              startIcon={isMobile ? null : <Cancel />}
              onClick={() => navigate('/projects')}
              disabled={loading}
              fullWidth={isMobile}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : (isMobile ? null : <Save />)}
              disabled={loading}
              fullWidth={isMobile}
            >
              {loading ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectCreatePage;

