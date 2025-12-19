import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Phone,
  Business,
  Visibility,
  VisibilityOff,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch('password');

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

  const onSubmit = async (data: UserCreateRequest & { confirmPassword: string }) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { confirmPassword, ...registerData } = data;
      await apiClient.post('/auth/register', registerData);
      
      setSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
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
        background: '#0a0a0f',
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.2), transparent),
          radial-gradient(ellipse 60% 40% at 100% 100%, rgba(139, 92, 246, 0.15), transparent)
        `,
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
            '50%': { opacity: 0.8, transform: 'scale(1.1)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 5s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* Register Card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          mx: 2,
          p: { xs: 3, sm: 5 },
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          zIndex: 1,
          maxHeight: '90vh',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
          },
        }}
      >
        {/* Back Button */}
        <IconButton
          onClick={() => navigate('/login')}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Logo & Title */}
        <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              mb: 2,
              boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
            }}
          >
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
              A
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            회원가입
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ARIS 시스템에 가입하세요
          </Typography>
        </Box>

        {/* Register Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
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
                error={!!errors.email}
                helperText={errors.email?.message}
                required
                autoFocus
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: '비밀번호는 필수입니다.',
              minLength: { value: 8, message: '비밀번호는 최소 8자 이상이어야 합니다.' },
              maxLength: { value: 20, message: '비밀번호는 최대 20자까지 가능합니다.' },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message || '8~20자 사이로 입력해주세요'}
                required
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
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
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                required
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="name"
            control={control}
            rules={{
              required: '이름은 필수입니다.',
              maxLength: { value: 50, message: '이름은 최대 50자까지 가능합니다.' },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="이름"
                error={!!errors.name}
                helperText={errors.name?.message}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              maxLength: { value: 20, message: '전화번호는 최대 20자까지 가능합니다.' },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="전화번호 (선택)"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                placeholder="010-1234-5678"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
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
                label="회사 (선택)"
                error={!!errors.companyId}
                helperText={errors.companyId?.message || '선택하지 않으면 기본 회사로 등록됩니다.'}
                disabled={loadingCompanies}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              >
                {loadingCompanies ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> 로딩 중...
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
            endIcon={!loading && <ArrowForward />}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 10px 40px rgba(99, 102, 241, 0.4)',
              },
              '&:disabled': {
                background: 'rgba(99, 102, 241, 0.3)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '가입하기'}
          </Button>
        </Box>

        {/* Footer Links */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            이미 계정이 있으신가요?{' '}
            <Link
              component="button"
              type="button"
              onClick={() => navigate('/login')}
              sx={{
                color: '#818cf8',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              로그인
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
