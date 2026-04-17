export type TemplateFieldKind = "GRUPO" | "TEXTO" | "DROPDOWN" | "DATA" | "NUMERICO" | "INPUT";

export interface TemplateFieldResponse {
  id: number;
  templateId: number;
  parentFieldId: number | null;
  label: string;
  inputType: string;
  fixed: boolean;
  required: boolean;
  orderIndex: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
