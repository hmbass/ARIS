import apiClient from '../utils/api';
import type { PageResponse } from '../types/common.types';

export interface User {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  companyName?: string;
  departmentName?: string;
  employeeNumber?: string;
  position?: string;
  isActive?: boolean;
  isApproved?: boolean;
  isLocked?: boolean;
  roles?: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  companyId?: number;
  companyName?: string;  // 직접 입력용 회사명
  departmentId?: number;
  employeeNumber?: string;
  position?: string;
  roleNames?: string[];  // 역할명 목록
}

export interface UserUpdateRequest {
  name?: string;
  phoneNumber?: string;
  position?: string;
  departmentId?: number;
  employeeNumber?: string;
  roleNames?: string[];  // 역할명 목록
}

export interface PasswordResetRequest {
  newPassword: string;
}

export interface UserListParams {
  page?: number;
  size?: number;
  search?: string;
}

/**
 * 사용자 목록 조회
 */
export const getUsers = async (params: UserListParams = {}): Promise<PageResponse<User>> => {
  const { page = 0, size = 20, search } = params;
  const response = await apiClient.get('/users', {
    params: { page, size, search },
  });
  return response.data;
};

/**
 * 사용자 상세 조회
 */
export const getUser = async (id: number): Promise<User> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

/**
 * 사용자 생성
 */
export const createUser = async (data: UserCreateRequest): Promise<User> => {
  const response = await apiClient.post('/users', data);
  return response.data;
};

/**
 * 사용자 정보 수정
 */
export const updateUser = async (id: number, data: UserUpdateRequest): Promise<User> => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
};

/**
 * 비밀번호 재설정
 */
export const resetPassword = async (id: number, data: PasswordResetRequest): Promise<void> => {
  await apiClient.put(`/users/${id}/password`, data);
};

/**
 * 사용자 삭제
 */
export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};

/**
 * 사용자 활성화/비활성화 토글
 */
export const toggleUserStatus = async (id: number): Promise<void> => {
  await apiClient.patch(`/users/${id}/toggle-status`);
};

/**
 * 내 프로필 조회
 */
export const getMyProfile = async (): Promise<User> => {
  const response = await apiClient.get('/profile');
  return response.data;
};

/**
 * 내 프로필 수정
 */
export const updateMyProfile = async (data: UserUpdateRequest): Promise<User> => {
  const response = await apiClient.put('/profile', data);
  return response.data;
};

/**
 * 간소화된 사용자 정보 (담당자 선택용)
 */
export interface UserSimple {
  id: number;
  name: string;
  email: string;
  departmentName?: string;
}

/**
 * 활성화된 사용자 간소화 목록 조회 (담당자 선택용)
 */
export const getActiveUsersSimple = async (params: { page?: number; size?: number } = {}): Promise<PageResponse<UserSimple>> => {
  const { page = 0, size = 100 } = params;
  const response = await apiClient.get('/users-simple', {
    params: { page, size },
  });
  return response.data;
};

