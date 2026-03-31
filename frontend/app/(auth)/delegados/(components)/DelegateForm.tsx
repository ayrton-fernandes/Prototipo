"use client";

import EntityForm from "@/components/EntityForm";
import { DelegateFormErrors, DelegateFormState } from "@/app/(auth)/delegados/(types)/delegateForm";

interface DelegateFormProps {
  title: string;
  submitLabel: string;
  form: DelegateFormState;
  errors: DelegateFormErrors;
  loading: boolean;
  showStatusControls?: boolean;
  isActive?: boolean;
  statusLoading?: boolean;
  onStatusChange?: (nextActive: boolean) => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function DelegateForm({
  title,
  submitLabel,
  form,
  errors,
  loading,
  showStatusControls = false,
  isActive = true,
  statusLoading = false,
  onStatusChange,
  onChange,
  onSubmit,
}: DelegateFormProps) {
  return (
    <EntityForm
      title={title}
      submitLabel={submitLabel}
      form={form}
      errors={errors}
      loading={loading}
      showStatusControls={showStatusControls}
      isActive={isActive}
      statusLoading={statusLoading}
      onStatusChange={onStatusChange}
      nameLabel="Nome do delegado"
      namePlaceholder="Digite o nome do delegado"
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
