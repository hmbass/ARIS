import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createSpec } from '../../api/spec';
import { getSrs } from '../../api/sr';
import type { SpecCreateRequest } from '../../types/spec.types';
import type { ServiceRequest } from '../../types/sr.types';

interface User {
  id: number;
  name: string;
  email: string;
}

const SpecCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<SpecCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [srs, setSrs] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingSrs, setLoadingSrs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchSrs();
    fetchUsers();
  }, []);

  const fetchSrs = async () => {
    setLoadingSrs(true);
    try {
      const response = await getSrs({ page: 0, size: 100 });
      setSrs(response.content);
    } catch (err: any) {
      console.error('Failed to fetch SRs:', err);
    } finally {
      setLoadingSrs(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // User API는 향후 구현 예정 - 임시로 빈 배열 사용
      setUsers([]);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const onSubmit = async (data: SpecCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createSpec(data);
      setSuccess('SPEC이 등록되었습니다!');
      
      // 2초 후 목록으로 이동
      setTimeout(() => {
        navigate('/specs');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create spec:', err);
      setError(err.message || 'SPEC 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        SPEC 등록
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
            name="srId"
            control={control}
            rules={{ required: 'SR은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="SR 선택"
                fullWidth
                margin="normal"
                error={!!errors.srId}
                helperText={errors.srId?.message}
                required
                disabled={loadingSrs}
              >
                {loadingSrs ? (
                  <MenuItem value="">로딩 중...</MenuItem>
                ) : srs.length === 0 ? (
                  <MenuItem value="">등록된 SR이 없습니다</MenuItem>
                ) : (
                  srs.map((sr) => (
                    <MenuItem key={sr.id} value={sr.id}>
                      {sr.srNumber} - {sr.title}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          />

          <Controller
            name="specType"
            control={control}
            rules={{ required: 'SPEC 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="SPEC 유형"
                fullWidth
                margin="normal"
                error={!!errors.specType}
                helperText={errors.specType?.message}
                required
              >
                <MenuItem value="DEVELOPMENT">개발</MenuItem>
                <MenuItem value="OPERATION">운영</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="specCategory"
            control={control}
            rules={{ required: 'SPEC 분류는 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="SPEC 분류"
                fullWidth
                margin="normal"
                error={!!errors.specCategory}
                helperText={errors.specCategory?.message}
                required
              >
                <MenuItem value="ACCEPTED">접수</MenuItem>
                <MenuItem value="CANCELLED">취소</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="functionPoint"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="기능점수 (FP)"
                type="number"
                fullWidth
                margin="normal"
                inputProps={{ step: '0.1', min: '0' }}
                helperText="선택사항"
              />
            )}
          />

          <Controller
            name="manDay"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공수 (M/D)"
                type="number"
                fullWidth
                margin="normal"
                inputProps={{ step: '0.1', min: '0' }}
                helperText="선택사항"
              />
            )}
          />

          <Controller
            name="assigneeId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="담당자"
                fullWidth
                margin="normal"
                disabled={loadingUsers}
                helperText="선택사항"
              >
                <MenuItem value="">선택 안 함</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="reviewerId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="검토자"
                fullWidth
                margin="normal"
                disabled={loadingUsers}
                helperText="선택사항"
              >
                <MenuItem value="">선택 안 함</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 3,
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/specs')}
              fullWidth={isMobile}
              startIcon={!isMobile && <ArrowBack />}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth={isMobile}
              startIcon={!isMobile && <Save />}
            >
              {loading ? '등록 중...' : '등록'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SpecCreatePage;

