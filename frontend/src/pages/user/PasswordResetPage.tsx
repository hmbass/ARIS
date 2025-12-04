import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, VpnKey } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { getUser, resetPassword, type PasswordResetRequest, type User } from '../../api/user';

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, watch, formState: { errors } } = useForm<PasswordResetRequest & { confirmPassword: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (id) {
      fetchUser(parseInt(id));
    }
  }, [id]);

  const fetchUser = async (userId: number) => {
    setLoadingUser(true);
    try {
      const userData = await getUser(userId);
      setUser(userData);
    } catch (err: any) {
      console.error('Failed to fetch user:', err);
      setError(err.message || '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingUser(false);
    }
  };

  const onSubmit = async (data: PasswordResetRequest & { confirmPassword: string }) => {
    if (!id) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await resetPassword(parseInt(id), { newPassword: data.newPassword });
      setSuccess('비밀번호가 성공적으로 재설정되었습니다.');
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      setError(err.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        비밀번호 재설정
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

      {user && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              사용자: {user.name} ({user.email})
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              새 비밀번호는 8~20자 사이여야 합니다.
            </Alert>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Controller
              name="newPassword"
              control={control}
              rules={{
                required: '새 비밀번호는 필수입니다.',
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
                  label="새 비밀번호"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  required
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: '비밀번호 확인은 필수입니다.',
                validate: (value) => value === newPassword || '비밀번호가 일치하지 않습니다.',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="비밀번호 확인"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  required
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
                startIcon={<VpnKey />}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : '재설정'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default PasswordResetPage;



