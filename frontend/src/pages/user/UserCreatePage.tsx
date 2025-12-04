import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert,
  useMediaQuery, useTheme, MenuItem,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createUser, type UserCreateRequest } from '../../api/user';
import { getCompanies } from '../../api/project';
import type { Company } from '../../types/project.types';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<UserCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await getCompanies();
      setCompanies(response);
    } catch (err: any) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const onSubmit = async (data: UserCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createUser(data);
      setSuccess('사용자가 성공적으로 등록되었습니다.');
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err.message || '사용자 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        사용자 등록
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
            name="email"
            control={control}
            rules={{
              required: '이메일은 필수입니다.',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '올바른 이메일 형식이 아닙니다.',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="이메일"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                required
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: '비밀번호는 필수입니다.',
              minLength: {
                value: 8,
                message: '비밀번호는 최소 8자 이상이어야 합니다.',
              },
              maxLength: {
                value: 20,
                message: '비밀번호는 최대 20자까지 가능합니다.',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="비밀번호"
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                required
              />
            )}
          />

          <Controller
            name="name"
            control={control}
            rules={{
              required: '이름은 필수입니다.',
              maxLength: {
                value: 50,
                message: '이름은 최대 50자까지 가능합니다.',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="이름"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              maxLength: {
                value: 20,
                message: '전화번호는 최대 20자까지 가능합니다.',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="전화번호"
                fullWidth
                margin="normal"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
              />
            )}
          />

          <Controller
            name="companyId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="회사"
                fullWidth
                margin="normal"
                error={!!errors.companyId}
                helperText={errors.companyId?.message}
                disabled={loadingCompanies}
              >
                <MenuItem value="">
                  <em>선택 안함</em>
                </MenuItem>
                {loadingCompanies ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> 로딩 중...
                  </MenuItem>
                ) : (
                  companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          />

          <Controller
            name="employeeNumber"
            control={control}
            rules={{
              maxLength: {
                value: 20,
                message: '사번은 최대 20자까지 가능합니다.',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="사번"
                fullWidth
                margin="normal"
                error={!!errors.employeeNumber}
                helperText={errors.employeeNumber?.message}
              />
            )}
          />

          <Controller
            name="position"
            control={control}
            rules={{
              maxLength: {
                value: 50,
                message: '직급은 최대 50자까지 가능합니다.',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="직급"
                fullWidth
                margin="normal"
                error={!!errors.position}
                helperText={errors.position?.message}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/users')}
              startIcon={<ArrowBack />}
              size={isMobile ? 'small' : 'medium'}
            >
              목록으로
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
              size={isMobile ? 'small' : 'medium'}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '등록'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserCreatePage;



