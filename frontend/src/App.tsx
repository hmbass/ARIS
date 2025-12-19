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
import ProjectDetailPage from './pages/project/ProjectDetailPage';
import ProjectEditPage from './pages/project/ProjectEditPage';
import SRListPage from './pages/sr/SRListPage';
import SRCreatePage from './pages/sr/SRCreatePage';
import SRDetailPage from './pages/sr/SRDetailPage';
import SREditPage from './pages/sr/SREditPage';
import SpecListPage from './pages/spec/SpecListPage';
import SpecCreatePage from './pages/spec/SpecCreatePage';
import SpecDetailPage from './pages/spec/SpecDetailPage';
import SpecEditPage from './pages/spec/SpecEditPage';
import ApprovalListPage from './pages/approval/ApprovalListPage';
import ApprovalCreatePage from './pages/approval/ApprovalCreatePage';
import ApprovalDetailPage from './pages/approval/ApprovalDetailPage';
import IssueListPage from './pages/issue/IssueListPage';
import IssueCreatePage from './pages/issue/IssueCreatePage';
import IssueDetailPage from './pages/issue/IssueDetailPage';
import IssueEditPage from './pages/issue/IssueEditPage';
import ReleaseListPage from './pages/release/ReleaseListPage';
import ReleaseCreatePage from './pages/release/ReleaseCreatePage';
import ReleaseDetailPage from './pages/release/ReleaseDetailPage';
import ReleaseEditPage from './pages/release/ReleaseEditPage';
import IncidentListPage from './pages/incident/IncidentListPage';
import IncidentCreatePage from './pages/incident/IncidentCreatePage';
import IncidentDetailPage from './pages/incident/IncidentDetailPage';
import IncidentEditPage from './pages/incident/IncidentEditPage';
import PartnerListPage from './pages/partner/PartnerListPage';
import PartnerCreatePage from './pages/partner/PartnerCreatePage';
import PartnerDetailPage from './pages/partner/PartnerDetailPage';
import PartnerEditPage from './pages/partner/PartnerEditPage';
import AssetListPage from './pages/asset/AssetListPage';
import AssetCreatePage from './pages/asset/AssetCreatePage';
import AssetDetailPage from './pages/asset/AssetDetailPage';
import AssetEditPage from './pages/asset/AssetEditPage';
import UserListPage from './pages/user/UserListPage';
import UserCreatePage from './pages/user/UserCreatePage';
import UserEditPage from './pages/user/UserEditPage';
import PasswordResetPage from './pages/user/PasswordResetPage';
import ProfilePage from './pages/user/ProfilePage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';

// Modern Dark Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#0a0a0f',
      paper: '#12121a',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 100% 100%, rgba(139, 92, 246, 0.1), transparent)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#12121a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 10,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 10,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0a0a0f',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            borderLeft: '3px solid #6366f1',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          color: '#818cf8',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
        head: {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          fontWeight: 600,
          color: '#f8fafc',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#12121a',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a24',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
        },
        standardInfo: {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1a1a24',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.85rem',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#6366f1',
        },
      },
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
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/:id/edit" element={<ProjectEditPage />} />
            
            {/* SR 관리 */}
            <Route path="srs" element={<SRListPage />} />
            <Route path="srs/new" element={<SRCreatePage />} />
            <Route path="srs/:id" element={<SRDetailPage />} />
            <Route path="srs/:id/edit" element={<SREditPage />} />
            
            {/* SPEC 관리 */}
            <Route path="specs" element={<SpecListPage />} />
            <Route path="specs/new" element={<SpecCreatePage />} />
            <Route path="specs/:id" element={<SpecDetailPage />} />
            <Route path="specs/:id/edit" element={<SpecEditPage />} />
            
            {/* 승인 관리 */}
            <Route path="approvals" element={<ApprovalListPage />} />
            <Route path="approvals/new" element={<ApprovalCreatePage />} />
            <Route path="approvals/:id" element={<ApprovalDetailPage />} />
            
            {/* 이슈 관리 */}
            <Route path="issues" element={<IssueListPage />} />
            <Route path="issues/new" element={<IssueCreatePage />} />
            <Route path="issues/:id" element={<IssueDetailPage />} />
            <Route path="issues/:id/edit" element={<IssueEditPage />} />
            
            {/* 릴리즈 */}
            <Route path="releases" element={<ReleaseListPage />} />
            <Route path="releases/new" element={<ReleaseCreatePage />} />
            <Route path="releases/:id" element={<ReleaseDetailPage />} />
            <Route path="releases/:id/edit" element={<ReleaseEditPage />} />
            
            {/* 장애 관리 */}
            <Route path="incidents" element={<IncidentListPage />} />
            <Route path="incidents/new" element={<IncidentCreatePage />} />
            <Route path="incidents/:id" element={<IncidentDetailPage />} />
            <Route path="incidents/:id/edit" element={<IncidentEditPage />} />
            
            {/* 파트너 */}
            <Route path="partners" element={<PartnerListPage />} />
            <Route path="partners/new" element={<PartnerCreatePage />} />
            <Route path="partners/:id" element={<PartnerDetailPage />} />
            <Route path="partners/:id/edit" element={<PartnerEditPage />} />
            
            {/* 자산 관리 */}
            <Route path="assets" element={<AssetListPage />} />
            <Route path="assets/new" element={<AssetCreatePage />} />
            <Route path="assets/:id" element={<AssetDetailPage />} />
            <Route path="assets/:id/edit" element={<AssetEditPage />} />
            
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
