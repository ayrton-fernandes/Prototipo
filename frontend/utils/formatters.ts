// Utilitários para formatação de CPF e data
export function maskCpf(value: string | null | undefined): string {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "").slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);

  if (digits.length <= 3) return part1;
  if (digits.length <= 6) return `${part1}.${part2}`;
  if (digits.length <= 9) return `${part1}.${part2}.${part3}`;
  return `${part1}.${part2}.${part3}-${part4}`;
}

export function unmaskCpf(value: string | null | undefined): string {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
}

// Recebe uma string no formato yyyy-mm-dd ou ISO e retorna dd/mm/yyyy
export function formatDateToDisplay(value: string | null | undefined): string {
  if (!value) return "";
  const dateOnly = String(value).split("T")[0];
  const parts = dateOnly.split("-");
  if (parts.length !== 3) return String(value);
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
}

// Recebe dd/mm/yyyy (ou qualquer string com 8 dígitos) e retorna yyyy-mm-dd ou null se inválido
export function formatDateToBackend(display: string | null | undefined): string | null {
  if (!display) return null;
  const digits = String(display).replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

// Formata entrada de data enquanto o usuário digita para dd/mm/yyyy
export function maskDateInput(value: string | null | undefined): string {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "").slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  if (digits.length <= 2) return dd;
  if (digits.length <= 4) return `${dd}/${mm}`;
  return `${dd}/${mm}/${yyyy}`;
}

// Validação de CPF (retorna true se CPF válido)
export function isValidCpf(value: string | null | undefined): boolean {
  if (!value) return false;
  const cpf = String(value).replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcCheckDigit = (cpfSlice: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < cpfSlice.length; i++) {
      total += Number(cpfSlice.charAt(i)) * (factor - i);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const first = calcCheckDigit(cpf.slice(0, 9), 10);
  const second = calcCheckDigit(cpf.slice(0, 10), 11);
  return first === Number(cpf.charAt(9)) && second === Number(cpf.charAt(10));
}
