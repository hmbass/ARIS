# ARIS 프론트엔드 개발 가이드

## 📋 문서 정보
- **작성일**: 2025-10-15
- **버전**: 1.0.0
- **기술 스택**: React 18 + TypeScript + Vite + Material-UI

---

## 🎯 개요

ARIS 프론트엔드는 React와 TypeScript 기반의 모던 웹 애플리케이션입니다.

### 기술 스택
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Form**: React Hook Form

---

## 🚀 시작하기

### 1. 개발 환경 요구사항
```bash
Node.js: v18 이상
npm: v9 이상
```

### 2. 설치 및 실행
```bash
# 프로젝트 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

### 3. 환경 변수 설정
`.env` 파일 생성:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 📁 프로젝트 구조

```
frontend/
├── public/                     # 정적 파일
├── src/
│   ├── api/                    # API 클라이언트
│   │   ├── auth.ts            # 인증 API
│   │   ├── project.ts         # 프로젝트 API
│   │   ├── sr.ts              # SR API
│   │   └── ...
│   ├── components/             # 재사용 컴포넌트
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Dialog.tsx
│   │   └── layout/            # 레이아웃 컴포넌트
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── MainLayout.tsx
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── project/
│   │   │   ├── ProjectListPage.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   └── ProjectFormPage.tsx
│   │   └── ...
│   ├── store/                  # Zustand 스토어
│   │   ├── authStore.ts       # 인증 상태
│   │   ├── projectStore.ts    # 프로젝트 상태
│   │   └── ...
│   ├── types/                  # TypeScript 타입
│   │   ├── auth.types.ts
│   │   ├── project.types.ts
│   │   ├── common.types.ts
│   │   └── ...
│   ├── utils/                  # 유틸리티
│   │   ├── api.ts             # Axios 인스턴스
│   │   ├── format.ts          # 포맷팅 함수
│   │   └── validation.ts      # 검증 함수
│   ├── hooks/                  # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useProject.ts
│   │   └── ...
│   ├── App.tsx                 # 메인 앱
│   └── main.tsx                # 진입점
├── package.json
├── tsconfig.json
├── vite.config.ts
├── Dockerfile
└── nginx.conf
```

---

## 🔐 인증 (Authentication)

### JWT 토큰 관리
```typescript
// utils/api.ts에서 자동으로 JWT 토큰을 헤더에 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 로그인 플로우
1. 사용자가 이메일/비밀번호 입력
2. `POST /api/auth/login` 호출
3. 응답받은 JWT 토큰과 사용자 정보를 Zustand 스토어에 저장
4. localStorage에도 토큰 저장
5. 대시보드로 리다이렉트

### 인증 스토어 사용 예시
```typescript
import { useAuthStore } from '../store/authStore';

function MyComponent() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  
  // 로그인
  const handleLogin = async () => {
    const response = await login({ email, password });
    setAuth(response.user, response.accessToken, response.refreshToken);
  };
  
  // 로그아웃
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };
}
```

---

## 🎨 UI 컴포넌트

### Material-UI 사용
```typescript
import { Button, TextField, Box, Typography } from '@mui/material';

function MyForm() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">제목</Typography>
      <TextField label="이름" fullWidth margin="normal" />
      <Button variant="contained" color="primary">
        제출
      </Button>
    </Box>
  );
}
```

### 테이블 컴포넌트 예시
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

