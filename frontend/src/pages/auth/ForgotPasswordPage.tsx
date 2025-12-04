import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import apiClient from '../../utils/api';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setTempPassword('');
    
    try {
      const response = await apiClient.post<string>('/auth/forgot-password', data);
      
      // 개발 환경에서는 임시 비밀번호를 화면에 표시
      setTempPassword(response.data);
      setSuccess('임시 비밀번호가 발급되었습니다. 아래 비밀번호로 로그인해주세요.');
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      setError(err.message || '비밀번호 찾기에 실패했습니다.');
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
          maxWidth: 450,
          mx: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Email sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom align="center">
          비밀번호 찾기
        </Typography>
        <Typography variant="body2" gutterBottom align="center" color="text.secondary" sx={{ mb: 3 }}>
          가입하신 이메일을 입력하시면 임시 비밀번호를 발급해드립니다.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
              {tempPassword && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    임시 비밀번호: {tempPassword}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    * 로그인 후 반드시 비밀번호를 변경해주세요.
                  </Typography>
                </Box>
              )}
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
                disabled={loading || !!tempPassword}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !!tempPassword}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '임시 비밀번호 발급'}
          </Button>

          {tempPassword && (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ mb: 2 }}
            >
              로그인 페이지로 이동
            </Button>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer' }}
            >
              로그인으로 돌아가기
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;



