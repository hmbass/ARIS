import apiClient from '../utils/api';
import type { Approval, ApprovalCreateRequest, ApprovalActionRequest, ApprovalListParams } from '../types/approval.types';
import type { PageResponse } from '../types/common.types';

// 승인 목록 조회
export const getApprovals = async (
  params: ApprovalListParams
): Promise<PageResponse<Approval>> => {
  const response = await apiClient.get<PageResponse<Approval>>('/approvals', { params });
  return response.data;
};

// 승인 상세 조회
export const getApproval = async (id: number): Promise<Approval> => {
  const response = await apiClient.get<Approval>(`/approvals/${id}`);
  return response.data;
};

// 승인 요청 생성
export const createApproval = async (data: ApprovalCreateRequest): Promise<Approval> => {
  const response = await apiClient.post<Approval>('/approvals', data);
  return response.data;
};

// 승인 처리 (승인/반려)
export const processApproval = async (
  id: number,
  data: ApprovalActionRequest
): Promise<Approval> => {
  const response = await apiClient.put<Approval>(`/approvals/${id}/process`, data);
  return response.data;
};

// 승인 취소
export const deleteApproval = async (id: number): Promise<void> => {
  await apiClient.delete(`/approvals/${id}`);
};





