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

// 승인 처리
export const approveApproval = async (
  id: number,
  data: { comment?: string }
): Promise<Approval> => {
  const response = await apiClient.put<Approval>(`/approvals/${id}/approve`, data);
  return response.data;
};

// 반려 처리
export const rejectApproval = async (
  id: number,
  data: { comment?: string }
): Promise<Approval> => {
  const response = await apiClient.put<Approval>(`/approvals/${id}/reject`, data);
  return response.data;
};

// 승인 처리 (통합 - 상태에 따라 분기)
export const processApproval = async (
  id: number,
  data: ApprovalActionRequest
): Promise<Approval> => {
  if (data.status === 'APPROVED') {
    return approveApproval(id, { comment: data.comment });
  } else {
    return rejectApproval(id, { comment: data.comment });
  }
};

// 승인 취소
export const cancelApproval = async (id: number): Promise<Approval> => {
  const response = await apiClient.put<Approval>(`/approvals/${id}/cancel`);
  return response.data;
};

// 승인 삭제 (취소로 대체)
export const deleteApproval = async (id: number): Promise<void> => {
  await cancelApproval(id);
};





