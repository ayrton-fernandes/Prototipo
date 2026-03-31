"use client";

import EntityForm from "@/components/EntityForm";
import { StationFormErrors, StationFormState } from "@/app/(auth)/delegacias/(types)/stationForm";

interface StationFormProps {
  title: string;
  submitLabel: string;
  form: StationFormState;
  errors: StationFormErrors;
  loading: boolean;
  showStatusControls?: boolean;
  isActive?: boolean;
  statusLoading?: boolean;
  onStatusChange?: (nextActive: boolean) => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function StationForm({
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
}: StationFormProps) {
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
      nameLabel="Nome da delegacia"
      namePlaceholder="Digite o nome da delegacia"
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
