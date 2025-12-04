import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useAuthStore } from './store/authStore';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectListPage from './pages/project/ProjectListPage';
import ProjectCreatePage from './pages/project/ProjectCreatePage';
import SRListPage from './pages/sr/SRListPage';
import SRCreatePage from './pages/sr/SRCreatePage';
import SRDetailPage from './pages/sr/SRDetailPage';
import SpecListPage from './pages/spec/SpecListPage';
import SpecCreatePage from './pages/spec/SpecCreatePage';
import ApprovalListPage from './pages/approval/ApprovalListPage';
import ApprovalCreatePage from './pages/approval/ApprovalCreatePage';
import IssueListPage from './pages/issue/IssueListPage';
import IssueCreatePage from './pages/issue/IssueCreatePage';
import ReleaseListPage from './pages/release/ReleaseListPage';
import ReleaseCreatePage from './pages/release/ReleaseCreatePage';
import IncidentListPage from './pages/incident/IncidentListPage';
import IncidentCreatePage from './pages/incident/IncidentCreatePage';
import PartnerListPage from './pages/partner/PartnerListPage';
import PartnerCreatePage from './pages/partner/PartnerCreatePage';
import AssetListPage from './pages/asset/AssetListPage';
import AssetCreatePage from './pages/asset/AssetCreatePage';
import UserListPage from './pages/user/UserListPage';
import UserCreatePage from './pages/user/UserCreatePage';
import UserEditPage from './pages/user/UserEditPage';
import PasswordResetPage from './pages/user/PasswordResetPage';
import ProfilePage from './pages/user/ProfilePage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';

// Material-UI 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Private Route 컴포넌트
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* 프로젝트 */}
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/new" element={<ProjectCreatePage />} />
            
            {/* SR 관리 */}
            <Route path="srs" element={<SRListPage />} />
            <Route path="srs/new" element={<SRCreatePage />} />
            <Route path="srs/:id" element={<SRDetailPage />} />
            
            {/* SPEC 관리 */}
            <Route path="specs" element={<SpecListPage />} />
            <Route path="specs/new" element={<SpecCreatePage />} />
            <Route path="specs/:id" element={<div>SPEC 상세 페이지 (구현 예정)</div>} />
            
            {/* 승인 관리 */}
            <Route path="approvals" element={<ApprovalListPage />} />
            <Route path="approvals/new" element={<ApprovalCreatePage />} />
            <Route path="approvals/:id" element={<div>승인 상세 페이지 (구현 예정)</div>} />
            
            {/* 이슈 관리 */}
            <Route path="issues" element={<IssueListPage />} />
            <Route path="issues/new" element={<IssueCreatePage />} />
            <Route path="issues/:id" element={<div>이슈 상세 페이지 (구현 예정)</div>} />
            
            {/* 릴리즈 */}
            <Route path="releases" element={<ReleaseListPage />} />
            <Route path="releases/new" element={<ReleaseCreatePage />} />
            <Route path="releases/:id" element={<div>릴리즈 상세 페이지 (구현 예정)</div>} />
            
            {/* 장애 관리 */}
            <Route path="incidents" element={<IncidentListPage />} />
            <Route path="incidents/new" element={<IncidentCreatePage />} />
            <Route path="incidents/:id" element={<div>장애 상세 페이지 (구현 예정)</div>} />
            
            {/* 파트너 */}
            <Route path="partners" element={<PartnerListPage />} />
            <Route path="partners/new" element={<PartnerCreatePage />} />
            <Route path="partners/:id" element={<div>파트너 상세 페이지 (구현 예정)</div>} />
            
            {/* 자산 관리 */}
            <Route path="assets" element={<AssetListPage />} />
            <Route path="assets/new" element={<AssetCreatePage />} />
            <Route path="assets/:id" element={<div>자산 상세 페이지 (구현 예정)</div>} />
            
            {/* 사용자 관리 (시스템 관리자 전용) */}
            <Route path="users" element={<UserListPage />} />
            <Route path="users/new" element={<UserCreatePage />} />
            <Route path="users/:id/edit" element={<UserEditPage />} />
            <Route path="users/:id/password" element={<PasswordResetPage />} />

            {/* 프로필 및 비밀번호 변경 */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
