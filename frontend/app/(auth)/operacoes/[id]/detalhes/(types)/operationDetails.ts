import { OperationMemberPermission } from "@/domain/types/operationMember";

export interface OperationTarget {
  id: number;
  fullName: string;
  cpf: string;
  birthDate: string;
  imageUrl?: string;
}

export interface OperationMemberRow {
  id: number;
  name: string;
  email: string;
  role: string;
  permission: OperationMemberPermission;
  permissionLabel: string;
  active: boolean;
}
