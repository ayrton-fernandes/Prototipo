import api from "@/services/api/api";
import { UserMeResponse } from "@/domain/types/userMe";
import {
  CreateUserPayload,
  DomainProfile,
  UpdateUserPayload,
  UserListItem,
} from "@/domain/types/userManagement";


const baseUrl = "/users";

export const userService = {
  getCurrentUser() {
    return api.get<UserMeResponse>(`${baseUrl}/me`);
  },

  findAll() {
    return api.get<UserListItem[]>(`${baseUrl}` );
  },

  findById(id: number) {
    return api.get<UserListItem>(`${baseUrl}/${id}`);
  },

  create(payload: CreateUserPayload) {
    return api.post<void>(`${baseUrl}`, payload);
  },

  update(id: number, payload: UpdateUserPayload) {
    return api.patch<void>(`${baseUrl}/${id}`, payload);
  },

  deleteById(id: number) {
    return api.delete<void>(`${baseUrl}/${id}`);
  },

  reactivateById(id: number) {
    return api.put<void>(`${baseUrl}/${id}/activation`);
  },
};
