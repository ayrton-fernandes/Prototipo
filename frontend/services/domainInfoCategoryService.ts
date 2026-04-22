import api from "@/services/api/api";
import { BaseResponseDTO } from "@/domain/types/base";

const baseUrl = "/info-categories";

export const domainInfoCategoryService = {
  findAll() {
    return api.get<BaseResponseDTO[]>(`${baseUrl}`);
  },

  findById(id: number) {
    return api.get<BaseResponseDTO>(`${baseUrl}/${id}`);
  },
};
