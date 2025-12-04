// 인증 관련 타입 정의

export interface User {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  companyName?: string;
  departmentName?: string;
  employeeNumber?: string;
  position?: string;
  isActive?: boolean;
  isApproved?: boolean;
  isLocked?: boolean;
  passwordChangeRequired?: boolean;
  roles?: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}







