import apiClient from '../utils/api';
import type { ServiceRequest, SrCreateRequest, SrUpdateRequest, SrListParams } from '../types/sr.types';
import type { PageResponse } from '../types/common.types';

// SR 목록 조회
export const getSrs = async (
  params: SrListParams
): Promise<PageResponse<ServiceRequest>> => {
  const response = await apiClient.get<PageResponse<ServiceRequest>>('/srs', { params });
  return response.data;
};

// SR 상세 조회
export const getSr = async (id: number): Promise<ServiceRequest> => {
  const response = await apiClient.get<ServiceRequest>(`/srs/${id}`);
  return response.data;
};

// SR 등록
export const createSr = async (data: SrCreateRequest): Promise<ServiceRequest> => {
  const response = await apiClient.post<ServiceRequest>('/srs', data);
  return response.data;
};

// SR 수정
export const updateSr = async (id: number, data: SrUpdateRequest): Promise<ServiceRequest> => {
  const response = await apiClient.put<ServiceRequest>(`/srs/${id}`, data);
  return response.data;
};

// SR 삭제
export const deleteSr = async (id: number): Promise<void> => {
  await apiClient.delete(`/srs/${id}`);
};

// SR 상태 변경
export const updateSrStatus = async (
  id: number,
  status: string
): Promise<ServiceRequest> => {
  const response = await apiClient.put<ServiceRequest>(`/srs/${id}/status`, { status });
  return response.data;
};

// 승인 요청 가능한 SR 목록 조회
export const getApprovableSrs = async (): Promise<ServiceRequest[]> => {
  const response = await apiClient.get<ServiceRequest[]>('/srs/approvable');
  return response.data;
};







