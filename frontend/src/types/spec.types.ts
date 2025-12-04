// SPEC (Specification) 관련 타입 정의

export type SpecType = 'DEVELOPMENT' | 'OPERATION';
export type SpecCategory = 'ACCEPTED' | 'CANCELLED';
export type SpecStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED';

export interface Specification {
  id: number;
  specNumber: string;
  specType: SpecType;
  specCategory: SpecCategory;
  status: SpecStatus;
  functionPoint?: number;
  manDay?: number;
  srId: number;
  srNumber?: string;
  srTitle?: string;
  assigneeId?: number;
  assigneeName?: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecCreateRequest {
  srId: number;
  specType: SpecType;
  specCategory: SpecCategory;
  functionPoint?: number;
  manDay?: number;
  assigneeId?: number;
  reviewerId?: number;
}

export interface SpecUpdateRequest {
  title?: string;
  description?: string;
  functionPoint?: number;
  manDay?: number;
  status?: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED';
  reviewerId?: number;
}

export interface SpecListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  projectId?: number;
  srId?: number;
  search?: string;
}





