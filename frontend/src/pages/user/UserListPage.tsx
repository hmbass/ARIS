import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, Card, CardContent, useMediaQuery,
  useTheme, Alert, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from '@mui/material';
import { Add, Edit, Delete, Lock, LockOpen, VpnKey } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, toggleUserStatus, type User } from '../../api/user';

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUsers({ page, size: rowsPerPage });
      setUsers(response.content);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || '사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (userId: number) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUserId === null) return;

    try {
      await deleteUser(selectedUserId);
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setError(err.message || '사용자 삭제에 실패했습니다.');
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await toggleUserStatus(userId);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to toggle user status:', err);
      setError(err.message || '사용자 상태 변경에 실패했습니다.');
    }
  };

  const getStatusChip = (user: User) => {
    if (user.isLocked) {
      return <Chip label="잠김" color="error" size="small" icon={<Lock />} />;
    }
    if (!user.isActive) {
      return <Chip label="비활성" color="default" size="small" />;
    }
    if (!user.isApproved) {
      return <Chip label="미승인" color="warning" size="small" />;
    }
    return <Chip label="활성" color="success" size="small" />;
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
        <Typography variant={isMobile ? 'h5' : 'h4'}>사용자 관리</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/users/new')}
          size={isMobile ? 'small' : 'medium'}
        >
          {isMobile ? '등록' : '사용자 등록'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
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
          ) : users.length === 0 && !error ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">데이터가 없습니다.</Typography>
            </Paper>
          ) : (
            users.map((user) => (
              <Card key={user.id} sx={{ width: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="div">{user.name}</Typography>
                    {getStatusChip(user)}
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user.companyName} {user.departmentName && `- ${user.departmentName}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    직급: {user.position || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    권한: {user.roles?.join(', ') || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <IconButton size="small" color="primary" onClick={() => navigate(`/users/${user.id}/edit`)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => navigate(`/users/${user.id}/password`)}>
                      <VpnKey />
                    </IconButton>
                    <IconButton
                      size="small"
                      color={user.isActive ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      {user.isActive ? <Lock /> : <LockOpen />}
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(user.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden', height: 'calc(100% - 120px)' }}>
          <TableContainer sx={{ maxHeight: 'calc(100% - 52px)' }}>
            <Table stickyHeader aria-label="user table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>이름</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>회사</TableCell>
                  <TableCell>부서</TableCell>
                  <TableCell>직급</TableCell>
                  <TableCell>권한</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>마지막 로그인</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 && !error ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companyName || '-'}</TableCell>
                      <TableCell>{user.departmentName || '-'}</TableCell>
                      <TableCell>{user.position || '-'}</TableCell>
                      <TableCell>{user.roles?.join(', ') || '-'}</TableCell>
                      <TableCell>{getStatusChip(user)}</TableCell>
                      <TableCell>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/users/${user.id}/edit`)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="secondary" onClick={() => navigate(`/users/${user.id}/password`)}>
                          <VpnKey />
                        </IconButton>
                        <IconButton
                          size="small"
                          color={user.isActive ? 'warning' : 'success'}
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.isActive ? '비활성화' : '활성화'}
                        >
                          {user.isActive ? <Lock /> : <LockOpen />}
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(user.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* 삭제 확인 Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>사용자 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserListPage;



