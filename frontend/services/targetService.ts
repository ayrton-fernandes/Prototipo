import api from "@/services/api/api";
import { PaginatedResponse } from "@/domain/types/paginatedResponse";
import { TargetPayload, TargetResponse } from "@/domain/types/target";

const baseUrl = "/operation";

export const targetService = {
  create(operationId: number, payload: TargetPayload) {
    return api.post<void>(`${baseUrl}/${operationId}/target`, payload);
  },

  findAllByOperation(operationId: number) {
    return api.get<PaginatedResponse<TargetResponse>>(`${baseUrl}/${operationId}/target`);
  },

  findById(operationId: number, targetId: number) {
    return api.get<TargetResponse>(`${baseUrl}/${operationId}/target/${targetId}`);
  },

  update(operationId: number, targetId: number, payload: TargetPayload) {
    return api.patch<void>(`${baseUrl}/${operationId}/target/patch/${targetId}`, payload);
  },

  delete(operationId: number, targetId: number) {
    return api.delete<void>(`${baseUrl}/${operationId}/target/${targetId}`);
  },
};
