import apiClient from '../utils/api';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

// 로그인
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
};

// 로그아웃
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

// 회원가입
export const register = async (data: any): Promise<any> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

// 현재 사용자 정보 조회
export const getCurrentUser = async (): Promise<any> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// 비밀번호 변경
export const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> => {
  await apiClient.put('/auth/password/change', data);
};

