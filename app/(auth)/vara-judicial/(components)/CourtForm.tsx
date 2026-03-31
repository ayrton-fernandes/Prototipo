"use client";

import EntityForm from "@/components/EntityForm";
import { CourtFormErrors, CourtFormState } from "@/app/(auth)/vara-judicial/(types)/courtForm";

interface CourtFormProps {
  title: string;
  submitLabel: string;
  form: CourtFormState;
  errors: CourtFormErrors;
  loading: boolean;
  showStatusControls?: boolean;
  isActive?: boolean;
  statusLoading?: boolean;
  onStatusChange?: (nextActive: boolean) => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function CourtForm({
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
}: CourtFormProps) {
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
      nameLabel="Nome da vara"
      namePlaceholder="Digite o nome da vara judicial"
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
