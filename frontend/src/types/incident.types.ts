// 장애 관리 관련 타입 정의

export interface Incident {
  id: number;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  projectId: number;
  projectName: string;
  reporterId: number;
  reporterName: string;
  assigneeId?: number;
  assigneeName?: string;
  occurredAt: string;
  resolvedAt?: string;
  rootCause?: string;
  solution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentCreateRequest {
  title: string;
  incidentType: 'INCIDENT' | 'FAILURE';
  systemType: 'PROGRAM' | 'DATA' | 'SERVER' | 'NETWORK' | 'PC';
  businessArea?: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  occurredAt?: string;
  assigneeId?: number;
}

export interface IncidentUpdateRequest {
  title?: string;
  description?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  assigneeId?: number;
  resolvedAt?: string;
  rootCause?: string;
  solution?: string;
}

export interface IncidentListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  severity?: string;
  projectId?: number;
  assigneeId?: number;
  search?: string;
}





