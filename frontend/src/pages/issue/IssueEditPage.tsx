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
  Chip,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getIssue, updateIssue } from '../../api/issue';
import { getPmCandidates, type PmCandidate } from '../../api/project';
import type { Issue, IssueUpdateRequest } from '../../types/issue.types';

const IssueEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [issue, setIssue] = useState<Issue | null>(null);
  const [formData, setFormData] = useState<IssueUpdateRequest>({
    title: '',
    content: '',
    issueType: 'BUG',
    priority: 'MEDIUM',
    status: 'OPEN',
  });
  const [users, setUsers] = useState<PmCandidate[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<PmCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchIssue(Number(id));
      fetchUsers();
    }
  }, [id]);

  const fetchIssue = async (issueId: number) => {
    try {
      setLoading(true);
      const data = await getIssue(issueId);
      setIssue(data);
      setFormData({
        title: data.title,
        content: data.content,
        issueType: data.issueType,
        priority: data.priority,
        status: data.status,
        assigneeId: data.assigneeId,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || '이슈를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await getPmCandidates();
      setUsers(response.content);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // 담당자 선택 초기화
  useEffect(() => {
    if (issue && users.length > 0 && issue.assigneeId) {
      const assignee = users.find(u => u.id === issue.assigneeId);
      if (assignee) {
        setSelectedAssignee(assignee);
      }
    }
  }, [issue, users]);

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
      if (!formData.title) {
        setError('제목은 필수입니다.');
        setSaving(false);
        return;
      }

      const requestData = {
        ...formData,
        assigneeId: selectedAssignee?.id,
      };

      await updateIssue(Number(id), requestData);
      setSuccess('이슈가 성공적으로 수정되었습니다.');
      setTimeout(() => navigate(`/issues/${id}`), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || '이슈 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;
  }

  if (!issue) {
    return (
      <Box>
        <Alert severity="error">{error || '이슈를 찾을 수 없습니다.'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/issues')} sx={{ mt: 2 }}>목록으로</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(`/issues/${id}`)} sx={{ mb: 2 }}>상세로 돌아가기</Button>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>이슈 수정</Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>이슈 정보 (수정 불가)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip label={`이슈번호: ${issue.issueNumber}`} variant="outlined" />
          <Chip label={`프로젝트: ${issue.projectName || '-'}`} variant="outlined" />
          <Chip label={`보고자: ${issue.reporterName}`} variant="outlined" />
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="제목" name="title" value={formData.title} onChange={handleChange} required />
            <TextField fullWidth label="내용" name="content" value={formData.content} onChange={handleChange} multiline rows={4} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField fullWidth select label="이슈 유형" name="issueType" value={formData.issueType || ''} onChange={handleChange}>
                <MenuItem value="BUG">버그</MenuItem>
                <MenuItem value="IMPROVEMENT">개선</MenuItem>
                <MenuItem value="NEW_FEATURE">신규기능</MenuItem>
                <MenuItem value="TASK">작업</MenuItem>
              </TextField>
              <TextField fullWidth select label="우선순위" name="priority" value={formData.priority || ''} onChange={handleChange}>
                <MenuItem value="LOW">낮음</MenuItem>
                <MenuItem value="MEDIUM">보통</MenuItem>
                <MenuItem value="HIGH">높음</MenuItem>
                <MenuItem value="CRITICAL">심각</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField fullWidth select label="상태" name="status" value={formData.status || ''} onChange={handleChange}>
                <MenuItem value="OPEN">열림</MenuItem>
                <MenuItem value="IN_PROGRESS">진행중</MenuItem>
                <MenuItem value="RESOLVED">해결됨</MenuItem>
                <MenuItem value="CLOSED">종료</MenuItem>
              </TextField>

              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})${option.position ? ` - ${option.position}` : ''}`}
                value={selectedAssignee}
                onChange={(_, newValue) => setSelectedAssignee(newValue)}
                loading={loadingUsers}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="담당자"
                    placeholder="담당자를 검색하세요"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="검색 결과가 없습니다"
                loadingText="로딩 중..."
              />
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button variant="outlined" startIcon={isMobile ? null : <Cancel />} onClick={() => navigate(`/issues/${id}`)} disabled={saving} fullWidth={isMobile}>취소</Button>
            <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={20} /> : (isMobile ? null : <Save />)} disabled={saving} fullWidth={isMobile}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default IssueEditPage;


