import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, Autocomplete,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createPartner } from '../../api/partner';
import apiClient from '../../utils/api';
import type { PartnerCreateRequest } from '../../types/partner.types';

interface User {
  id: number;
  name: string;
  email: string;
}

const PartnerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<PartnerCreateRequest>({
    defaultValues: {
      name: '',
      businessNumber: '',
      ceoName: '',
      managerId: undefined,
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedManager, setSelectedManager] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/projects/pm-candidates');
        // Page 응답에서 content 배열 추출
        const usersList = response.data?.content || [];
        setUsers(usersList);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      }
    };
    
    fetchUsers();
  }, []);

  const onSubmit = async (data: PartnerCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 빈 문자열을 undefined로 변환
      const cleanedData: PartnerCreateRequest = {
        ...data,
        ceoName: data.ceoName || undefined,
        managerId: selectedManager?.id || undefined,
      };
      await createPartner(cleanedData);
      setSuccess('파트너가 등록되었습니다!');
      setTimeout(() => navigate('/partners'), 2000);
    } catch (err: any) {
      console.error('Failed to create partner:', err);
      setError(err.message || '파트너 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/partners')} sx={{ mb: 2 }}>
        목록으로
      </Button>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>파트너 등록</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 파트너명 */}
            <Controller
              name="name"
              control={control}
              rules={{ required: '파트너명은 필수입니다.' }}
              render={({ field }) => (
                <TextField {...field} label="파트너명" fullWidth
                  error={!!errors.name} helperText={errors.name?.message} required />
              )}
            />

            {/* 사업자등록번호 */}
            <Controller
              name="businessNumber"
              control={control}
              rules={{
                required: '사업자등록번호는 필수입니다.',
                pattern: {
                  value: /^\d{10,12}$/,
                  message: '사업자등록번호는 10-12자리 숫자여야 합니다.'
                }
              }}
              render={({ field }) => (
                <TextField {...field} label="사업자등록번호" fullWidth
                  error={!!errors.businessNumber} helperText={errors.businessNumber?.message || '10-12자리 숫자'}
                  required placeholder="1234567890" />
              )}
            />

            {/* 대표자명 */}
            <Controller
              name="ceoName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="대표자명" fullWidth helperText="선택사항" />
              )}
            />

            {/* 내부 담당자 */}
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedManager}
              onChange={(_, newValue) => {
                setSelectedManager(newValue);
                setValue('managerId', newValue?.id || undefined);
              }}
              renderInput={(params) => (
                <TextField {...params} label="내부 담당자" helperText="파트너를 담당하는 내부 직원 (선택사항)" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/partners')}
              fullWidth={isMobile}>
              취소
            </Button>
            <Button type="submit" variant="contained" disabled={loading}
              fullWidth={isMobile} startIcon={isMobile ? null : <Save />}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PartnerCreatePage;



