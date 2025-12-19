import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getPartner, updatePartner } from '../../api/partner';
import apiClient from '../../utils/api';
import type { Partner, PartnerUpdateRequest } from '../../types/partner.types';

interface User {
  id: number;
  name: string;
  email: string;
}

const PartnerEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [partner, setPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<PartnerUpdateRequest>({
    name: '',
    businessNumber: '',
    ceoName: '',
    managerId: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedManager, setSelectedManager] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // 사용자 목록과 파트너 정보를 동시에 가져옴
        const [usersRes, partnerData] = await Promise.all([
          apiClient.get('/projects/pm-candidates'),
          getPartner(Number(id)),
        ]);
        
        // 사용자 목록 설정 (Page 응답에서 content 배열 추출)
        const usersList = usersRes.data?.content || [];
        setUsers(usersList);
        
        // 파트너 정보 설정
        setPartner(partnerData);
        setFormData({
          name: partnerData.name,
          businessNumber: partnerData.businessNumber,
          ceoName: partnerData.ceoName || '',
          managerId: partnerData.managerId,
        });
        
        // 내부 담당자 설정
        if (partnerData.managerId && usersList.length > 0) {
          const managerUser = usersList.find((u: User) => u.id === partnerData.managerId);
          if (managerUser) {
            setSelectedManager(managerUser);
          }
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

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
      if (!formData.name || !formData.businessNumber) {
        setError('파트너명과 사업자등록번호는 필수입니다.');
        setSaving(false);
        return;
      }

      // 빈 문자열을 undefined로 변환
      const cleanedData: PartnerUpdateRequest = {
        ...formData,
        ceoName: formData.ceoName || undefined,
        managerId: selectedManager?.id || undefined,
      };

      await updatePartner(Number(id), cleanedData);
      setSuccess('파트너가 성공적으로 수정되었습니다.');
      setTimeout(() => navigate(`/partners/${id}`), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || '파트너 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
  }

  if (!partner) {
    return (
      <Box>
        <Alert severity="error">{error || '파트너를 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/partners')} sx={{ mt: 2 }}>목록으로</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(`/partners/${id}`)} sx={{ mb: 2 }}>상세로 돌아가기</Button>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>파트너 수정</Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* 읽기 전용 정보 */}
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label={`코드: ${partner.code}`} size="small" />
            <Chip 
              label={partner.isClosed ? '폐업' : '운영중'} 
              color={partner.isClosed ? 'error' : 'success'} 
              size="small" 
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 파트너명 */}
            <TextField 
              fullWidth 
              label="파트너명" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />

            {/* 사업자등록번호 */}
            <TextField 
              fullWidth 
              label="사업자등록번호" 
              name="businessNumber" 
              value={formData.businessNumber} 
              onChange={handleChange} 
              required
              helperText="10-12자리 숫자"
            />

            {/* 대표자명 */}
            <TextField 
              fullWidth 
              label="대표자명" 
              name="ceoName" 
              value={formData.ceoName} 
              onChange={handleChange}
              helperText="선택사항"
            />

            {/* 내부 담당자 */}
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedManager}
              onChange={(_, newValue) => {
                setSelectedManager(newValue);
                setFormData(prev => ({ ...prev, managerId: newValue?.id || undefined }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="내부 담당자" helperText="파트너를 담당하는 내부 직원 (선택사항)" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button variant="outlined" startIcon={isMobile ? null : <Cancel />} onClick={() => navigate(`/partners/${id}`)} disabled={saving} fullWidth={isMobile}>취소</Button>
            <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={20} /> : (isMobile ? null : <Save />)} disabled={saving} fullWidth={isMobile}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PartnerEditPage;


