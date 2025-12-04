import apiClient from '../utils/api';
import type { Issue, IssueCreateRequest, IssueUpdateRequest, IssueListParams } from '../types/issue.types';
import type { PageResponse } from '../types/common.types';

export const getIssues = async (params: IssueListParams): Promise<PageResponse<Issue>> => {
  const response = await apiClient.get<PageResponse<Issue>>('/issues', { params });
  return response.data;
};

export const getIssue = async (id: number): Promise<Issue> => {
  const response = await apiClient.get<Issue>(`/issues/${id}`);
  return response.data;
};

export const createIssue = async (data: IssueCreateRequest): Promise<Issue> => {
  const response = await apiClient.post<Issue>('/issues', data);
  return response.data;
};

export const updateIssue = async (id: number, data: IssueUpdateRequest): Promise<Issue> => {
  const response = await apiClient.put<Issue>(`/issues/${id}`, data);
  return response.data;
};

export const deleteIssue = async (id: number): Promise<void> => {
  await apiClient.delete(`/issues/${id}`);
};







