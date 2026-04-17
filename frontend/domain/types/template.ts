export interface TemplateResponse {
  id: number;
  name: string;
  domainTemplateTypeId: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePayload {
  name: string;
  domainTemplateTypeId: number;
}
