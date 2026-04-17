export interface PaginatedResponse<T> {
  content: T[];
  pageable?: unknown;
  last?: boolean;
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  sort?: unknown;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}
