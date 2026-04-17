import type { PaginatedResponse } from "@/domain/types/paginatedResponse";

export const extractPaginatedItems = <T>(response: PaginatedResponse<T> | T[] | null | undefined): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.content ?? [];
};
