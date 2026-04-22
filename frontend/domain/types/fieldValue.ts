export interface FieldValueResponse {
  id: number;
  entryId: number;
  templateFieldId: number | null;
  customFieldId: number | null;
  groupInstanceId: string | null;
  valueContent: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FieldValuePayload {
  templateFieldId: number | null;
  customFieldId: number | null;
  groupInstanceId: string | null;
  valueContent: string;
}

export interface FieldValueUpdatePayload {
  templateFieldId: number | null;
  customFieldId: number | null;
  groupInstanceId: string | null;
  valueContent: string;
}

export interface FieldValueMediaResponse {
  fieldValueId: number;
  mediaFileId: number;
  mediaUrl: string;
  storageKey: string;
}

export interface FieldValueMediaUploadPayload {
  templateFieldId: number | null;
  customFieldId: number | null;
  groupInstanceId: string | null;
  file: File;
}
