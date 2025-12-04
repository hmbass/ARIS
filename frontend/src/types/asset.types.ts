// 자산 관리 관련 타입 정의

export interface Asset {
  id: number;
  name: string;
  assetType: 'SERVER' | 'NETWORK' | 'SOFTWARE' | 'LICENSE' | 'ETC';
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  status: 'IN_USE' | 'AVAILABLE' | 'MAINTENANCE' | 'RETIRED';
  location?: string;
  managerId?: number;
  managerName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCreateRequest {
  assetType: 'PC' | 'LAPTOP' | 'MONITOR' | 'SERVER' | 'NETWORK';
  serialNumber?: string;
  acquiredAt?: string;
  managerId?: number;
}

export interface AssetUpdateRequest {
  name?: string;
  assetType?: 'SERVER' | 'NETWORK' | 'SOFTWARE' | 'LICENSE' | 'ETC';
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  status?: 'IN_USE' | 'AVAILABLE' | 'MAINTENANCE' | 'RETIRED';
  location?: string;
  managerId?: number;
  notes?: string;
}

export interface AssetListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  assetType?: string;
  search?: string;
}





