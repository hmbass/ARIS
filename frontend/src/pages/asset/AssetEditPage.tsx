import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getAsset, updateAsset } from '../../api/asset';
import { getActiveUsersSimple } from '../../api/user';
import type { UserSimple } from '../../api/user';
import type { Asset, AssetUpdateRequest } from '../../types/asset.types';

const AssetEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [asset, setAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<AssetUpdateRequest>({
    assetType: 'PC',
    serialNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<UserSimple[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSimple | null>(null);

  useEffect(() => {
    fetchUsers();
    if (id) fetchAsset(Number(id));
  }, [id]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await getActiveUsersSimple({ size: 1000 });
      setUsers(response.content);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAsset = async (assetId: number) => {
    try {
      setLoading(true);
      const data = await getAsset(assetId);
      setAsset(data);
      setFormData({
        assetType: data.assetType,
        serialNumber: data.serialNumber || '',
        managerId: data.managerId,
      });
      // 담당자 정보가 있으면 선택된 사용자로 설정
      if (data.managerId && data.managerName) {
        setSelectedUser({ id: data.managerId, name: data.managerName, email: '' } as UserSimple);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '자산을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateAsset(Number(id), formData);
      setSuccess('자산이 성공적으로 수정되었습니다.');
      setTimeout(() => navigate(`/assets/${id}`), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || '자산 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
  }

  if (!asset) {
    return (
      <Box>
        <Alert severity="error">{error || '자산을 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/assets')} sx={{ mt: 2 }}>목록으로</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(`/assets/${id}`)} sx={{ mb: 2 }}>상세로 돌아가기</Button>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>자산 수정</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>자산번호: {asset.assetNumber}</Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth select label="자산 유형" name="assetType" value={formData.assetType} onChange={handleChange}>
              <MenuItem value="PC">PC (데스크톱)</MenuItem>
              <MenuItem value="LAPTOP">노트북</MenuItem>
              <MenuItem value="MONITOR">모니터</MenuItem>
              <MenuItem value="SERVER">서버</MenuItem>
              <MenuItem value="NETWORK">네트워크 장비</MenuItem>
              <MenuItem value="PRINTER">프린터</MenuItem>
              <MenuItem value="OTHER">기타</MenuItem>
            </TextField>

            <TextField fullWidth label="시리얼번호" name="serialNumber" value={formData.serialNumber} onChange={handleChange} />

            <Autocomplete
              options={users}
              value={users.find(u => u.id === formData.managerId) || selectedUser}
              getOptionLabel={(option) => option.email ? `${option.name} (${option.email})` : option.name}
              loading={usersLoading}
              onChange={(_, value) => {
                setFormData(prev => ({ ...prev, managerId: value?.id }));
                setSelectedUser(value);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="담당자"
                  fullWidth
                  helperText="선택사항"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button variant="outlined" startIcon={isMobile ? null : <Cancel />} onClick={() => navigate(`/assets/${id}`)} disabled={saving} fullWidth={isMobile}>취소</Button>
            <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={20} /> : (isMobile ? null : <Save />)} disabled={saving} fullWidth={isMobile}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AssetEditPage;


