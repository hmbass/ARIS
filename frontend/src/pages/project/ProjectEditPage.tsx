import React, { useEffect, useState } from 'react';
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
  Autocomplete,
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { getProject, updateProject, getPmCandidates, type PmCandidate } from '../../api/project';
import type { Project, ProjectRequest } from '../../types/project.types';

interface ProjectFormData {
  code: string;
  name: string;
  description: string;
  projectType: string;
  startDate: string;
  endDate: string;
  budget: string;
  pmId: number | null;
}

const ProjectEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<PmCandidate[]>([]);
  const [selectedPm, setSelectedPm] = useState<PmCandidate | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      projectType: 'SI',
      startDate: '',
      endDate: '',
      budget: '',
      pmId: null,
    },
  });

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id));
    }
  }, [id]);

  const fetchData = async (projectId: number) => {
    try {
      setLoading(true);
      setError('');
      
      // 프로젝트 정보 조회
      const projectData = await getProject(projectId);
      setProject(projectData);
      
      // 폼 초기값 설정
      reset({
        code: projectData.code,
        name: projectData.name,
        description: projectData.description || '',
        projectType: projectData.projectType,
        startDate: projectData.startDate,
        endDate: projectData.endDate || '',
        budget: projectData.budget?.toString() || '',
        pmId: projectData.pmId || null,
      });
      
      // PM 후보 사용자 목록 조회 (실패해도 프로젝트는 표시)
      try {
        const usersResponse = await getPmCandidates();
        setUsers(usersResponse.content);
        
        // PM 선택 초기화
        if (projectData.pmId) {
          const pm = usersResponse.content.find(u => u.id === projectData.pmId);
          if (pm) setSelectedPm(pm);
        }
      } catch (userErr) {
        console.error('Failed to fetch PM candidates:', userErr);
        // PM 후보 목록 조회 실패는 무시하고 진행
      }
    } catch (err: any) {
      console.error('Failed to fetch project:', err);
      setError(err.response?.data?.message || '프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!id || !project) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const requestData: ProjectRequest = {
        code: data.code,
        name: data.name,
        projectType: data.projectType as 'SI' | 'SM',
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        companyId: project.companyId,
        description: data.description || undefined,
        budget: data.budget ? parseInt(data.budget) : undefined,
        pmId: selectedPm?.id || undefined,
      };

      await updateProject(parseInt(id), requestData);
      setSuccess('프로젝트가 성공적으로 수정되었습니다.');
      
      // 2초 후 상세 페이지로 이동
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to update project:', err);
      setError(err.response?.data?.message || '프로젝트 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !project) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="warning">프로젝트를 찾을 수 없습니다.</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(`/projects/${id}`)}
        sx={{ mb: 2 }}
      >
        상세로 돌아가기
      </Button>

      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        프로젝트 수정
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

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                disabled // 코드는 수정 불가
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

          {/* PM 선택 필드 */}
          <Autocomplete
            options={users}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            value={selectedPm}
            onChange={(_, newValue) => setSelectedPm(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="PM (프로젝트 관리자)"
                margin="normal"
                placeholder="PM을 선택하세요"
                helperText="등록된 사용자 중에서 선택할 수 있습니다"
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email} {option.position && `· ${option.position}`}
                  </Typography>
                </Box>
              </li>
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
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

          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="예산 (원)"
                type="number"
                fullWidth
                margin="normal"
                placeholder="예: 100000000"
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
              onClick={() => navigate(`/projects/${id}`)}
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

export default ProjectEditPage;


