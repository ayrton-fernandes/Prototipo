export type UserRole = "ADMIN" | "INTELLIGENCE" | "PLANNING" | "INVESTIGATION";

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  profileCodes: string[];
  active: boolean;
}

export interface DomainProfile {
  id: number;
  descName: string;
  codeName: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}