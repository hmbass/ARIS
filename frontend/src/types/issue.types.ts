// 이슈 관리 관련 타입 정의

export interface Issue {
  id: number;
  title: string;
  description: string;
  issueType: 'BUG' | 'IMPROVEMENT' | 'NEW_FEATURE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  projectId: number;
  projectName: string;
  reporterId: number;
  reporterName: string;
  assigneeId?: number;
  assigneeName?: string;
  releaseId?: number;
  releaseName?: string;
  dueDate?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueCreateRequest {
  srId?: number;
  specId?: number;
  title: string;
  content: string;
  assigneeId?: number;
  reporterId?: number;
  parentIssueId?: number;
}

export interface IssueUpdateRequest {
  title?: string;
  description?: string;
  issueType?: 'BUG' | 'IMPROVEMENT' | 'NEW_FEATURE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assigneeId?: number;
  releaseId?: number;
  dueDate?: string;
}

export interface IssueListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  priority?: string;
  issueType?: string;
  projectId?: number;
  assigneeId?: number;
  search?: string;
}





