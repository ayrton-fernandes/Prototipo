export interface InfoEntryResponse {
  id: number;
  targetId: number;
  categoryId: number | null;
  templateId: number;
  operationId: number;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InfoEntryPayload {
  categoryId: number | null;
  templateId: number;
}
