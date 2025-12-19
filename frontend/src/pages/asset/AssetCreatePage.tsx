import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Alert,
  useMediaQuery, useTheme, Autocomplete, CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createAsset } from '../../api/asset';
import { getActiveUsersSimple } from '../../api/user';
import type { UserSimple } from '../../api/user';
import type { AssetCreateRequest } from '../../types/asset.types';

const AssetCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<AssetCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<UserSimple[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await getActiveUsersSimple({ size: 1000 });
      setUsers(response.content);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const onSubmit = async (data: AssetCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createAsset(data);
      setSuccess('자산이 등록되었습니다!');
      setTimeout(() => navigate('/assets'), 2000);
    } catch (err: any) {
      console.error('Failed to create asset:', err);
      setError(err.response?.data?.message || err.message || '자산 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>자산 등록</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="assetType"
            control={control}
            rules={{ required: '자산 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} select label="자산 유형" fullWidth margin="normal"
                error={!!errors.assetType} helperText={errors.assetType?.message} required>
                <MenuItem value="PC">PC (데스크톱)</MenuItem>
                <MenuItem value="LAPTOP">노트북</MenuItem>
                <MenuItem value="MONITOR">모니터</MenuItem>
                <MenuItem value="SERVER">서버</MenuItem>
                <MenuItem value="NETWORK">네트워크 장비</MenuItem>
                <MenuItem value="PRINTER">프린터</MenuItem>
                <MenuItem value="OTHER">기타</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="serialNumber"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="시리얼 번호" fullWidth margin="normal" helperText="선택사항" />
            )}
          />

          <Controller
            name="acquiredAt"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="취득일" type="date" fullWidth margin="normal"
                InputLabelProps={{ shrink: true }} helperText="선택사항 (미입력 시 오늘 날짜)" />
            )}
          />

          <Autocomplete
            options={users}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            loading={usersLoading}
            onChange={(_, value) => setValue('managerId', value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="담당자"
                fullWidth
                margin="normal"
                helperText="선택사항"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/assets')}
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

export default AssetCreatePage;



