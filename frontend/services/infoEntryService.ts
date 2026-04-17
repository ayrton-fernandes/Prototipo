import api from "@/services/api/api";
import { InfoEntryPayload, InfoEntryResponse } from "@/domain/types/infoEntry";

const baseUrl = "/operation";

export const infoEntryService = {
  create(operationId: number, targetId: number, payload: InfoEntryPayload) {
    return api.post<void>(`${baseUrl}/${operationId}/target/${targetId}/info-entry`, payload);
  },

  findAllByTarget(operationId: number, targetId: number) {
    return api.get<InfoEntryResponse[]>(`${baseUrl}/${operationId}/target/${targetId}/info-entry`);
  },
};
