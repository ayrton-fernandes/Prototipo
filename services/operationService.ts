import api from "@/services/api/api";
import { OperationPayload, OperationResponse } from "@/domain/types/operation";

const baseUrl = "/operation";

export const operationService = {
  findAll() {
    return api.get<OperationResponse[]>(`${baseUrl}/find-all`);
  },

  findById(id: number) {
    return api.get<OperationResponse>(`${baseUrl}/find-by-id/${id}`);
  },

  create(payload: OperationPayload) {
    return api.post<void>(`${baseUrl}/create`, payload);
  },

  update(id: number, payload: OperationPayload) {
    return api.patch<void>(`${baseUrl}/patch/${id}`, payload);
  },

  deleteById(id: number) {
    return api.delete<void>(`${baseUrl}/delete-by-id/${id}`);
  },

  reactivateById(id: number) {
    return api.patch<void>(`${baseUrl}/reactivate/${id}`);
  },
};