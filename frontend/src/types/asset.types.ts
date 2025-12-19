// 자산 관리 관련 타입 정의

export type AssetType = 'PC' | 'LAPTOP' | 'MONITOR' | 'SERVER' | 'NETWORK' | 'PRINTER' | 'OTHER';

export interface Asset {
  id: number;
  assetNumber: string;
  assetType: AssetType;
  serialNumber?: string;
  acquiredAt: string;
  isExpired: boolean;
  expiredAt?: string;
  managerId?: number;
  managerName?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AssetCreateRequest {
  assetType: AssetType;
  serialNumber?: string;
  acquiredAt: string;
  managerId?: number;
}

export interface AssetUpdateRequest {
  assetType: AssetType;
  serialNumber?: string;
  managerId?: number;
}

export interface AssetListParams {
  page?: number;
  size?: number;
  assetType?: AssetType;
  isExpired?: boolean;
}





