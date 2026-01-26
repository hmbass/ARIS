import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiError } from '../types/common.types';

// API Base URL
// 프로덕션: Nginx 프록시를 통해 /api로 요청
// 개발: 환경변수가 있으면 사용, 없으면 상대 경로
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - JWT 토큰 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 로그아웃 처리 함수 (중복 리다이렉트 방지)
let isLoggingOut = false;
const handleLogout = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  
  console.log('[Auth] 세션 만료 - 로그아웃 처리');
  
  // localStorage 정리
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Zustand persist storage도 정리해서 isAuthenticated 상태를 false로 만듦
  localStorage.removeItem('auth-storage');
  
  // 현재 로그인 페이지가 아닌 경우에만 리다이렉트
  if (!window.location.pathname.includes('/login')) {
    // 강제 페이지 새로고침으로 React 상태 완전 초기화
    window.location.replace('/login');
  }
};

// 토큰 갱신 중인지 여부 (동시 요청 처리용)
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// 토큰 갱신 함수 (한 번만 실행, 나머지는 대기)
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  const { accessToken, refreshToken: newRefreshToken } = response.data;
  localStorage.setItem('accessToken', accessToken);
  
  // 새 refreshToken도 저장 (백엔드에서 갱신된 경우)
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }
  
  console.log('[Auth] 토큰 갱신 성공');
  return accessToken;
};

// Response Interceptor - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 이미 로그아웃 진행 중이면 추가 처리 안함
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    // 401 또는 403 에러이고, 아직 재시도하지 않은 경우
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // 재시도 횟수가 2회 초과하면 로그아웃
      if (originalRequest._retryCount > 2) {
        console.log('[Auth] 재시도 횟수 초과 - 로그아웃');
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // 이미 갱신 중이면 기존 Promise 재사용
        if (isRefreshing && refreshPromise) {
          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }

        // 토큰 갱신 시작
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
        
        const newToken = await refreshPromise;
        
        isRefreshing = false;
        refreshPromise = null;

        // 새 토큰으로 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('[Auth] 토큰 갱신 실패 - 로그아웃');
        isRefreshing = false;
        refreshPromise = null;
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // API 에러 응답 처리
    const apiError: ApiError = error.response?.data || {
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;



