import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createIssue } from '../../api/issue';
import { getSrs } from '../../api/sr';
import { getSpecs } from '../../api/spec';
import type { IssueCreateRequest } from '../../types/issue.types';
import type { ServiceRequest } from '../../types/sr.types';
import type { Specification } from '../../types/spec.types';

const IssueCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<IssueCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [srs, setSrs] = useState<ServiceRequest[]>([]);
  const [specs, setSpecs] = useState<Specification[]>([]);

  useEffect(() => {
    fetchSrs();
    fetchSpecs();
  }, []);

  const fetchSrs = async () => {
    try {
      const response = await getSrs({ page: 0, size: 100 });
      setSrs(response.content);
    } catch (err) {
      console.error('Failed to fetch SRs:', err);
    }
  };

  const fetchSpecs = async () => {
    try {
      const response = await getSpecs({ page: 0, size: 100 });
      setSpecs(response.content);
    } catch (err) {
      console.error('Failed to fetch specs:', err);
    }
  };

  const onSubmit = async (data: IssueCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createIssue(data);
      setSuccess('이슈가 등록되었습니다!');
      setTimeout(() => navigate('/issues'), 2000);
    } catch (err: any) {
      console.error('Failed to create issue:', err);
      setError(err.message || '이슈 등록에 실패했습니다.');
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

          <Controller
            name="srId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="SR 선택" fullWidth margin="normal" helperText="선택사항">
                <MenuItem value="">선택 안 함</MenuItem>
                {srs.map((sr) => (
                  <MenuItem key={sr.id} value={sr.id}>{sr.srNumber} - {sr.title}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="specId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="SPEC 선택" fullWidth margin="normal" helperText="선택사항">
                <MenuItem value="">선택 안 함</MenuItem>
                {specs.map((spec) => (
                  <MenuItem key={spec.id} value={spec.id}>{spec.specNumber}</MenuItem>
                ))}
              </TextField>
            )}
          />

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



