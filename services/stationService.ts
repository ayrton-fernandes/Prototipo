
import { BaseCreateDTO, BaseResponseDTO, BaseUpdateDTO } from "@/domain/types/base";
import api from "@/services/api/api";


const baseUrl = "/station";

export const stationService = {
    findAll() {
        return api.get<BaseResponseDTO[]>(`${baseUrl}/find-all`);
    },

    findById(id: number) {
        return api.get<BaseResponseDTO>(`${baseUrl}/find-by-id/${id}`);
    },

    create(payload: BaseCreateDTO) {
        return api.post<void>(`${baseUrl}/create`, payload);
    },

    update(id: number, payload: BaseUpdateDTO) {
        return api.patch<void>(`${baseUrl}/patch/${id}`, payload);
    },

    deleteById(id: number) {
        return api.delete<void>(`${baseUrl}/delete/${id}`);
    },

    reactivateById(id: number) {
        return api.patch<void>(`${baseUrl}/reactivate/${id}`);
    },
};