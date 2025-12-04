import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { getUser, updateUser, type UserUpdateRequest, type User } from '../../api/user';

const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<UserUpdateRequest>();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setValue('name', userData.name);
      setValue('phoneNumber', userData.phoneNumber || '');
      setValue('position', userData.position || '');
    } catch (err: any) {
      console.error('Failed to fetch user:', err);
      setError(err.message || '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingUser(false);
    }
  };

  const onSubmit = async (data: UserUpdateRequest) => {
    if (!id) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateUser(parseInt(id), data);
      setSuccess('사용자 정보가 성공적으로 수정되었습니다.');
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.message || '사용자 정보 수정에 실패했습니다.');
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
        사용자 정보 수정
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
            <Typography variant="body2" color="text.secondary">
              이메일: {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              회사: {user.companyName || '-'}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
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
                {loading ? <CircularProgress size={24} color="inherit" /> : '수정'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default UserEditPage;



