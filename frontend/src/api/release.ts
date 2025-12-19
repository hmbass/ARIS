import apiClient from '../utils/api';
import type { Release, ReleaseCreateRequest, ReleaseUpdateRequest, ReleaseListParams } from '../types/release.types';
import type { PageResponse } from '../types/common.types';

export const getReleases = async (params: ReleaseListParams): Promise<PageResponse<Release>> => {
  const response = await apiClient.get<PageResponse<Release>>('/releases', { params });
  return response.data;
};

export const getRelease = async (id: number): Promise<Release> => {
  const response = await apiClient.get<Release>(`/releases/${id}`);
  return response.data;
};

export const createRelease = async (data: ReleaseCreateRequest): Promise<Release> => {
  const response = await apiClient.post<Release>('/releases', data);
  return response.data;
};

export const updateRelease = async (id: number, data: ReleaseUpdateRequest): Promise<Release> => {
  const response = await apiClient.put<Release>(`/releases/${id}`, data);
  return response.data;
};

export const deleteRelease = async (id: number): Promise<void> => {
  await apiClient.delete(`/releases/${id}`);
};

export const approveRelease = async (id: number): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/approve`);
  return response.data;
};

export const deployRelease = async (id: number): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/deploy`);
  return response.data;
};

export const cancelRelease = async (id: number): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/cancel`);
  return response.data;
};

export const getApprovableReleases = async (): Promise<Release[]> => {
  const response = await apiClient.get<Release[]>('/releases/approvable');
  return response.data;
};







