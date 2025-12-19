import apiClient from '../utils/api';
import type { Specification, SpecCreateRequest, SpecUpdateRequest, SpecListParams } from '../types/spec.types';
import type { PageResponse } from '../types/common.types';

// SPEC 목록 조회
export const getSpecs = async (
  params: SpecListParams
): Promise<PageResponse<Specification>> => {
  const response = await apiClient.get<PageResponse<Specification>>('/specs', { params });
  return response.data;
};

// SPEC 상세 조회
export const getSpec = async (id: number): Promise<Specification> => {
  const response = await apiClient.get<Specification>(`/specs/${id}`);
  return response.data;
};

// SPEC 등록
export const createSpec = async (data: SpecCreateRequest): Promise<Specification> => {
  const response = await apiClient.post<Specification>('/specs', data);
  return response.data;
};

// SPEC 수정
export const updateSpec = async (id: number, data: SpecUpdateRequest): Promise<Specification> => {
  const response = await apiClient.put<Specification>(`/specs/${id}`, data);
  return response.data;
};

// SPEC 삭제
export const deleteSpec = async (id: number): Promise<void> => {
  await apiClient.delete(`/specs/${id}`);
};

// SPEC 상태 변경
export const updateSpecStatus = async (
  id: number,
  status: string
): Promise<Specification> => {
  const response = await apiClient.put<Specification>(`/specs/${id}/status`, { status });
  return response.data;
};

// 승인 요청 가능한 SPEC 목록 조회
export const getApprovableSpecs = async (): Promise<Specification[]> => {
  const response = await apiClient.get<Specification[]>('/specs/approvable');
  return response.data;
};







