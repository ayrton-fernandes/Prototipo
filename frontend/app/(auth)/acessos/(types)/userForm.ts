import { UserRole } from "@/domain/types/userManagement";

export interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: UserRole | "";
}

export interface UserFormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface ProfileOption {
  label: string;
  value: UserRole;
}
