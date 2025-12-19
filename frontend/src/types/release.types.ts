// 릴리즈 관련 타입 정의

export type ReleaseType = 'EMERGENCY' | 'REGULAR';
export type ReleaseStatus = 'REQUESTED' | 'APPROVED' | 'DEPLOYED' | 'CANCELLED';

export interface Release {
  id: number;
  releaseNumber: string;
  title: string;
  releaseType: ReleaseType;
  status: ReleaseStatus;
  content?: string;
  requesterId: number;
  requesterName: string;
  requesterDeptName?: string;
  approverId?: number;
  approverName?: string;
  scheduledAt?: string;
  deployedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ReleaseCreateRequest {
  title: string;
  releaseType: ReleaseType;
  content?: string;
  requesterId?: number;
  requesterDeptId?: number;
  scheduledAt?: string;
}

export interface ReleaseUpdateRequest {
  title?: string;
  content?: string;
  scheduledAt?: string;
}

export interface ReleaseListParams {
  page?: number;
  size?: number;
  title?: string;
  releaseType?: ReleaseType;
  status?: ReleaseStatus;
  requesterId?: number;
}