function DataTable({ data }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>이름</TableCell>
            <TableCell>상태</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

---

## 🔄 API 호출

### API 클라이언트 생성 예시
```typescript
// api/sr.ts
import apiClient from '../utils/api';
import { Sr, SrRequest } from '../types/sr.types';
import { PageResponse } from '../types/common.types';

// SR 목록 조회
export const getSrs = async (params: any): Promise<PageResponse<Sr>> => {
  const response = await apiClient.get<PageResponse<Sr>>('/srs', { params });
  return response.data;
};

// SR 상세 조회
export const getSr = async (id: number): Promise<Sr> => {
  const response = await apiClient.get<Sr>(`/srs/${id}`);
  return response.data;
};

// SR 등록
export const createSr = async (data: SrRequest): Promise<Sr> => {
  const response = await apiClient.post<Sr>('/srs', data);
  return response.data;
};

// SR 수정
export const updateSr = async (id: number, data: SrRequest): Promise<Sr> => {
  const response = await apiClient.put<Sr>(`/srs/${id}`, data);
  return response.data;
};

// SR 삭제
export const deleteSr = async (id: number): Promise<void> => {
  await apiClient.delete(`/srs/${id}`);
};
```

### 페이지에서 API 사용
```typescript
import React, { useEffect, useState } from 'react';
import { getSrs } from '../../api/sr';

function SrListPage() {
  const [srs, setSrs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSrs();
  }, []);

  const fetchSrs = async () => {
    setLoading(true);
    try {
      const response = await getSrs({ page: 0, size: 10 });
      setSrs(response.content);
    } catch (error) {
      console.error('Failed to fetch SRs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* UI 렌더링 */}
    </div>
  );
}
```

---

## 📝 폼 처리 (React Hook Form)

### 설치
```bash
npm install react-hook-form
```

### 사용 예시
```typescript
import { useForm } from 'react-hook-form';
import { TextField, Button, Box } from '@mui/material';

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="이메일"
        {...register('email', { required: '이메일은 필수입니다.' })}
        error={!!errors.email}
        helperText={errors.email?.message}
        fullWidth
        margin="normal"
      />
      
      <TextField
        label="비밀번호"
        type="password"
        {...register('password', { required: '비밀번호는 필수입니다.' })}
        error={!!errors.password}
        helperText={errors.password?.message}
        fullWidth
        margin="normal"
      />
      
      <Button type="submit" variant="contained" fullWidth>
        로그인
      </Button>
    </Box>
  );
}
```

---

## 🔀 라우팅 (React Router)

### 라우트 정의
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="srs" element={<SrListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Private Route (인증 필요)
```typescript
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 사용
<Route
  path="/"
  element={
    <PrivateRoute>
      <MainLayout />
    </PrivateRoute>
  }
/>
```

### 프로그래매틱 네비게이션
```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/projects');
    // 또는
    navigate('/projects/123');
  };
}
```

---

## 🎨 스타일링

### Material-UI sx prop
```typescript
<Box
  sx={{
    p: 3,                    // padding: 24px (3 * 8px)
    m: 2,                    // margin: 16px
    bgcolor: 'primary.main', // background-color
    color: 'white',
    borderRadius: 1,         // border-radius: 8px
    boxShadow: 2,           // box-shadow
  }}
>
  내용
</Box>
```

### 테마 커스터마이징
```typescript
// App.tsx
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* 앱 내용 */}
    </ThemeProvider>
  );
}
```

---

## 🐳 Docker 배포

### Dockerfile
이미 생성된 `frontend/Dockerfile` 사용

### 빌드 및 실행
```bash
# 이미지 빌드
docker build -t aris-frontend .

# 컨테이너 실행
docker run -p 3000:80 aris-frontend

# docker-compose에 추가 (권장)
```

### docker-compose.yml에 프론트엔드 추가
```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: aris-frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:8080/api
    networks:
      - aris-network
    depends_on:
      - backend
```

---

## 📋 개발 체크리스트

### 새 페이지 추가 시
- [ ] 타입 정의 (`types/*.types.ts`)
- [ ] API 클라이언트 (`api/*.ts`)
- [ ] 스토어 (필요 시) (`store/*Store.ts`)
- [ ] 페이지 컴포넌트 (`pages/*/`)
- [ ] 라우트 추가 (`App.tsx`)
- [ ] 사이드바 메뉴 추가 (`components/layout/Sidebar.tsx`)

### 코드 품질
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] 콘솔 에러 없음
- [ ] 반응형 디자인 확인
- [ ] 로딩 상태 처리
- [ ] 에러 처리

---

## 🔧 트러블슈팅

### CORS 에러
백엔드에서 CORS 설정 확인:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 401 Unauthorized
- JWT 토큰이 만료되었거나 유효하지 않음
- `localStorage`에서 토큰 확인
- 로그아웃 후 다시 로그인

### 개발 서버 접속 불가
```bash
# Vite 개발 서버 설정 확인
# vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
```

---

## 📚 참고 자료

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## ✅ 다음 단계

1. 나머지 페이지 구현 (SR, SPEC, 승인, 이슈 등)
2. 파일 업로드/다운로드 기능
3. 차트 라이브러리 통합 (Chart.js)
4. 알림 센터 구현
5. E2E 테스트 작성

---

**Last Updated**: 2025-10-15
**Document Version**: 1.0.0









