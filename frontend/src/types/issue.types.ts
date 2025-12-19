// 이슈 관리 관련 타입 정의

export type IssueType = 'BUG' | 'IMPROVEMENT' | 'NEW_FEATURE' | 'TASK';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Issue {
  id: number;
  issueNumber: string;
  srId?: number;
  srNumber?: string;
  specId?: number;
  specNumber?: string;
  projectId?: number;
  projectName?: string;
  title: string;
  content: string;
  issueType?: IssueType;
  priority?: string;
  status: IssueStatus;
  assigneeId?: number;
  assigneeName?: string;
  reporterId: number;
  reporterName: string;
  parentIssueId?: number;
  parentIssueNumber?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface IssueCreateRequest {
  srId?: number;
  specId?: number;
  projectId?: number;
  title: string;
  content: string;
  issueType?: IssueType;
  priority?: string;
  assigneeId?: number;
  parentIssueId?: number;
}

export interface IssueUpdateRequest {
  title?: string;
  content?: string;
  issueType?: IssueType;
  priority?: string;
  status?: IssueStatus;
  assigneeId?: number;
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
