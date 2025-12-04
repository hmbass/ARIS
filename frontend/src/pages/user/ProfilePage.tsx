import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import { Save, Person } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { getMyProfile, updateMyProfile, type UserUpdateRequest } from '../../api/user';

const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateUserInStore = useAuthStore((state) => state.updateUser);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<UserUpdateRequest>();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      const userData = await getMyProfile();
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
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const updatedUser = await updateMyProfile(data);
      updateUserInStore(updatedUser);
      setSuccess('프로필이 성공적으로 수정되었습니다.');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || '프로필 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        내 프로필
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {/* 프로필 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mr: 3,
            }}
          >
            {user?.name ? getInitials(user.name) : <Person />}
          </Avatar>
          <Box>
            <Typography variant="h5">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.companyName} {user?.departmentName && `- ${user.departmentName}`}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

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
          <Typography variant="h6" gutterBottom>
            기본 정보
          </Typography>

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
                fullWidth
                label="직급"
                margin="normal"
                error={!!errors.position}
                helperText={errors.position?.message}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '저장'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;

