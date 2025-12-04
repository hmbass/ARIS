// 릴리즈 관련 타입 정의

export interface Release {
  id: number;
  version: string;
  name: string;
  description: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'RELEASED' | 'CANCELLED';
  projectId: number;
  projectName: string;
  releaseDate?: string;
  actualReleaseDate?: string;
  issueCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseCreateRequest {
  title: string;
  releaseType: 'EMERGENCY' | 'REGULAR';
  content?: string;
  requesterId?: number;
  requesterDeptId?: number;
  scheduledAt?: string;
}

export interface ReleaseUpdateRequest {
  version?: string;
  name?: string;
  description?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'RELEASED' | 'CANCELLED';
  releaseDate?: string;
  actualReleaseDate?: string;
}

export interface ReleaseListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  projectId?: number;
  search?: string;
}





