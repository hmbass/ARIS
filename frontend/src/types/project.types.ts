// 프로젝트 관련 타입 정의

export type ProjectType = 'SI' | 'SM';
export type ProjectStatus = 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: number;
  code: string;
  name: string;
  projectType: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  companyId: number;
  companyName: string;
  description?: string;
  budget?: number;
  pmId?: number;
  pmName?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ProjectRequest {
  code: string;
  name: string;
  projectType: ProjectType;
  startDate: string;
  endDate?: string;
  companyId: number;
  description?: string;
  budget?: number;
  pmId?: number;
}

export interface ProjectListParams {
  page?: number;
  size?: number;
  name?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface Company {
  id: number;
  name: string;
  businessNumber?: string;
  ceoName?: string;
  address?: string;
  phoneNumber?: string;
}







