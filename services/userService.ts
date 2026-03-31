import api from "@/services/api/api";
import { UserMeResponse } from "@/domain/types/userMe";
import {
  CreateUserPayload,
  DomainProfile,
  UpdateUserPayload,
  UserListItem,
} from "@/domain/types/userManagement";

export const userService = {
  getCurrentUser() {
    return api.get<UserMeResponse>("/users/me");
  },

  findAll() {
    return api.get<UserListItem[]>("/users/find-all");
  },

  findById(id: number) {
    return api.get<UserListItem>(`/users/find-by-id/${id}`);
  },

  create(payload: CreateUserPayload) {
    return api.post<void>("/users/create", payload);
  },

  update(id: number, payload: UpdateUserPayload) {
    return api.patch<void>(`/users/patch/${id}`, payload);
  },

  deleteById(id: number) {
    return api.delete<void>(`/users/delete-by-id/${id}`);
  },

  reactivateById(id: number) {
    return api.patch<void>(`/users/reactivate/${id}`);
  },

  findAllProfiles() {
    return api.get<DomainProfile[]>("/profiles/find-all");
  },
};
