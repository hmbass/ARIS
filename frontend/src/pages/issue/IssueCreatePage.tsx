import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Alert,
  useMediaQuery, useTheme, Autocomplete, CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createIssue } from '../../api/issue';
import { getProjects } from '../../api/project';
import { getPmCandidates, type PmCandidate } from '../../api/project';
import type { IssueCreateRequest } from '../../types/issue.types';
import type { Project } from '../../types/project.types';

const IssueCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<IssueCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<PmCandidate[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<PmCandidate | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await getProjects({ page: 0, size: 100 });
      setProjects(response.content);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await getPmCandidates();
      setUsers(response.content);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const onSubmit = async (data: IssueCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        ...data,
        projectId: selectedProject?.id,
        assigneeId: selectedAssignee?.id,
      };
      await createIssue(requestData);
      setSuccess('이슈가 등록되었습니다!');
      setTimeout(() => navigate('/issues'), 2000);
    } catch (err: any) {
      console.error('Failed to create issue:', err);
      setError(err.response?.data?.message || '이슈 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>이슈 등록</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="title"
            control={control}
            rules={{ required: '이슈 제목은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} label="이슈 제목" fullWidth margin="normal"
                error={!!errors.title} helperText={errors.title?.message} required />
            )}
          />

          <Controller
            name="content"
            control={control}
            rules={{ required: '이슈 내용은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} label="이슈 내용" fullWidth margin="normal" multiline rows={4}
                error={!!errors.content} helperText={errors.content?.message} required />
            )}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
            <Controller
              name="issueType"
              control={control}
              defaultValue="BUG"
              render={({ field }) => (
                <TextField {...field} select label="이슈 유형" fullWidth>
                  <MenuItem value="BUG">버그</MenuItem>
                  <MenuItem value="IMPROVEMENT">개선</MenuItem>
                  <MenuItem value="NEW_FEATURE">신규기능</MenuItem>
                  <MenuItem value="TASK">작업</MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="priority"
              control={control}
              defaultValue="MEDIUM"
              render={({ field }) => (
                <TextField {...field} select label="우선순위" fullWidth>
                  <MenuItem value="LOW">낮음</MenuItem>
                  <MenuItem value="MEDIUM">보통</MenuItem>
                  <MenuItem value="HIGH">높음</MenuItem>
                  <MenuItem value="CRITICAL">긴급</MenuItem>
                </TextField>
              )}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={projects}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              value={selectedProject}
              onChange={(_, newValue) => setSelectedProject(newValue)}
              loading={loadingProjects}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="프로젝트 선택"
                  placeholder="프로젝트를 검색하세요"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingProjects ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="검색 결과가 없습니다"
              loadingText="로딩 중..."
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})${option.position ? ` - ${option.position}` : ''}`}
              value={selectedAssignee}
              onChange={(_, newValue) => setSelectedAssignee(newValue)}
              loading={loadingUsers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="담당자 선택"
                  placeholder="담당자를 검색하세요"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="검색 결과가 없습니다"
              loadingText="로딩 중..."
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/issues')}
              fullWidth={isMobile} startIcon={!isMobile && <ArrowBack />}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading}
              fullWidth={isMobile} startIcon={!isMobile && <Save />}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default IssueCreatePage;
