import api from "@/services/api/api";
import { OperationPayload, OperationResponse } from "@/domain/types/operation";

const baseUrl = "/operations";

export const operationService = {
  findAll() {
    return api.get<OperationResponse[]>(`${baseUrl}`);
  },

  findById(id: number) {
    return api.get<OperationResponse>(`${baseUrl}/${id}`);
  },

  create(payload: OperationPayload) {
    return api.post<void>(`${baseUrl}`, payload);
  },

  update(id: number, payload: OperationPayload) {
    return api.patch<void>(`${baseUrl}/${id}`, payload);
  },

  deleteById(id: number) {
    return api.delete<void>(`${baseUrl}/${id}`);
  },

  reactivateById(id: number) {
    return api.put<void>(`${baseUrl}/${id}/activation`);
  },
  inPlanningById(id: number) {
    return api.put<void>(`${baseUrl}/${id}/in-planning`);
  },
};