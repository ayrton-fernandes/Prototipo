export interface OperationTarget {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  imageUrl?: string;
}

export interface OperationMemberRow {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  active: boolean;
}
