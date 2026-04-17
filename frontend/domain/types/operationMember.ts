export type OperationMemberPermission = "READER" | "COORDINATOR" | "EDITOR";

export interface OperationMemberResponse {
  operationId: number;
  userId: number;
  permission: OperationMemberPermission;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperationMemberCreatePayload {
  userId: number;
  permission: OperationMemberPermission;
}

export interface OperationMemberUpdatePermissionPayload {
  permission: OperationMemberPermission;
}
