import api from "@/services/api/api";

export interface ShareRequestCreatePayload {
  targetId: number;
}

const baseUrl = "/share-requests";

export const shareRequestService = {
  findAll() {
    return api.get(baseUrl);
  },

  findById(id: number) {
    return api.get(`${baseUrl}/${id}`);
  },

  create(payload: ShareRequestCreatePayload) {
    return api.post<number>(baseUrl, payload);
  },

  approve(id: number) {
    return api.put<void>(`${baseUrl}/${id}/approve`);
  },

  delete(id: number) {
    return api.delete<void>(`${baseUrl}/${id}`);
  },
};