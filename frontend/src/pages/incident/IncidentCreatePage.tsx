import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createIncident } from '../../api/incident';
import type { IncidentCreateRequest } from '../../types/incident.types';

const IncidentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<IncidentCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: IncidentCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createIncident(data);
      setSuccess('장애가 등록되었습니다!');
      setTimeout(() => navigate('/incidents'), 2000);
    } catch (err: any) {
      console.error('Failed to create incident:', err);
      setError(err.message || '장애 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>장애 등록</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="title"
            control={control}
            rules={{ required: '장애 제목은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} label="장애 제목" fullWidth margin="normal"
                error={!!errors.title} helperText={errors.title?.message} required />
            )}
          />

          <Controller
            name="incidentType"
            control={control}
            rules={{ required: '장애 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} select label="장애 유형" fullWidth margin="normal"
                error={!!errors.incidentType} helperText={errors.incidentType?.message} required>
                <MenuItem value="INCIDENT">인시던트</MenuItem>
                <MenuItem value="FAILURE">장애</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="systemType"
            control={control}
            rules={{ required: '시스템 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} select label="시스템 유형" fullWidth margin="normal"
                error={!!errors.systemType} helperText={errors.systemType?.message} required>
                <MenuItem value="PROGRAM">프로그램</MenuItem>
                <MenuItem value="DATA">데이터</MenuItem>
                <MenuItem value="SERVER">서버</MenuItem>
                <MenuItem value="NETWORK">네트워크</MenuItem>
                <MenuItem value="PC">PC</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="severity"
            control={control}
            rules={{ required: '심각도는 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} select label="심각도" fullWidth margin="normal"
                error={!!errors.severity} helperText={errors.severity?.message} required>
                <MenuItem value="HIGH">높음</MenuItem>
                <MenuItem value="MEDIUM">중간</MenuItem>
                <MenuItem value="LOW">낮음</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="businessArea"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="업무 영역" fullWidth margin="normal" helperText="선택사항" />
            )}
          />

          <Controller
            name="occurredAt"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="발생 시간" type="datetime-local" fullWidth margin="normal"
                InputLabelProps={{ shrink: true }} helperText="선택사항 (미입력 시 현재 시간)" />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/incidents')}
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

export default IncidentCreatePage;



