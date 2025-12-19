import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Alert,
  useMediaQuery, useTheme, Autocomplete, Chip, CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createApproval } from '../../api/approval';
import { getApprovableSrs } from '../../api/sr';
import { getApprovableSpecs } from '../../api/spec';
import { getApprovableReleases } from '../../api/release';
import { getPmCandidates, type PmCandidate } from '../../api/project';
import type { ApprovalCreateRequest } from '../../types/approval.types';
import type { ServiceRequest } from '../../types/sr.types';
import type { Specification } from '../../types/spec.types';
import type { Release } from '../../types/release.types';

interface ApproverCandidate {
  id: number;
  name: string;
  email: string;
  position?: string;
}

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
  const [releases, setReleases] = useState<Release[]>([]);
  const [approvers, setApprovers] = useState<ApproverCandidate[]>([]);
  const [selectedApprovers, setSelectedApprovers] = useState<ApproverCandidate[]>([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  
  const approvalType = watch('approvalType');

  useEffect(() => {
    fetchApprovers();
  }, []);

  useEffect(() => {
    if (approvalType === 'SR') {
      fetchSrs();
    } else if (approvalType === 'SPEC') {
      fetchSpecs();
    } else if (approvalType === 'RELEASE') {
      fetchReleases();
    }
  }, [approvalType]);

  const fetchApprovers = async () => {
    try {
      setLoadingApprovers(true);
      const response = await getPmCandidates();
      setApprovers(response.content.map((user: PmCandidate) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        position: user.position,
      })));
    } catch (err) {
      console.error('Failed to fetch approvers:', err);
    } finally {
      setLoadingApprovers(false);
    }
  };

  const fetchSrs = async () => {
    try {
      const response = await getApprovableSrs();
      setSrs(response);
    } catch (err) {
      console.error('Failed to fetch SRs:', err);
    }
  };

  const fetchSpecs = async () => {
    try {
      const response = await getApprovableSpecs();
      setSpecs(response);
    } catch (err) {
      console.error('Failed to fetch specs:', err);
    }
  };

  const fetchReleases = async () => {
    try {
      const response = await getApprovableReleases();
      setReleases(response);
    } catch (err) {
      console.error('Failed to fetch releases:', err);
    }
  };

  const getReleaseTypeLabel = (type: string) => {
    return type === 'EMERGENCY' ? '긴급' : '정기';
  };

  const onSubmit = async (data: ApprovalCreateRequest) => {
    if (selectedApprovers.length === 0) {
      setError('승인자를 최소 1명 이상 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        ...data,
        approverIds: selectedApprovers.map(approver => approver.id)
      };
      await createApproval(requestData);
      setSuccess('승인 요청이 등록되었습니다!');
      setTimeout(() => navigate('/approvals'), 2000);
    } catch (err: any) {
      console.error('Failed to create approval:', err);
      setError(err.response?.data?.message || '승인 요청 등록에 실패했습니다.');
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
                  error={!!errors.targetId} helperText={errors.targetId?.message || (srs.length === 0 ? '승인 가능한 SR이 없습니다.' : '')} required>
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
                  error={!!errors.targetId} helperText={errors.targetId?.message || (specs.length === 0 ? '승인 가능한 SPEC이 없습니다.' : '')} required>
                  {specs.map((spec) => (
                    <MenuItem key={spec.id} value={spec.id}>{spec.specNumber} - {spec.srTitle || '(제목 없음)'}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {approvalType === 'RELEASE' && (
            <Controller
              name="targetId"
              control={control}
              rules={{ required: '대상을 선택해주세요.' }}
              render={({ field }) => (
                <TextField {...field} select label="릴리즈 선택" fullWidth margin="normal"
                  error={!!errors.targetId} helperText={errors.targetId?.message || (releases.length === 0 ? '승인 가능한 릴리즈가 없습니다.' : '')} required>
                  {releases.map((release) => (
                    <MenuItem key={release.id} value={release.id}>
                      {release.releaseNumber} - {release.title} ({getReleaseTypeLabel(release.releaseType)})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {approvalType === 'DATA_EXTRACTION' && (
            <Controller
              name="targetId"
              control={control}
              rules={{ required: '대상 ID는 필수입니다.' }}
              render={({ field }) => (
                <TextField {...field} label="대상 ID" type="number" fullWidth margin="normal"
                  error={!!errors.targetId} helperText={errors.targetId?.message || '데이터추출 대상 ID를 입력하세요.'} required />
              )}
            />
          )}

          {/* 승인자 선택 */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              승인자 선택 *
            </Typography>
            <Autocomplete
              multiple
              options={approvers}
              getOptionLabel={(option) => `${option.name} (${option.email})${option.position ? ` - ${option.position}` : ''}`}
              value={selectedApprovers}
              onChange={(_, newValue) => setSelectedApprovers(newValue)}
              loading={loadingApprovers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="승인자를 검색하세요"
                  error={selectedApprovers.length === 0 && !!error}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingApprovers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.name}${option.position ? ` (${option.position})` : ''}`}
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="검색 결과가 없습니다"
              loadingText="로딩 중..."
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              여러 명의 승인자를 선택할 수 있습니다. 순서대로 승인이 진행됩니다.
            </Typography>
          </Box>

          {selectedApprovers.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
              <Typography variant="subtitle2" gutterBottom>승인 순서</Typography>
              {selectedApprovers.map((approver, index) => (
                <Box key={approver.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <Chip label={index + 1} size="small" color="primary" />
                  <Typography variant="body2">
                    {approver.name} ({approver.email})
                    {approver.position && <Typography component="span" color="text.secondary"> - {approver.position}</Typography>}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/approvals')}
              fullWidth={isMobile} startIcon={!isMobile && <ArrowBack />}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading || selectedApprovers.length === 0}
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
