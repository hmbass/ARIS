// 승인 관리 관련 타입 정의

export type ApprovalType = 'SR' | 'SPEC' | 'RELEASE' | 'DATA_EXTRACTION';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApprovalLineStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalLine {
  id: number;
  stepOrder: number;
  approverName: string;
  status: ApprovalLineStatus;
  comment?: string;
  approvedAt?: string;
}

export interface Approval {
  id: number;
  approvalNumber: string;
  approvalType: ApprovalType;
  targetId: number;
  status: ApprovalStatus;
  currentStep: number;
  totalSteps: number;
  requesterName: string;
  requestedAt?: string;
  completedAt?: string;
  approvalLines: ApprovalLine[];
  createdAt: string;
}

export interface ApprovalCreateRequest {
  approvalType: ApprovalType;
  targetId: number;
  approverIds: number[];
}

export interface ApprovalActionRequest {
  status: 'APPROVED' | 'REJECTED';
  comment?: string;
}

export interface ApprovalListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  approvalType?: string;
  search?: string;
}





