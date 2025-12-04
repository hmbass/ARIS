import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createApproval } from '../../api/approval';
import { getSrs } from '../../api/sr';
import { getSpecs } from '../../api/spec';
import type { ApprovalCreateRequest } from '../../types/approval.types';
import type { ServiceRequest } from '../../types/sr.types';
import type { Specification } from '../../types/spec.types';

const ApprovalCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, watch, formState: { errors } } = useForm<ApprovalCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [srs, setSrs] = useState<ServiceRequest[]>([]);
  const [specs, setSpecs] = useState<Specification[]>([]);
  
  const approvalType = watch('approvalType');

  useEffect(() => {
    if (approvalType === 'SR') {
      fetchSrs();
    } else if (approvalType === 'SPEC') {
      fetchSpecs();
    }
  }, [approvalType]);

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

  const onSubmit = async (data: ApprovalCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // approverIds를 배열로 변환 (임시로 빈 배열)
      const requestData = {
        ...data,
        approverIds: [] // 실제로는 사용자 선택 UI 필요
      };
      await createApproval(requestData);
      setSuccess('승인 요청이 등록되었습니다!');
      setTimeout(() => navigate('/approvals'), 2000);
    } catch (err: any) {
      console.error('Failed to create approval:', err);
      setError(err.message || '승인 요청 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>승인 요청</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="approvalType"
            control={control}
            rules={{ required: '승인 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} select label="승인 유형" fullWidth margin="normal"
                error={!!errors.approvalType} helperText={errors.approvalType?.message} required>
                <MenuItem value="SR">SR 승인</MenuItem>
                <MenuItem value="SPEC">SPEC 승인</MenuItem>
                <MenuItem value="RELEASE">릴리즈 승인</MenuItem>
                <MenuItem value="DATA_EXTRACTION">데이터추출 승인</MenuItem>
              </TextField>
            )}
          />

          {approvalType === 'SR' && (
            <Controller
              name="targetId"
              control={control}
              rules={{ required: '대상을 선택해주세요.' }}
              render={({ field }) => (
                <TextField {...field} select label="SR 선택" fullWidth margin="normal"
                  error={!!errors.targetId} helperText={errors.targetId?.message} required>
                  {srs.map((sr) => (
                    <MenuItem key={sr.id} value={sr.id}>{sr.srNumber} - {sr.title}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {approvalType === 'SPEC' && (
            <Controller
              name="targetId"
              control={control}
              rules={{ required: '대상을 선택해주세요.' }}
              render={({ field }) => (
                <TextField {...field} select label="SPEC 선택" fullWidth margin="normal"
                  error={!!errors.targetId} helperText={errors.targetId?.message} required>
                  {specs.map((spec) => (
                    <MenuItem key={spec.id} value={spec.id}>{spec.specNumber}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {approvalType && approvalType !== 'SR' && approvalType !== 'SPEC' && (
            <Controller
              name="targetId"
              control={control}
              rules={{ required: '대상 ID는 필수입니다.' }}
              render={({ field }) => (
                <TextField {...field} label="대상 ID" type="number" fullWidth margin="normal"
                  error={!!errors.targetId} helperText={errors.targetId?.message} required />
              )}
            />
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            승인자 선택 기능은 향후 구현 예정입니다.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/approvals')}
              fullWidth={isMobile} startIcon={!isMobile && <ArrowBack />}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading}
              fullWidth={isMobile} startIcon={!isMobile && <Save />}>
              {loading ? '요청 중...' : '승인 요청'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ApprovalCreatePage;



