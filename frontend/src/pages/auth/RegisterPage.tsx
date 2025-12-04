import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import type { UserCreateRequest } from '../../api/user';
import { getCompanies } from '../../api/project';
import type { Company } from '../../types/project.types';
import apiClient from '../../utils/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, watch, formState: { errors } } = useForm<UserCreateRequest & { confirmPassword: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const password = watch('password');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    console.log('[RegisterPage] Fetching companies...');
    setLoadingCompanies(true);
    try {
      const response = await getCompanies();
      console.log('[RegisterPage] Companies fetched successfully:', response);
      setCompanies(response);
    } catch (err: any) {
      console.error('[RegisterPage] Failed to fetch companies:', err);
      console.error('[RegisterPage] Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
    } finally {
      setLoadingCompanies(false);
    }
  };

  const onSubmit = async (data: UserCreateRequest & { confirmPassword: string }) => {
    console.log('[RegisterPage] Form submitted with data:', data);
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // confirmPassword 제외하고 전송
      const { confirmPassword, ...registerData } = data;
      console.log('[RegisterPage] Sending registration request:', registerData);
      
      const response = await apiClient.post('/auth/register', registerData);
      console.log('[RegisterPage] Registration successful:', response.data);
      
      setSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      
      setTimeout(() => {
        console.log('[RegisterPage] Navigating to login page...');
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('[RegisterPage] Registration failed:', err);
      console.error('[RegisterPage] Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%',
          maxWidth: 500,
          mx: 2,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          회원가입
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          ARIS 시스템 가입
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
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
                fullWidth
                label="이메일"
                type="email"
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                required
                autoFocus
                autoComplete="email"
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
                fullWidth
                label="비밀번호"
                type="password"
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message || '8~20자 사이로 입력해주세요'}
                required
                autoComplete="new-password"
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: '비밀번호 확인은 필수입니다.',
              validate: (value) => value === password || '비밀번호가 일치하지 않습니다.',
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="비밀번호 확인"
                type="password"
                margin="normal"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                required
                autoComplete="new-password"
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
                fullWidth
                label="이름"
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
                fullWidth
                label="전화번호"
                margin="normal"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                placeholder="010-1234-5678"
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
                fullWidth
                label="회사 (선택사항)"
                margin="normal"
                error={!!errors.companyId}
                helperText={errors.companyId?.message || '선택하지 않으면 기본 회사로 등록됩니다.'}
                disabled={loadingCompanies}
              >
                {loadingCompanies ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> 로딩 중...
                  </MenuItem>
                ) : companies.length === 0 ? (
                  <MenuItem disabled>등록된 회사가 없습니다.</MenuItem>
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '가입하기'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer' }}
            >
              이미 계정이 있으신가요? 로그인
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;

