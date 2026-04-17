import api from "@/services/api/api";
import { CustomFieldPayload, CustomFieldResponse } from "@/domain/types/customField";

const baseUrl = "/operations";

export const customFieldService = {
  create(operationId: number, targetId: number, entryId: number, payload: CustomFieldPayload) {
    return api.post<void>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/custom-fields`, payload);
  },

  findAll(operationId: number, targetId: number, entryId: number) {
    return api.get<CustomFieldResponse[]>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/custom-fields`);
  },

  delete(operationId: number, targetId: number, entryId: number, customFieldId: number) {
    return api.delete<void>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/custom-fields/${customFieldId}`);
  },
};
