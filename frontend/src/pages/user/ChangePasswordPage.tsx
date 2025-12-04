import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Lock, CheckCircle } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { resetPassword, type PasswordResetRequest } from '../../api/user';

interface ChangePasswordForm extends PasswordResetRequest {
  currentPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<ChangePasswordForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordForm) => {
    if (!user?.id) return;

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await resetPassword(user.id, { newPassword: data.newPassword });
      setSuccess('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    '8자 이상 20자 이하',
    '영문, 숫자 조합 권장',
    '특수문자 사용 가능',
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        비밀번호 변경
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
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

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock /> 새 비밀번호 설정
          </Typography>

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
                fullWidth
                label="새 비밀번호"
                type="password"
                margin="normal"
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                required
                autoFocus
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
                fullWidth
                label="새 비밀번호 확인"
                type="password"
                margin="normal"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                required
              />
            )}
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              비밀번호 규칙
            </Typography>
            <List dense>
              {passwordRules.map((rule, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircle fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={rule} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '비밀번호 변경'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangePasswordPage;



