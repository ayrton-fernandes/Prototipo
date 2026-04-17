import api from "@/services/api/api";
import {
  OperationMemberCreatePayload,
  OperationMemberResponse,
  OperationMemberUpdatePermissionPayload,
} from "@/domain/types/operationMember";

const baseUrl = "/operation";

export const operationMemberService = {
  findAll(operationId: number) {
    return api.get<OperationMemberResponse[]>(`${baseUrl}/${operationId}/member`);
  },

  create(operationId: number, payload: OperationMemberCreatePayload) {
    return api.post<void>(`${baseUrl}/${operationId}/member`, payload);
  },

  updatePermission(operationId: number, userId: number, payload: OperationMemberUpdatePermissionPayload) {
    return api.patch<void>(`${baseUrl}/${operationId}/member/${userId}/permission`, payload);
  },

  delete(operationId: number, userId: number) {
    return api.delete<void>(`${baseUrl}/${operationId}/member/${userId}`);
  },
};
