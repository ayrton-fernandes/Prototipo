export interface CustomFieldResponse {
  id: number;
  entryId: number;
  label: string;
  inputType: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldPayload {
  label: string;
  inputType: string;
}
