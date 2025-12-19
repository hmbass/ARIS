import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  CalendarToday,
  Person,
  Business,
  Description,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject, deleteProject } from '../../api/project';
import type { Project } from '../../types/project.types';

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
    }
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await getProject(projectId);
      setProject(data);
    } catch (err: any) {
      console.error('Failed to fetch project:', err);
      setError(err.response?.data?.message || '프로젝트 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await deleteProject(parseInt(id));
      setDeleteDialogOpen(false);
      navigate('/projects', { replace: true });
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setError(err.response?.data?.message || '프로젝트 삭제에 실패했습니다.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      PREPARING: 'default',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PREPARING: '준비',
      IN_PROGRESS: '진행중',
      COMPLETED: '완료',
      CANCELLED: '취소',
    };
    return labels[status] || status;
  };

  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SI: 'SI (시스템 통합)',
      SM: 'SM (시스템 유지보수)',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')}>
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
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/projects')}
            sx={{ mb: 1 }}
          >
            목록으로
          </Button>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 600 }}>
            {project.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip 
              label={project.code} 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={getStatusLabel(project.status)} 
              color={getStatusColor(project.status)}
              size="small"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/projects/${id}/edit`)}
            size={isMobile ? 'small' : 'medium'}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            삭제
          </Button>
        </Box>
      </Box>

      {/* Project Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          기본 정보
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Business sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                프로젝트 유형
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getProjectTypeLabel(project.projectType)}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                시작일
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {project.startDate}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                종료일
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {project.endDate || '미정'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                PM (프로젝트 관리자)
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {project.pmName || '미지정'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Business sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                회사
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {project.companyName}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                예산
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {project.budget ? `${project.budget.toLocaleString()}원` : '미정'}
            </Typography>
          </Grid>
        </Grid>

        {project.description && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <Description sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                프로젝트 설명
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
              {project.description}
            </Typography>
          </>
        )}
      </Paper>

      {/* Meta Info */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          등록 정보
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              등록자
            </Typography>
            <Typography variant="body1">
              {project.createdBy}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              등록일
            </Typography>
            <Typography variant="body1">
              {new Date(project.createdAt).toLocaleString('ko-KR')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              수정자
            </Typography>
            <Typography variant="body1">
              {project.updatedBy}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              수정일
            </Typography>
            <Typography variant="body1">
              {new Date(project.updatedAt).toLocaleString('ko-KR')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>프로젝트 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 프로젝트를 삭제하시겠습니까?<br />
            <strong>{project.name}</strong><br /><br />
            이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            취소
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetailPage;


