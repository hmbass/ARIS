import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Edit, Delete, Block, CheckCircle } from '@mui/icons-material';
import { getPartner, deletePartner, closePartner, reopenPartner } from '../../api/partner';
import type { Partner } from '../../types/partner.types';

const PartnerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) fetchPartner(Number(id));
  }, [id]);

  const fetchPartner = async (partnerId: number) => {
    try {
      setLoading(true);
      const data = await getPartner(partnerId);
      setPartner(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '파트너를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!partner) return;
    try {
      setProcessing(true);
      await deletePartner(partner.id);
      navigate('/partners');
    } catch (err: any) {
      setError(err.response?.data?.message || '파트너 삭제에 실패했습니다.');
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleClose = async () => {
    if (!partner) return;
    try {
      setProcessing(true);
      await closePartner(partner.id);
      await fetchPartner(partner.id);
      setCloseDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || '파트너 폐업 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReopen = async () => {
    if (!partner) return;
    try {
      setProcessing(true);
      await reopenPartner(partner.id);
      await fetchPartner(partner.id);
    } catch (err: any) {
      setError(err.response?.data?.message || '파트너 재개업 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
  }

  if (error || !partner) {
    return (
      <Box>
        <Alert severity="error">{error || '파트너를 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/partners')} sx={{ mt: 2 }}>목록으로</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={isMobile ? null : <ArrowBack />} onClick={() => navigate('/partners')} size={isMobile ? 'small' : 'medium'}>목록으로</Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {partner.isClosed ? (
            <Button variant="outlined" color="success" startIcon={isMobile ? null : <CheckCircle />} onClick={handleReopen} disabled={processing} size={isMobile ? 'small' : 'medium'}>재개업</Button>
          ) : (
            <Button variant="outlined" color="warning" startIcon={isMobile ? null : <Block />} onClick={() => setCloseDialogOpen(true)} disabled={processing} size={isMobile ? 'small' : 'medium'}>폐업처리</Button>
          )}
          <Button variant="outlined" startIcon={isMobile ? null : <Edit />} onClick={() => navigate(`/partners/${partner.id}/edit`)} size={isMobile ? 'small' : 'medium'}>수정</Button>
          <Button variant="outlined" color="error" startIcon={isMobile ? null : <Delete />} onClick={() => setDeleteDialogOpen(true)} size={isMobile ? 'small' : 'medium'}>삭제</Button>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'}>{partner.name}</Typography>
            <Typography variant="body2" color="text.secondary">{partner.code}</Typography>
          </Box>
          <Chip label={partner.isClosed ? '폐업' : '운영중'} color={partner.isClosed ? 'error' : 'success'} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>사업자등록번호</Typography>
            <Typography variant="body1">{partner.businessNumber}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>대표자명</Typography>
            <Typography variant="body1">{partner.ceoName || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>내부 담당자</Typography>
            <Typography variant="body1">{partner.managerName || '-'}</Typography>
          </Box>
          {partner.isClosed && partner.closedAt && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>폐업일</Typography>
              <Typography variant="body1">{partner.closedAt}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>등록일</Typography>
            <Typography variant="body1">{new Date(partner.createdAt).toLocaleString()}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>등록자</Typography>
            <Typography variant="body1">{partner.createdBy}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>수정일</Typography>
            <Typography variant="body1">{new Date(partner.updatedAt).toLocaleString()}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>수정자</Typography>
            <Typography variant="body1">{partner.updatedBy}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>파트너 삭제</DialogTitle>
        <DialogContent><DialogContentText>정말 이 파트너를 삭제하시겠습니까?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" disabled={processing}>{processing ? '삭제 중...' : '삭제'}</Button>
        </DialogActions>
      </Dialog>

      {/* 폐업 확인 다이얼로그 */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)}>
        <DialogTitle>파트너 폐업 처리</DialogTitle>
        <DialogContent><DialogContentText>이 파트너를 폐업 처리하시겠습니까?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>취소</Button>
          <Button onClick={handleClose} color="warning" disabled={processing}>{processing ? '처리 중...' : '폐업 처리'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnerDetailPage;


