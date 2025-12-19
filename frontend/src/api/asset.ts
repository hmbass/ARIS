import apiClient from '../utils/api';
import type { Asset, AssetCreateRequest, AssetUpdateRequest, AssetListParams } from '../types/asset.types';
import type { PageResponse } from '../types/common.types';

export const getAssets = async (params: AssetListParams): Promise<PageResponse<Asset>> => {
  const response = await apiClient.get<PageResponse<Asset>>('/assets', { params });
  return response.data;
};

export const getAsset = async (id: number): Promise<Asset> => {
  const response = await apiClient.get<Asset>(`/assets/${id}`);
  return response.data;
};

export const createAsset = async (data: AssetCreateRequest): Promise<Asset> => {
  const response = await apiClient.post<Asset>('/assets', data);
  return response.data;
};

export const updateAsset = async (id: number, data: AssetUpdateRequest): Promise<Asset> => {
  const response = await apiClient.put<Asset>(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id: number): Promise<void> => {
  await apiClient.delete(`/assets/${id}`);
};

export const expireAsset = async (id: number): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/expire`);
  return response.data;
};

export const restoreAsset = async (id: number): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/restore`);
  return response.data;
};







