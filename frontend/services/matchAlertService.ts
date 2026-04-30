import api from "@/services/api/api";

export interface MatchAlertResponse {
  id: number;
  targetId: number;
  originOperationId: number | null;
  requesterUserId: number | null;
  matchType: string;
  matchKey: string;
  status: string;
  detectedAt: string | null;
  resolvedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface MatchAlertCreatePayload {
  targetId: number;
  matchType: string;
  matchKey: string;
}

const baseUrl = "/match-alerts";

export const matchAlertService = {
  findAll() {
    return api.get<MatchAlertResponse[]>(baseUrl);
  },

  findById(id: number) {
    return api.get<MatchAlertResponse>(`${baseUrl}/${id}`);
  },

  create(payload: MatchAlertCreatePayload) {
    return api.post<number>(baseUrl, payload);
  },

  delete(id: number) {
    return api.delete<void>(`${baseUrl}/${id}`);
  },
};