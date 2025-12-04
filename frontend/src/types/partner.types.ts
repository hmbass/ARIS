// 파트너 관련 타입 정의

export interface Partner {
  id: number;
  name: string;
  businessNumber: string;
  ceoName?: string;
  address?: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  managerId?: number;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerCreateRequest {
  name: string;
  businessNumber: string;
  ceoName?: string;
  address?: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  managerId?: number;
}

export interface PartnerUpdateRequest {
  name?: string;
  businessNumber?: string;
  ceoName?: string;
  address?: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  managerId?: number;
  isActive?: boolean;
}

export interface PartnerListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  search?: string;
}







