// SR 관련 타입 정의

export interface ServiceRequest {
  id: number;
  srNumber: string;
  title: string;
  description: string;
  srType: 'DEVELOPMENT' | 'OPERATION';
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  requestorId: number;
  requestorName: string;
  projectId: number;
  projectName: string;
  expectedDate?: string;
  completedDate?: string;
  estimatedManday?: number;
  actualManday?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SrCreateRequest {
  title: string;
  description: string;
  srType: 'DEVELOPMENT' | 'OPERATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: number;
  expectedDate?: string;
  estimatedManday?: number;
}

export interface SrUpdateRequest {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  expectedDate?: string;
  estimatedManday?: number;
}

export interface SrListParams {
  page?: number;
  size?: number;
  srType?: 'DEVELOPMENT' | 'OPERATION';
  status?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId?: number;
  requestorId?: number;
}





