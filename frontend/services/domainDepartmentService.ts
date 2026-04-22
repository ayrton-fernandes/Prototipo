
import { BaseCreateDTO, BaseResponseDTO, BaseUpdateDTO } from "@/domain/types/base";
import api from "@/services/api/api";


const baseUrl = "/departments";

export const domainDepartmentService = {
    findAll() {
        return api.get<BaseResponseDTO[]>(`${baseUrl}`);
    },

    findById(id: number) {
        return api.get<BaseResponseDTO>(`${baseUrl}/${id}`);
    },

    create(payload: BaseCreateDTO) {
        return api.post<void>(`${baseUrl}`, payload);
    },

    update(id: number, payload: BaseUpdateDTO) {
        return api.patch<void>(`${baseUrl}/${id}`, payload);
    },

    deleteById(id: number) {
        return api.delete<void>(`${baseUrl}/${id}`);
    },

    reactivateById(id: number) {
        return api.put<void>(`${baseUrl}/${id}/activation`);
    },
};