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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createSr } from '../../api/sr';
import { getProjects } from '../../api/project';
import type { SrCreateRequest } from '../../types/sr.types';
import type { Project } from '../../types/project.types';

const SRCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState<SrCreateRequest>({
    title: '',
    description: '',
    srType: 'DEVELOPMENT',
    priority: 'MEDIUM',
    projectId: 0,
    expectedDate: '',
    estimatedManday: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await getProjects({ page: 0, size: 100 }); // 최대 100개 프로젝트
      setProjects(response.content);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'projectId' || name === 'estimatedManday' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 필수 필드 검증
      if (!formData.title || !formData.description || !formData.projectId) {
        setError('제목, 설명, 프로젝트는 필수 입력 항목입니다.');
        setLoading(false);
        return;
      }

      // API 호출을 위한 데이터 준비
      const payload: SrCreateRequest = {
        title: formData.title,
        description: formData.description,
        srType: formData.srType,
        priority: formData.priority,
        projectId: formData.projectId,
        expectedDate: formData.expectedDate || undefined,
        estimatedManday: formData.estimatedManday || undefined,
      };

      await createSr(payload);
      setSuccess('SR이 성공적으로 등록되었습니다.');
      setTimeout(() => navigate('/srs'), 2000); // 2초 후 목록으로 이동
    } catch (err: any) {
      console.error('Failed to create SR:', err);
      setError(err.message || 'SR 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProjects) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        새 SR 등록
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
              label="설명"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
              placeholder="SR 내용을 상세히 입력하세요"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                select
                label="SR 유형"
                name="srType"
                value={formData.srType}
                onChange={handleChange}
                required
              >
                <MenuItem value="DEVELOPMENT">개발</MenuItem>
                <MenuItem value="OPERATION">운영</MenuItem>
              </TextField>

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
            </Box>

            <TextField
              fullWidth
              select
              label="프로젝트"
              name="projectId"
              value={formData.projectId || ''}
              onChange={handleChange}
              required
            >
              <MenuItem value="">선택하세요</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="희망 완료일"
                name="expectedDate"
                type="date"
                value={formData.expectedDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="예상 공수 (M/D)"
                name="estimatedManday"
                type="number"
                value={formData.estimatedManday || ''}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.5 }}
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
              onClick={() => navigate('/srs')}
              disabled={loading}
              fullWidth={isMobile}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              fullWidth={isMobile}
            >
              {loading ? <CircularProgress size={24} /> : '등록'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SRCreatePage;

