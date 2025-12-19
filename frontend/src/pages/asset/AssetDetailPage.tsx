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
import { getAsset, deleteAsset, expireAsset, restoreAsset } from '../../api/asset';
import type { Asset, AssetType } from '../../types/asset.types';

const AssetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expireDialogOpen, setExpireDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) fetchAsset(Number(id));
  }, [id]);

  const fetchAsset = async (assetId: number) => {
    try {
      setLoading(true);
      const data = await getAsset(assetId);
      setAsset(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '자산을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    try {
      setProcessing(true);
      await deleteAsset(asset.id);
      navigate('/assets');
    } catch (err: any) {
      setError(err.response?.data?.message || '자산 삭제에 실패했습니다.');
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleExpire = async () => {
    if (!asset) return;
    try {
      setProcessing(true);
      await expireAsset(asset.id);
      await fetchAsset(asset.id);
      setExpireDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || '자산 폐기 처리에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!asset) return;
    try {
      setProcessing(true);
      await restoreAsset(asset.id);
      await fetchAsset(asset.id);
    } catch (err: any) {
      setError(err.response?.data?.message || '자산 복원에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const getAssetTypeLabel = (type: AssetType) => {
    const labels: Record<AssetType, string> = {
      PC: '데스크톱',
      LAPTOP: '노트북',
      MONITOR: '모니터',
      SERVER: '서버',
      NETWORK: '네트워크',
      PRINTER: '프린터',
      OTHER: '기타',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
  }

  if (error || !asset) {
    return (
      <Box>
        <Alert severity="error">{error || '자산을 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/assets')} sx={{ mt: 2 }}>목록으로</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={isMobile ? null : <ArrowBack />} onClick={() => navigate('/assets')} size={isMobile ? 'small' : 'medium'}>목록으로</Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {asset.isExpired ? (
            <Button variant="outlined" color="success" startIcon={isMobile ? null : <CheckCircle />} onClick={handleRestore} disabled={processing} size={isMobile ? 'small' : 'medium'}>복원</Button>
          ) : (
            <Button variant="outlined" color="warning" startIcon={isMobile ? null : <Block />} onClick={() => setExpireDialogOpen(true)} disabled={processing} size={isMobile ? 'small' : 'medium'}>폐기</Button>
          )}
          <Button variant="outlined" startIcon={isMobile ? null : <Edit />} onClick={() => navigate(`/assets/${asset.id}/edit`)} size={isMobile ? 'small' : 'medium'}>수정</Button>
          <Button variant="outlined" color="error" startIcon={isMobile ? null : <Delete />} onClick={() => setDeleteDialogOpen(true)} size={isMobile ? 'small' : 'medium'}>삭제</Button>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'}>{asset.assetNumber}</Typography>
            <Typography variant="body2" color="text.secondary">{getAssetTypeLabel(asset.assetType)}</Typography>
          </Box>
          <Chip label={asset.isExpired ? '폐기' : '사용중'} color={asset.isExpired ? 'default' : 'success'} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>시리얼번호</Typography>
            <Typography variant="body1">{asset.serialNumber || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>취득일</Typography>
            <Typography variant="body1">{asset.acquiredAt}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>담당자</Typography>
            <Typography variant="body1">{asset.managerName || '-'}</Typography>
          </Box>
          {asset.isExpired && asset.expiredAt && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>폐기일</Typography>
              <Typography variant="body1">{asset.expiredAt}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>등록일</Typography>
            <Typography variant="body1">{new Date(asset.createdAt).toLocaleString()}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>등록자</Typography>
            <Typography variant="body1">{asset.createdBy}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>수정일</Typography>
            <Typography variant="body1">{new Date(asset.updatedAt).toLocaleString()}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>수정자</Typography>
            <Typography variant="body1">{asset.updatedBy}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>자산 삭제</DialogTitle>
        <DialogContent><DialogContentText>정말 이 자산을 삭제하시겠습니까?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" disabled={processing}>{processing ? '삭제 중...' : '삭제'}</Button>
        </DialogActions>
      </Dialog>

      {/* 폐기 확인 다이얼로그 */}
      <Dialog open={expireDialogOpen} onClose={() => setExpireDialogOpen(false)}>
        <DialogTitle>자산 폐기</DialogTitle>
        <DialogContent><DialogContentText>이 자산을 폐기 처리하시겠습니까?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setExpireDialogOpen(false)}>취소</Button>
          <Button onClick={handleExpire} color="warning" disabled={processing}>{processing ? '처리 중...' : '폐기 처리'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetDetailPage;


