export interface TargetResponse {
  id: number;
  fullName: string;
  cpf: string;
  motherName: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TargetPayload {
  fullName: string;
  cpf: string;
  motherName: string | null;
  birthDate: string | null;
}
