import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSrs } from '../../api/sr';
import type { ServiceRequest } from '../../types/sr.types';

const SRListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [srs, setSrs] = useState<ServiceRequest[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSrs();
  }, [page, rowsPerPage]);

  const fetchSrs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getSrs({ page, size: rowsPerPage });
      setSrs(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch SRs:', err);
      setError(err.message || 'SR 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      REQUESTED: 'primary',
      APPROVAL_REQUESTED: 'warning',
      APPROVED: 'primary',
      IN_PROGRESS: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'error',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      REQUESTED: '요청됨',
      APPROVAL_REQUESTED: '승인요청',
      APPROVED: '승인됨',
      IN_PROGRESS: '진행중',
      COMPLETED: '완료',
      CANCELLED: '취소됨',
      REJECTED: '반려됨',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      LOW: 'default',
      MEDIUM: 'primary',
      HIGH: 'warning',
      URGENT: 'error',
    };
    return colors[priority] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: '낮음',
      MEDIUM: '보통',
      HIGH: '높음',
      URGENT: '긴급',
    };
    return labels[priority] || priority;
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
        width: '100%',
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>SR 관리</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => navigate('/srs/new')}
          size={isMobile ? 'small' : 'medium'}
        >
          {isMobile ? 'SR 등록' : 'SR 등록'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 모바일: 카드 뷰 */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} />
              <Typography sx={{ mt: 1 }}>로딩 중...</Typography>
            </Paper>
          ) : srs.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>데이터가 없습니다.</Typography>
            </Paper>
          ) : (
            srs.map((sr) => (
              <Card
                key={sr.id}
                sx={{ cursor: 'pointer', width: '100%' }}
                onClick={() => navigate(`/srs/${sr.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>
                      {sr.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(sr.status)}
                      color={getStatusColor(sr.status)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={sr.srType === 'DEVELOPMENT' ? '개발' : '운영'}
                      size="small"
                      color={sr.srType === 'DEVELOPMENT' ? 'primary' : 'secondary'}
                    />
                    <Chip
                      label={getPriorityLabel(sr.priority)}
                      color={getPriorityColor(sr.priority)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    프로젝트: {sr.projectName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    요청자: {sr.requesterName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    요청일: {sr.requestDate || new Date(sr.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="페이지당:"
            />
          </Box>
        </Box>
      ) : (
        /* 데스크탑: 테이블 뷰 */
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SR번호</TableCell>
                <TableCell>제목</TableCell>
                <TableCell>유형</TableCell>
                <TableCell>프로젝트</TableCell>
                <TableCell>요청자</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>우선순위</TableCell>
                <TableCell>요청일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                    <Typography sx={{ mt: 1 }}>로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              ) : srs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>데이터가 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                srs.map((sr) => (
                  <TableRow
                    key={sr.id}
                    hover
                    onClick={() => navigate(`/srs/${sr.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{sr.srNumber}</TableCell>
                    <TableCell>{sr.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={sr.srType === 'DEVELOPMENT' ? '개발' : '운영'}
                        size="small"
                        color={sr.srType === 'DEVELOPMENT' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{sr.projectName}</TableCell>
                    <TableCell>{sr.requesterName}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(sr.status)}
                        color={getStatusColor(sr.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityLabel(sr.priority)}
                        color={getPriorityColor(sr.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{sr.requestDate || new Date(sr.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="페이지당 행 수:"
          />
        </TableContainer>
      )}
    </Box>
  );
};

export default SRListPage;
