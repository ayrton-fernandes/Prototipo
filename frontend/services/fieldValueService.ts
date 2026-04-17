import api from "@/services/api/api";
import { FieldValuePayload, FieldValueResponse, FieldValueUpdatePayload } from "@/domain/types/fieldValue";

const baseUrl = "/operations";

export const fieldValueService = {
  create(operationId: number, targetId: number, entryId: number, payload: FieldValuePayload) {
    return api.post<void>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values`, payload);
  },

  findAll(operationId: number, targetId: number, entryId: number) {
    return api.get<FieldValueResponse[]>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values`);
  },

  update(operationId: number, targetId: number, entryId: number, fieldValueId: number, payload: FieldValueUpdatePayload) {
    return api.patch<void>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values/${fieldValueId}`, payload);
  },

  delete(operationId: number, targetId: number, entryId: number, fieldValueId: number) {
    return api.delete<void>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values/${fieldValueId}`);
  },
};
