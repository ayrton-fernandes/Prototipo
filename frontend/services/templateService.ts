import api from "@/services/api/api";
import { TemplateResponse } from "@/domain/types/template";

const baseUrl = "/template";

export const templateService = {
  findAll() {
    return api.get<TemplateResponse[]>(baseUrl);
  },

  findById(id: number) {
    return api.get<TemplateResponse>(`${baseUrl}/${id}`);
  },
};
