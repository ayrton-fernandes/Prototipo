"use client";

import EntityForm from "@/components/EntityForm";
import { DirectorateFormErrors, DirectorateFormState } from "@/app/(auth)/diretorias/(types)/directorateForm";

interface DirectorateFormProps {
  title: string;
  submitLabel: string;
  form: DirectorateFormState;
  errors: DirectorateFormErrors;
  loading: boolean;
  showStatusControls?: boolean;
  isActive?: boolean;
  statusLoading?: boolean;
  onStatusChange?: (nextActive: boolean) => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function DirectorateForm({
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
}: DirectorateFormProps) {
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
      nameLabel="Nome da diretoria"
      namePlaceholder="Digite o nome da diretoria"
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
