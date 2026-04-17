import api from "@/services/api/api";
import { BaseResponseDTO } from "@/domain/types/base";

const baseUrl = "/info-category";

export const domainInfoCategoryService = {
  findAll() {
    return api.get<BaseResponseDTO[]>(`${baseUrl}/find-all`);
  },

  findById(id: number) {
    return api.get<BaseResponseDTO>(`${baseUrl}/find-by-id/${id}`);
  },
};
