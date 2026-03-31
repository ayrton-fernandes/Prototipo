"use client";

import EntityForm from "@/components/EntityForm";
import { DepartmentFormErrors, DepartmentFormState } from "@/app/(auth)/departamentos/(types)/departmentForm";

interface DepartmentFormProps {
  title: string;
  submitLabel: string;
  form: DepartmentFormState;
  errors: DepartmentFormErrors;
  loading: boolean;
  showStatusControls?: boolean;
  isActive?: boolean;
  statusLoading?: boolean;
  onStatusChange?: (nextActive: boolean) => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function DepartmentForm({
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
}: DepartmentFormProps) {
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
      nameLabel="Nome do departamento"
      namePlaceholder="Digite o nome do departamento"
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
