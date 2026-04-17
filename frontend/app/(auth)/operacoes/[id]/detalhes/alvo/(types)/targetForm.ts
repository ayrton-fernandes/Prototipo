export interface TargetFormState {
  fullName: string;
  cpf: string;
  birthDate: string;
  motherName: string;
}

export interface TargetFormErrors {
  fullName?: string;
  cpf?: string;
  birthDate?: string;
  motherName?: string;
}

export type TargetFormField = keyof TargetFormState;

export const createEmptyTargetForm = (): TargetFormState => ({
  fullName: "",
  cpf: "",
  birthDate: "",
  motherName: "",
});