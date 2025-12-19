import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert,
  useMediaQuery, useTheme, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createUser } from '../../api/user';
import type { UserCreateRequest } from '../../api/user';

// 선택 가능한 역할 정의
const AVAILABLE_ROLES = [
  { name: 'ROLE_USER', label: '일반 사용자', description: '기본 사용자 권한' },
  { name: 'ROLE_SYSTEM_ADMIN', label: '시스템 관리자', description: '사용자 관리 가능' },
];

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<UserCreateRequest>({
    defaultValues: {
      roleNames: ['ROLE_USER'],  // 기본적으로 일반 사용자 권한 선택
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['ROLE_USER']);

  const handleRoleChange = (roleName: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleName]);
    } else {
      // 최소 하나의 역할은 선택되어야 함
      if (selectedRoles.length > 1) {
        setSelectedRoles(prev => prev.filter(r => r !== roleName));
      }
    }
  };

  const onSubmit = async (data: UserCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 선택된 역할 추가
      const requestData = {
        ...data,
        roleNames: selectedRoles,
      };
      await createUser(requestData);
      setSuccess('사용자가 성공적으로 등록되었습니다.');
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.message || err.message || '사용자 등록에 실패했습니다.');
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
            name="companyName"
            control={control}
            rules={{
              maxLength: {
                value: 100,
                message: '회사명은 최대 100자까지 가능합니다.',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="회사명"
                fullWidth
                margin="normal"
                error={!!errors.companyName}
                helperText={errors.companyName?.message || '회사명을 직접 입력하세요. 기존에 없는 회사명이면 자동으로 생성됩니다.'}
              />
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

          {/* 권한 선택 */}
          <FormControl component="fieldset" sx={{ mt: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
              권한 설정
            </FormLabel>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FormGroup>
                {AVAILABLE_ROLES.map((role) => (
                  <FormControlLabel
                    key={role.name}
                    control={
                      <Checkbox
                        checked={selectedRoles.includes(role.name)}
                        onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                        disabled={selectedRoles.length === 1 && selectedRoles.includes(role.name)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">{role.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 1, alignItems: 'flex-start' }}
                  />
                ))}
              </FormGroup>
            </Paper>
          </FormControl>

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
