import { TargetPayload, TargetResponse } from "@/domain/types/target";
import {
  TargetFormErrors,
  TargetFormState,
  createEmptyTargetForm,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(types)/targetForm";
import {
  formatDateToBackend,
  formatDateToDisplay,
  isValidCpf,
  maskCpf,
  unmaskCpf,
} from "@/utils/formatters";

export const normalizeTargetResponseToForm = (target: TargetResponse): TargetFormState => ({
  fullName: target.fullName ?? "",
  cpf: maskCpf(target.cpf),
  birthDate: formatDateToDisplay(target.birthDate),
  motherName: target.motherName ?? "",
});

export const validateTargetForm = (form: TargetFormState): TargetFormErrors => {
  const errors: TargetFormErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Informe o nome do alvo";
  }

  const cpfDigits = unmaskCpf(form.cpf);
  if (!cpfDigits) {
    errors.cpf = "Informe o CPF";
  } else if (cpfDigits.length !== 11 || !isValidCpf(form.cpf)) {
    errors.cpf = "CPF inválido";
  }

  if (form.birthDate) {
    const formattedBirthDate = formatDateToBackend(form.birthDate);
    if (!formattedBirthDate) {
      errors.birthDate = "Data de nascimento inválida";
    }
  }

  return errors;
};

export const buildTargetPayload = (form: TargetFormState): TargetPayload => ({
  fullName: form.fullName.trim(),
  cpf: unmaskCpf(form.cpf),
  motherName: form.motherName.trim() ? form.motherName.trim() : null,
  birthDate: formatDateToBackend(form.birthDate),
});

export { createEmptyTargetForm };