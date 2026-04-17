"use client";

import { ChangeEvent } from "react";
import { Button, InputText, Typography } from "@uigovpe/components";
import { maskCpf, maskDateInput } from "@/utils/formatters";
import {
  TargetFormErrors,
  TargetFormField,
  TargetFormState,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(types)/targetForm";

interface TargetFormProps {
  title?: string;
  submitLabel?: string;
  form: TargetFormState;
  errors: TargetFormErrors;
  loading: boolean;
  onChange: <K extends TargetFormField>(field: K, value: TargetFormState[K]) => void;
  onSubmit: () => void;
}

export default function TargetForm({ title, submitLabel, form, errors, loading, onChange, onSubmit }: TargetFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {title ? (
        <Typography variant="h4" className="text-white">
          {title}
        </Typography>
      ) : null}

      <InputText
        label="Nome do Alvo:"
        placeholder="Nome completo"
        value={form.fullName ?? ""}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange("fullName", event.target.value)}
        invalid={!!errors.fullName}
        supportText={errors.fullName}
        disabled={loading}
      />

      <InputText
        label="CPF:"
        placeholder="000.000.000-00"
        value={form.cpf ?? ""}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange("cpf", maskCpf(event.target.value))}
        invalid={!!errors.cpf}
        supportText={errors.cpf}
        disabled={loading}
      />

      <InputText
        label="Data de Nascimento:"
        placeholder="dd/mm/yyyy"
        value={form.birthDate ?? ""}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange("birthDate", maskDateInput(event.target.value))}
        invalid={!!errors.birthDate}
        supportText={errors.birthDate}
        disabled={loading}
      />

      <InputText
        label="Nome da Mãe:"
        placeholder="Nome da mãe"
        value={form.motherName ?? ""}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange("motherName", event.target.value)}
        invalid={!!errors.motherName}
        supportText={errors.motherName}
        disabled={loading}
      />

      <div className="flex justify-end">
        <Button label={submitLabel ?? "Avançar"} onClick={onSubmit} loading={loading} />
      </div>
    </div>
  );
}
