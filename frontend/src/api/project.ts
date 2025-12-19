import apiClient from '../utils/api';
import type { Project, ProjectRequest, ProjectListParams, Company } from '../types/project.types';
import type { PageResponse } from '../types/common.types';

// 프로젝트 목록 조회
export const getProjects = async (
  params: ProjectListParams
): Promise<PageResponse<Project>> => {
  const response = await apiClient.get<PageResponse<Project>>('/projects', { params });
  return response.data;
};

// 프로젝트 상세 조회
export const getProject = async (id: number): Promise<Project> => {
  const response = await apiClient.get<Project>(`/projects/${id}`);
  return response.data;
};

// 프로젝트 등록
export const createProject = async (data: ProjectRequest): Promise<Project> => {
  const response = await apiClient.post<Project>('/projects', data);
  return response.data;
};

// 프로젝트 수정
export const updateProject = async (id: number, data: ProjectRequest): Promise<Project> => {
  const response = await apiClient.put<Project>(`/projects/${id}`, data);
  return response.data;
};

// 프로젝트 삭제
export const deleteProject = async (id: number): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};

// 프로젝트 상태 변경
export const updateProjectStatus = async (
  id: number,
  status: string
): Promise<Project> => {
  const response = await apiClient.put<Project>(`/projects/${id}/status`, { status });
  return response.data;
};

// 회사 목록 조회
export const getCompanies = async (): Promise<Company[]> => {
  const response = await apiClient.get<Company[]>('/companies');
  return response.data;
};

// PM 후보 사용자 목록 조회
export interface PmCandidate {
  id: number;
  email: string;
  name: string;
  position?: string;
}

export const getPmCandidates = async (): Promise<PageResponse<PmCandidate>> => {
  const response = await apiClient.get<PageResponse<PmCandidate>>('/projects/pm-candidates', {
    params: { page: 0, size: 1000 }
  });
  return response.data;
};



