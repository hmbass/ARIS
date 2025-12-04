// 승인 관리 관련 타입 정의

export interface Approval {
  id: number;
  requestType: 'SR' | 'SPEC' | 'RELEASE';
  requestId: number;
  requestTitle: string;
  requestorId: number;
  requestorName: string;
  approverId: number;
  approverName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequest {
  requestType: 'SR' | 'SPEC' | 'RELEASE';
  requestId: number;
  approverId: number;
  comment?: string;
}

export interface ApprovalCreateRequest {
  approvalType: 'SR' | 'SPEC' | 'RELEASE' | 'DATA_EXTRACTION';
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
  requestType?: string;
  approverId?: number;
  search?: string;
}





