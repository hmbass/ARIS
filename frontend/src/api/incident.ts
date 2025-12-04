import apiClient from '../utils/api';
import type { Incident, IncidentCreateRequest, IncidentUpdateRequest, IncidentListParams } from '../types/incident.types';
import type { PageResponse } from '../types/common.types';

export const getIncidents = async (params: IncidentListParams): Promise<PageResponse<Incident>> => {
  const response = await apiClient.get<PageResponse<Incident>>('/incidents', { params });
  return response.data;
};

export const getIncident = async (id: number): Promise<Incident> => {
  const response = await apiClient.get<Incident>(`/incidents/${id}`);
  return response.data;
};

export const createIncident = async (data: IncidentCreateRequest): Promise<Incident> => {
  const response = await apiClient.post<Incident>('/incidents', data);
  return response.data;
};

export const updateIncident = async (id: number, data: IncidentUpdateRequest): Promise<Incident> => {
  const response = await apiClient.put<Incident>(`/incidents/${id}`, data);
  return response.data;
};

export const deleteIncident = async (id: number): Promise<void> => {
  await apiClient.delete(`/incidents/${id}`);
};







