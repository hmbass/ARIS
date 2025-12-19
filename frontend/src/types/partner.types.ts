// 파트너 관련 타입 정의

export interface Partner {
  id: number;
  code: string;
  name: string;
  businessNumber: string;
  ceoName?: string;
  isClosed: boolean;
  closedAt?: string;
  managerId?: number;
  managerName?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PartnerCreateRequest {
  name: string;
  businessNumber: string;
  ceoName?: string;
  managerId?: number;
}

export interface PartnerUpdateRequest {
  name: string;
  businessNumber: string;
  ceoName?: string;
  managerId?: number;
}

export interface PartnerListParams {
  page?: number;
  size?: number;
  name?: string;
  isClosed?: boolean;
}







