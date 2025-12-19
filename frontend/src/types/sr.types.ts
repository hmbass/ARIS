// SR 관련 타입 정의

export type SrType = 'DEVELOPMENT' | 'OPERATION';
export type SrCategory = 'NEW' | 'CHANGE' | 'DELETE' | 'ETC';
export type SrStatus = 'REQUESTED' | 'APPROVAL_REQUESTED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ServiceRequest {
  id: number;
  srNumber: string;
  title: string;
  srType: SrType;
  srCategory?: SrCategory;
  status: SrStatus;
  businessRequirement: string;
  projectName: string;
  requesterName: string;
  requesterDeptName?: string;
  requestDate?: string;
  dueDate?: string;
  priority: Priority;
  releaseDate?: string;
  releaseNumber?: string;
  specId?: number;
  specNumber?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface SrCreateRequest {
  title: string;
  businessRequirement: string;
  srType: SrType;
  srCategory?: SrCategory;
  priority: Priority;
  projectId: number;
  requesterDeptId?: number;
  requestDate?: string;
  dueDate?: string;
}

export interface SrUpdateRequest {
  title: string;
  businessRequirement: string;
  dueDate?: string;
  priority?: Priority;
}

export interface SrListParams {
  page?: number;
  size?: number;
  title?: string;
  srType?: SrType;
  status?: SrStatus;
  projectId?: number;
  requesterId?: number;
  startDate?: string;
  endDate?: string;
}





