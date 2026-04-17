import api from "@/services/api/api";
import { TemplateFieldResponse } from "@/domain/types/templateField";

const baseUrl = "/template";

export const templateFieldService = {
  findAll(templateId: number) {
    return api.get<TemplateFieldResponse[]>(`${baseUrl}/${templateId}/field`);
  },
};
