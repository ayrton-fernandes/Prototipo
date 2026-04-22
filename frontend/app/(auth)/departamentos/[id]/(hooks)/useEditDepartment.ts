"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { domainDepartmentService } from "@/services/domainDepartmentService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { DepartmentFormErrors, DepartmentFormState } from "@/app/(auth)/departamentos/(types)/departmentForm";

export function useEditDepartment(departmentId: number) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<DepartmentFormState>({
    descName: "",
  });
  const [errors, setErrors] = useState<DepartmentFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [originalIsActive, setOriginalIsActive] = useState(true);
  const [selectedIsActive, setSelectedIsActive] = useState(true);

  const validate = useCallback((data: DepartmentFormState): DepartmentFormErrors => {
    const nextErrors: DepartmentFormErrors = {};
    if (!data.descName.trim()) nextErrors.descName = "Nome é obrigatório";
    return nextErrors;
  }, []);

  const loadDepartment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await domainDepartmentService.findById(departmentId);
      const department = response.data;

      setForm({
        descName: department.descName,
      });
      setOriginalIsActive(department.active);
      setSelectedIsActive(department.active);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao carregar departamento",
          detail: "Não foi possível carregar os dados para edição.",
        })
      );
      router.push("/departamentos");
    } finally {
      setLoading(false);
    }
  }, [departmentId, dispatch, router]);

  useEffect(() => {
    if (!Number.isNaN(departmentId)) {
      loadDepartment();
    }
  }, [loadDepartment, departmentId]);

  const handleChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, descName: value }));
  }, []);

  const submit = useCallback(async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const hasStatusChange = selectedIsActive !== originalIsActive;
    if (hasStatusChange) setStatusLoading(true);

    try {
      const needsReactivateBefore = !originalIsActive && selectedIsActive;

      if (needsReactivateBefore) {
        await domainDepartmentService.reactivateById(departmentId);
        setOriginalIsActive(true);
      }

      await domainDepartmentService.update(departmentId, {
        descName: form.descName.trim(),
      });

      if (hasStatusChange && !needsReactivateBefore) {
        if (selectedIsActive) {
          await domainDepartmentService.reactivateById(departmentId);
        } else {
          await domainDepartmentService.deleteById(departmentId);
        }
        setOriginalIsActive(selectedIsActive);
      }

      dispatch(
        showToast({
          severity: "success",
          summary: "Departamento atualizado",
          detail: "As alterações foram salvas com sucesso.",
        })
      );

      router.push("/departamentos");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha na atualização",
          detail: "Não foi possível atualizar o departamento.",
        })
      );
    } finally {
      setSaving(false);
      setStatusLoading(false);
    }
  }, [departmentId, dispatch, form, originalIsActive, router, selectedIsActive, validate]);

  const setDepartmentStatus = useCallback((nextActive: boolean) => {
    setSelectedIsActive(nextActive);
  }, []);

  return {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive: selectedIsActive,
    handleChange,
    submit,
    setDepartmentStatus,
  };
}
